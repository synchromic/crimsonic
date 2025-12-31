import type { Replay } from "./replay/replay";

export const pickedReplay: { replay: Replay | null } = $state({ replay: null });
