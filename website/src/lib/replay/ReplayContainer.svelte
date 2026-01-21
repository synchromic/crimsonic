<script lang="ts">
  import { onMount } from "svelte";
  import jsonReplays from "../../assets/replays.json";
  import { Replay } from "./replay";
  import ReplayRow from "./ReplayRow.svelte";
  import { playbackState } from "../playbackState.svelte";
  import { containerState } from "./containerState.svelte";

  let replays = jsonReplays.map((r) => new Replay(r));
  let elem: HTMLDivElement;
  let observer: IntersectionObserver;
  let visibility = $state(jsonReplays.map((_) => false));
  let scrollRateLimit: number | null = null;

  function onscroll() {
    if (scrollRateLimit !== null) cancelAnimationFrame(scrollRateLimit);
    containerState.scrollTop = elem.scrollTop;
  }

  function intersectionCallback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target as HTMLDivElement;
      const index = parseInt(target.dataset.index!);
      visibility[index] = entry.isIntersecting;
    }
  }

  onMount(() => {
    observer = new IntersectionObserver(intersectionCallback, {
      root: elem,
      rootMargin: "0px 0px 50px 0px",
    });
    for (const child of elem.children) {
      observer.observe(child);
    }
  });
</script>

<div id="outer" bind:this={elem} {onscroll}>
  {#each replays as replay, index}
    <ReplayRow {replay} visible={visibility[index]} />
  {/each}
</div>

<style>
  #outer {
    flex-grow: 1;
    margin-bottom: 10px;
    max-width: 100%;
    max-height: 100%;
    display: grid;
    grid-template-columns: max-content auto;
    grid-auto-rows: max-content;
    gap: 5px;
    overflow-y: scroll;
    border: 1px solid;
    padding: 5px;
  }
</style>
