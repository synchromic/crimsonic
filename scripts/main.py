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


def get_note_index(timing_point, time) -> int:
    return round((time - timing_point.offset) / ONE_MS / timing_point.ms_per_beat * 4)


def is_kat(hit_object: slider.HitObject):
    # either whistle or clap
    return hit_object.hitsound & 0b1010 != 0


def parse_map():
    map = Beatmap.from_path("map.osu")
    # Assuming that the map has only one timing point
    timing_point = map.timing_points[0]

    notes: tuple[slider.Circle, ...] = map.hit_objects(
        circles=True, sliders=False, spinners=False
    )
    beat_to_note: dict[int, slider.Circle] = {}
    for note in notes:
        beat = get_note_index(timing_point, note.time)
        if beat in beat_to_note:
            raise ValueError(f"Duplicate time detected: {note.time} (beat {beat})")
        beat_to_note[beat] = note

    # convert to string of d,k,<space>
    last_note_index = max(beat_to_note.keys())
    note_chars = []
    for i in range(last_note_index + 1):
        if i in beat_to_note:
            note_chars.append("k" if is_kat(beat_to_note[i]) else "d")
        else:
            note_chars.append(" ")
    notes_str = "".join(note_chars)

    json_output = {
        "start_offset": int(timing_point.offset / ONE_MS),
        "ms_per_note": timing_point.ms_per_beat / 4,
        "od": map.overall_difficulty,
        "notes": notes_str,
    }
    path = "../website/src/assets/gen/map.json"
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


# returns numpy array
def deltas(a):
    arr = np.array(a, dtype=np.int32)
    arr[1:] = np.ediff1d(arr)
    return arr


def parse_replay(path):
    replay = Replay.from_path(f"replays/{path}")
    if replay.mode != osrparse.GameMode.TAIKO:
        raise ValueError(f"replay is not a taiko replay: {path}")
    # print(replay.timestamp)

    judgements = {
        "great": replay.count_300,
        "ok": replay.count_100,
        "miss": replay.count_miss,
    }

    events = []
    pressed_keys: dict[KeyTaiko, int | None] = {key: None for key in KeyTaiko}
    data = cast(list[osrparse.ReplayEventTaiko], replay.replay_data)
    time = 0
    for ev in data:
        time += ev.time_delta
        for key in KeyTaiko:
            pressed = (ev.keys & key) > 0
            if pressed and pressed_keys[key] is None:
                pressed_keys[key] = time
            elif not pressed and pressed_keys[key] is not None:
                events.append(
                    {
                        "key": key,
                        "press_time": pressed_keys[key],
                        "release_time": time,
                    }
                )
                pressed_keys[key] = None

    # idk if there can be unreleased keys but just in case
    time += 1000
    for key in KeyTaiko:
        if pressed_keys[key] is not None:
            events.append(
                {
                    "key": key,
                    "press_time": pressed_keys[key],
                    "release_time": time,
                }
            )

    # sort by increasing press time
    events.sort(key=lambda ev: ev["press_time"])

    # to have some kind of compression, we split hits into separate arrays for key, press time, release time
    # keys: list of lowercase 'd', 'k' for left don/kat; uppercase 'D', 'K' for right don/kat
    # we also convert times back into deltas (this almost halves the output size lol)
    keys = "".join(key_to_char(ev["key"]) for ev in events)
    presses = deltas([ev["press_time"] for ev in events])
    releases = deltas([ev["release_time"] for ev in events])

    total_notes = judgements["great"] + judgements["ok"] + judgements["miss"]
    accuracy = (judgements["great"] + judgements["ok"] / 3) / total_notes

    return {
        "timestamp": replay.timestamp,
        "accuracy": accuracy,
        "judgements": judgements,
        "keys": "".join(keys),
        "press_time_deltas": presses,
        "release_time_deltas": releases,
    }


# after this date, lazer hit windows were changed
CUTOFF_DATE = datetime.fromisoformat("2025-07-02 00:00:00.000000+00:00")


def hit_windows(od, timestamp):
    windows = {
        "great": 50 - 3 * od,
        "ok": 120 - 8 * od if od <= 5 else 110 - 6 * od,
        "miss": 135 - 8 * od if od <= 5 else 120 - 5 * od,
    }
    if timestamp >= CUTOFF_DATE:
        for type in ["great", "ok", "miss"]:
            windows[type] = math.floor(windows[type]) - 0.5
    return windows


def key_is_good(obj, key):
    return obj == key.lower()


def score_replay(map, replay):
    windows = hit_windows(map["od"], replay["timestamp"])
    note_index = 0
    event_index = 0
    press_time = 0
    output = []
    note_to_press_map = []
    while note_index < len(map["notes"]) and map["notes"][note_index] == " ":
        output.append(" ")
        note_to_press_map.append(-1)
        note_index += 1
    while note_index < len(map["notes"]):
        cur_note_time = math.floor(
            map["start_offset"] + note_index * map["ms_per_note"]
        )
        cur_press_time = (
            press_time + replay["press_time_deltas"][event_index]
            if event_index < len(replay["keys"])
            else 1e10
        )
        next_note = True
        next_press = True
        err = cur_press_time - cur_note_time
        if abs(err) < windows["great"]:
            output.append("3")
        elif abs(err) < windows["ok"]:
            output.append("1")
        elif err < 0 and abs(err) < windows["miss"]:
            output.append("x")
        elif err < 0:
            next_note = False  # press was way too early, note isn't judged
        else:
            # press was late, note missed
            output.append("x")
            next_press = False
        if next_note:
            if event_index >= len(replay["keys"]) or not key_is_good(
                map["notes"][note_index], replay["keys"][event_index]
            ):
                output[-1] = "x"
            note_index += 1
            if next_press:
                note_to_press_map.append(event_index)
            else:
                note_to_press_map.append(-1)
            while note_index < len(map["notes"]) and map["notes"][note_index] == " ":
                output.append(" ")
                note_to_press_map.append(-1)
                note_index += 1
        if next_press and event_index < len(replay["keys"]):
            press_time += replay["press_time_deltas"][event_index]
            event_index += 1
    assert len(note_to_press_map) == len(map["notes"])
    scores = "".join(output)

    # check judgements
    error_count = 0
    for j, c in [("great", "3"), ("ok", "1"), ("miss", "x")]:
        calc = scores.count(c)
        should = replay["judgements"][j]
        timestamp = replay["timestamp"]
        if calc != should:
            print(
                f"Mismatched {j} count in replay {timestamp}: should be {should}, computed {calc}"
            )
            error_count += abs(calc - should)
    return scores, note_to_press_map, error_count


def parse_replays(map):
    replays = []
    for path in os.listdir("replays"):
        replays.append(parse_replay(path))
    replays.sort(key=lambda r: r["timestamp"])

    print("Scoring replays")
    error_count = 0
    for replay in replays:
        scores, note_to_press_map, cur_error_count = score_replay(map, replay)
        replay["scores"] = scores
        replay["note_to_press_map"] = note_to_press_map
        error_count += cur_error_count
    print(f"Total errors: {error_count}")

    json_output = [
        {
            **replay,
            "timestamp": str(replay["timestamp"]),
            "press_time_deltas": replay["press_time_deltas"].tolist(),
            "release_time_deltas": replay["release_time_deltas"].tolist(),
        }
        for replay in replays
    ]
    path = "../website/src/assets/gen/replays.json"
    with open(path, "w") as output_file:
        print(f"Writing replays to {path}")
        json.dump(json_output, output_file, separators=(",", ":"))
    return replays


def create_auto_replay(map):
    keys = []
    presses = []
    releases = []
    left_hand = True
    for i in range(len(map["notes"])):
        if map["notes"][i] == " ":
            continue
        cur_note_time = math.floor(map["start_offset"] + i * map["ms_per_note"])
        keys.append(map["notes"][i] if left_hand else map["notes"][i].upper())
        left_hand = not left_hand
        presses.append(cur_note_time)
        releases.append(cur_note_time + 10)

    judgements = {
        "great": len(keys),
        "ok": 0,
        "miss": 0,
    }

    replay = {
        "timestamp": datetime.fromisoformat("2001-09-11 14:00:00.000000+00:00"),
        "accuracy": 100.0,
        "judgements": judgements,
        "keys": "".join(keys),
        "press_time_deltas": deltas(presses),
        "release_time_deltas": deltas(releases),
    }

    scores, note_to_press_map, error_count = score_replay(map, replay)
    assert error_count == 0
    replay["scores"] = scores
    replay["note_to_press_map"] = note_to_press_map

    json_output = {
        **replay,
        "timestamp": str(replay["timestamp"]),
        "press_time_deltas": replay["press_time_deltas"].tolist(),
        "release_time_deltas": replay["release_time_deltas"].tolist(),
    }

    path = "../website/src/assets/gen/auto_replay.json"
    with open(path, "w") as output_file:
        print(f"Writing auto replay to {path}")
        json.dump(json_output, output_file, separators=(",", ":"))


def main():
    print("Parsing map...")
    map = parse_map()
    print("Done parsing map.")
    print("Parsing replays...")
    parse_replays(map)
    print("Done parsing replays.")
    print("Creating auto replay...")
    create_auto_replay(map)
    print("Done creating auto replay.")


if __name__ == "__main__":
    main()
