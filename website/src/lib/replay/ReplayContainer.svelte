<script lang="ts">
  import { onMount } from "svelte";
  import { replays } from "./replay";
  import Stats from "../stats/ReplayStats.svelte";
  import Playfield from "../playfield/Playfield.svelte";
  import type { Attachment } from "svelte/attachments";
  import Scrubber from "../Scrubber.svelte";

  let elem: HTMLDivElement;
  let observer = $state<IntersectionObserver>();
  let visibility = $state(replays.map((_) => false));

  function intersectionCallback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target as HTMLDivElement;
      const index = parseInt(target.dataset.index!);
      visibility[index] = entry.isIntersecting;
    }
  }

  const attachReplay: Attachment = (element) => {
    if (!observer) return; // attachment will be called again once observer is set
    observer.observe(element);
    return () => {
      observer?.unobserve(element);
    };
  };

  onMount(() => {
    observer = new IntersectionObserver(intersectionCallback, {
      root: elem,
      rootMargin: "0px 0px 50px 0px",
    });
  });
</script>

<div id="container">
  <Scrubber />
  <div id="outer" bind:this={elem}>
    {#each replays as replay, index}
      <div class="stats" data-index={index} {@attach attachReplay}>
        <Stats {replay} visible={visibility[index]} />
      </div>
      <div class="playfield">
        <Playfield {replay} visible={visibility[index]} />
      </div>
    {/each}
  </div>
</div>

<style>
  #container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
  }

  #outer {
    flex: 1 1 0;
    margin-bottom: 10px;
    max-width: 100%;
    display: grid;
    grid-template-columns: max-content auto;
    grid-auto-rows: max-content;
    gap: 5px;
    overflow-y: scroll;
    border: 1px solid;
    padding: 5px;
  }

  .stats {
    border: 1px solid;
    padding: 5px;
  }
</style>
