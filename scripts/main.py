import json
import math
import os
from datetime import datetime, timedelta
from typing import cast

import numpy as np
import osrparse
import slider
from osrparse import KeyTaiko, Replay
from slider import Beatmap

ONE_MS = timedelta(milliseconds=1)


def get_sixteenth(timing_point, time) -> int:
    return round((time - timing_point.offset) / ONE_MS / timing_point.ms_per_beat * 4)


def is_kat(hit_object: slider.HitObject):
    # either whistle or clap
    return hit_object.hitsound & 0b1010 != 0


def parse_map():
    map = Beatmap.from_path("map.osu")
    # Assuming that the map has only one timing point
    timing_point = map.timing_points[0]

    objects: tuple[slider.Circle, ...] = map.hit_objects(
        circles=True, sliders=False, spinners=False
    )
    beat_to_object: dict[int, slider.Circle] = {}
    for object in objects:
        beat = get_sixteenth(timing_point, object.time)
        if beat in beat_to_object:
            raise ValueError(f"Duplicate time detected: {object.time} (beat {beat})")
        beat_to_object[beat] = object

    # convert to string of d,k,<space>
    last_object = max(beat_to_object.keys())
    object_chars = []
    for i in range(last_object + 1):
        if i in beat_to_object:
            object_chars.append("k" if is_kat(beat_to_object[i]) else "d")
        else:
            object_chars.append(" ")
    objects_str = "".join(object_chars)

    json_output = {
        "start_offset": int(timing_point.offset / ONE_MS),
        "ms_per_beat": timing_point.ms_per_beat,
        "od": map.overall_difficulty,
        "data": objects_str,
    }
    path = "../website/src/assets/map.json"
    with open(path, "w") as output_file:
        print(f"Writing map to {path}")
        json.dump(json_output, output_file)
    return json_output


def key_to_char(key):
    match key:
        case KeyTaiko.LEFT_DON:
            return "d"
        case KeyTaiko.LEFT_KAT:
            return "k"
        case KeyTaiko.RIGHT_DON:
            return "D"
        case KeyTaiko.RIGHT_KAT:
            return "K"
        case _:
            raise ValueError(f"Invalid key: {key}")


def parse_replay(path):
    replay = Replay.from_path(f"replays/{path}")
    if replay.mode != osrparse.GameMode.TAIKO:
        raise ValueError(f"replay is not a taiko replay: {path}")
    # print(replay.timestamp)

    judgements = {
        "300": replay.count_300,
        "100": replay.count_100,
        "miss": replay.count_miss,
    }

    events = []
    cur_presses: dict[KeyTaiko, int | None] = {key: None for key in KeyTaiko}
    data = cast(list[osrparse.ReplayEventTaiko], replay.replay_data)
    time = 0
    for ev in data:
        time += ev.time_delta
        for key in KeyTaiko:
            pressed = (ev.keys & key) > 0
            if pressed and cur_presses[key] is None:
                cur_presses[key] = time
            elif not pressed and cur_presses[key] is not None:
                events.append(
                    {
                        "key": key,
                        "press_time": cur_presses[key],
                        "release_time": time,
                    }
                )
                cur_presses[key] = None

    # idk if there can be unreleased keys but just in case
    time += 1000
    for key in KeyTaiko:
        if cur_presses[key] is not None:
            events.append(
                {
                    "key": key,
                    "press_time": cur_presses[key],
                    "release_time": time,
                }
            )

    # sort by increasing press time
    events.sort(key=lambda ev: ev["press_time"])

    # to have some kind of compression, we split hits into separate arrays for key, press time, release time
    # keys: list of lowercase 'd', 'k' for left don/kat; uppercase 'D', 'K' for right don/kat
    # we also convert times back into deltas (this almost halves the output size lol)
    keys = "".join(key_to_char(ev["key"]) for ev in events)
    presses = np.array([ev["press_time"] for ev in events], dtype=np.int32)
    presses[1:] = np.ediff1d(presses)
    releases = np.array([ev["release_time"] for ev in events], dtype=np.int32)
    releases[1:] = np.ediff1d(releases)

    total_notes = judgements["300"] + judgements["100"] + judgements["miss"]
    accuracy = (judgements["300"] + judgements["100"] / 3) / total_notes

    return {
        "date": replay.timestamp,
        "accuracy": accuracy,
        "judgements": judgements,
        "keys": "".join(keys),
        "press_time_deltas": presses,
        "release_time_deltas": releases,
    }


# after this date, lazer hit windows were changed
CUTOFF_DATE = datetime.fromisoformat("2025-07-02 00:00:00.000000+00:00")

# TODO: unfortunately the hit object timings do not always line up with math.floor of the tempo
# so we should compute the differences


def hit_windows(od, date):
    windows = {
        "great": 50 - 3 * od,
        "ok": 120 - 8 * od if od <= 5 else 110 - 6 * od,
        "miss": 135 - 8 * od if od <= 5 else 120 - 5 * od,
    }
    if date >= CUTOFF_DATE:
        for type in ["great", "ok", "miss"]:
            windows[type] = math.floor(windows[type]) - 0.5
    return windows


def key_is_good(obj, key):
    return obj == key.lower()


def score_replay(map, replay):
    windows = hit_windows(map["od"], replay["date"])
    beat_index = 0
    press_index = 0
    press_time = 0
    output = []
    beat_to_press_map = []
    while beat_index < len(map["data"]) and map["data"][beat_index] == " ":
        output.append(" ")
        beat_to_press_map.append(-1)
        beat_index += 1
    while beat_index < len(map["data"]):
        cur_beat_time = math.floor(
            map["start_offset"] + (beat_index / 4) * map["ms_per_beat"]
        )
        cur_press_time = (
            press_time + replay["press_time_deltas"][press_index]
            if press_index < len(replay["keys"])
            else 1e10
        )
        next_beat = True
        next_press = True
        err = cur_press_time - cur_beat_time
        if abs(err) < windows["great"]:
            output.append("3")
        elif abs(err) < windows["ok"]:
            output.append("1")
        elif err < 0 and abs(err) < windows["miss"]:
            output.append("x")
        elif err < 0:
            next_beat = False  # press was way too early, beat isn't judged
        else:
            # press was late, beat missed
            output.append("x")
            next_press = False
        if next_beat:
            if press_index >= len(replay["keys"]) or not key_is_good(
                map["data"][beat_index], replay["keys"][press_index]
            ):
                output[-1] = "x"
            beat_index += 1
            if next_press:
                beat_to_press_map.append(press_index)
            else:
                beat_to_press_map.append(-1)
            while beat_index < len(map["data"]) and map["data"][beat_index] == " ":
                output.append(" ")
                beat_to_press_map.append(-1)
                beat_index += 1
        if next_press and press_index < len(replay["keys"]):
            press_time += replay["press_time_deltas"][press_index]
            press_index += 1
    assert len(beat_to_press_map) == len(map["data"])
    return "".join(output), beat_to_press_map


def parse_replays(map):
    replays = []
    for path in os.listdir("replays"):
        replays.append(parse_replay(path))
    replays.sort(key=lambda r: r["date"])

    print("Scoring replays")
    error_count = 0
    for replay in replays:
        scores, beat_to_press_map = score_replay(map, replay)
        replay["scores"] = scores
        replay["beat_to_press_map"] = beat_to_press_map
        # check judgements
        for j, c in [("300", "3"), ("100", "1"), ("miss", "x")]:
            calc = scores.count(c)
            should = replay["judgements"][j]
            date = replay["date"]
            if calc != should:
                print(
                    f"Mismatched {j} count in replay {date}: should be {should}, computed {calc}"
                )
                error_count += abs(calc - should)
    print(f"Total errors: {error_count}")

    json_output = [
        {
            **replay,
            "date": str(replay["date"]),
            "press_time_deltas": replay["press_time_deltas"].tolist(),
            "release_time_deltas": replay["release_time_deltas"].tolist(),
        }
        for replay in replays
    ]
    path = "../website/src/assets/replays.json"
    with open(path, "w") as output_file:
        print(f"Writing replays to {path}")
        json.dump(json_output, output_file, separators=(",", ":"))
    return replays


def main():
    print("Parsing map...")
    map = parse_map()
    print("Done parsing map.")
    print("Parsing replays...")
    parse_replays(map)
    print("Done parsing replays.")


if __name__ == "__main__":
    main()
