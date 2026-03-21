<script lang="ts">
  import { onMount } from "svelte";
  import jsonReplays from "../../assets/replays.json";
  import { Replay } from "./replay";
  import Stats from "./Stats.svelte";
  import Playfield from "../playfield/Playfield.svelte";
  import type { Attachment } from "svelte/attachments";

  let replays: Replay[] = $state([]);
  let elem: HTMLDivElement;
  let observer: IntersectionObserver;
  let visibility = $state(jsonReplays.map((_) => false));

  function intersectionCallback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target as HTMLDivElement;
      const index = parseInt(target.dataset.index!);
      visibility[index] = entry.isIntersecting;
    }
  }

  const attachReplay: Attachment = (element) => {
    observer.observe(element);
    return () => {
      observer.unobserve(element);
    };
  };

  onMount(() => {
    replays = jsonReplays.map((r) => new Replay(r));
    observer = new IntersectionObserver(intersectionCallback, {
      root: elem,
      rootMargin: "0px 0px 50px 0px",
    });
  });
</script>

<div id="outer" bind:this={elem}>
  {#each replays as replay, index}
    <div class="stats" data-index={index} {@attach attachReplay}>
      <Stats {replay} />
    </div>
    <div class="playfield">
      <Playfield {replay} visible={visibility[index]} />
    </div>
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

  .stats {
    border: 1px solid;
    padding: 5px;
    box-sizing: border-box;
  }
</style>
