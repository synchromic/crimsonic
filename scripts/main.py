import json
import os
from datetime import timedelta
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
        "data": objects_str,
    }
    path = "../website/src/assets/map.json"
    with open(path, "w") as output_file:
        print(f"Writing map to {path}")
        json.dump(json_output, output_file)


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

    return {
        "date": replay.timestamp,
        "judgements": judgements,
        "keys": "".join(keys),
        "press_time_deltas": presses,
        "release_time_deltas": releases,
    }


def parse_replays():
    replays = []
    for path in os.listdir("replays"):
        replays.append(parse_replay(path))

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


def main():
    print("crimsonic data parsing script")
    print("enter 1 to parse map")
    print("enter 2 to parse replays")
    try:
        selection = int(input("selection: "))
    except ValueError:
        print("invalid selection")
        exit()
    match selection:
        case 1:
            print("Parsing map...")
            parse_map()
            print("Done parsing map.")
        case 2:
            print("Parsing replays...")
            parse_replays()
            print("Done parsing replays.")
        case _:
            print("invalid selection")


if __name__ == "__main__":
    main()
