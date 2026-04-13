# Statistics

A statistic is a numerical score. Statistics have a few properties:
- A *name* - what does this statistic represent?
- A *value* - the score of this statistic
- (Optional) A *category* - e.g. "accuracy", "combo"
- A *parent* - the object this statistic applies to. Can be "overall", meaning this statistic applies over all replays, or it can be specific to a replay, note, or other object.
- (Optional) A *reference* - an object that this statistic applies to. An example would be, for the overall statistic of "highest accuracy replay", the reference would be to the replay with the highest accuracy. Useful if the user wishes to click on a link to said replay.

The statistic type is generic over its parent type and reference type.

## Objects

We have a few different types of *objects* that we want to compute statistics for. These are:
- Replays
- Note (over all replays)
- Note in a specific replay
- Measures (groups of 16 notes)
- Overall

We can take unions of these object types if they share attributes (e.g. accuracy for a note/measure/replay), so important properties should be easily accessible.

## Calculators

Statistics are produced by *calculators*. All calculators are created on first load, and can choose to precompute some data.For especially computation-heavy calculations (if any), the work can be precomputed in Python and loaded into a calculator by the frontend.

## Rankings

TODO: figure out how rankings should work in a not-slow way. Not really a priority

# List of statistics to implement

| X | Parent | Reference | Category | Description |
|---|--------|-----------|----------|-------------|
| X | Overall | Replay | Accuracy | Best accuracy |
| X | Overall | Replay | Accuracy | Worst accuracy |
| X | Overall | Replay | Accuracy | Median accuracy |
| X | Overall | N/A | Accuracy | Average accuracy |
|   | Measure | N/A | Accuracy | Average accuracy |
|   | Note | N/A | Accuracy | Average accuracy |
|   | Overall | Replay note | Combo | Best combo |
|   | Overall | Replay note | Combo | Worst combo |
|   | Replay | Replay note | Combo | Best combo in replay |
|   | Overall | Note | Misc | Hardest note |
|   | Overall | Measure | Misc | Hardest measure |
|   | Note | Replay | Misc | First time hitting this note |
|   | Measure | Replay | Misc | First time hitting this measure |
| X | Overall | N/A | Misc | Total replay count |
| X | Overall | Replay | Misc | Latest replay |
