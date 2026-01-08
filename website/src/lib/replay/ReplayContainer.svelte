<script lang="ts">
  import { onMount } from "svelte";
  import jsonReplays from "../../assets/replays.json";
  import { Replay } from "./replay";
  import ReplayCanvas from "./ReplayCanvas.svelte";
  import ReplayRow from "./ReplayRow.svelte";

  let replays = jsonReplays.map((r) => new Replay(r));
  let elem: HTMLDivElement;
  let rowsParent: HTMLDivElement;
  let scrollTop = $state(0);
  let observer: IntersectionObserver;
  let visibility = $state(jsonReplays.map((_) => false));

  function onscroll() {
    scrollTop = elem.scrollTop;
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
    for (const child of rowsParent.children) {
      observer.observe(child);
    }
  });
</script>

<div id="outer" bind:this={elem} {onscroll}>
  <div id="rows" bind:this={rowsParent}>
    {#each replays as replay, index}
      <div data-index={index}>
        <ReplayRow {replay} visible={visibility[index]} />
      </div>
    {/each}
  </div>
  <div id="canvas"><ReplayCanvas {scrollTop} /></div>
</div>

<style>
  #outer {
    flex-grow: 1;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    max-width: 100%;
    max-height: 100%;
    overflow-y: scroll;
    border: 1px solid;
    padding: 5px;
  }

  #canvas {
    flex-grow: 1;
    position: sticky;
    top: 0;
    margin-left: 5px;
  }

  #rows {
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: 1fr;
    row-gap: 5px;
  }
</style>
