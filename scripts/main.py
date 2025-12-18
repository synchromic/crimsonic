import json
from datetime import timedelta

import slider
from slider import Beatmap

ONE_MS = timedelta(milliseconds=1)


def get_sixteenth(timing_point, time) -> int:
    return round((time - timing_point.offset) / ONE_MS / timing_point.ms_per_beat * 4)


def is_kat(hit_object: slider.HitObject):
    # either whistle or clap
    return hit_object.hitsound & 0b1010 != 0


def main():
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
    with open("../website/src/assets/map.json", "w") as output_file:
        json.dump(json_output, output_file)


if __name__ == "__main__":
    main()
