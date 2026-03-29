<script lang="ts">
  import { onMount } from "svelte";
  import { replays, replaysById } from "./replay";
  import Stats from "../info/ReplayInfo.svelte";
  import Playfield from "../playfield/Playfield.svelte";
  import type { Attachment } from "svelte/attachments";
  import Scrubber from "../Scrubber.svelte";
  import {
    OverallObject,
    ReplayObject,
    selectedObject,
  } from "../stats/statsObject.svelte";
  import { SvelteSet } from "svelte/reactivity";

  let elem: HTMLDivElement;
  let observer = $state<IntersectionObserver>();
  let visibility = new SvelteSet<string>();

  function intersectionCallback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const target = entry.target as HTMLDivElement;
      const id = target.dataset.id!;
      if (entry.isIntersecting) {
        visibility.add(id);
      } else {
        visibility.delete(id);
      }
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

  let selectedId = $derived(
    selectedObject.value instanceof ReplayObject
      ? selectedObject.value.replay.id
      : undefined,
  );

  function toggleSelected(event: Event) {
    if (
      event.currentTarget === null ||
      !(event.currentTarget instanceof HTMLElement) ||
      !event.currentTarget.dataset.id
    ) {
      return;
    }
    // prevent firing if click was on clickable child element
    if (
      event.target !== null &&
      event.target instanceof Element &&
      event.target.closest(".capture-click") !== null
    ) {
      return;
    }
    const eventId = event.currentTarget.dataset.id;
    if (selectedId === eventId) {
      selectedObject.value = new OverallObject();
    } else {
      const replay = replaysById.get(eventId);
      if (replay === undefined) throw new Error(`Replay ${eventId} not found`);
      selectedObject.value = new ReplayObject(replay);
    }
  }

  function onclick(event: MouseEvent) {
    // prevent selecting if selecting text
    const selection = window.getSelection();
    if (selection?.type === "Range") return;
    toggleSelected(event);
  }

  function onkeyup(event: KeyboardEvent) {
    if (event.key === "Enter") {
      toggleSelected(event);
    }
  }
</script>

<div id="container">
  <Scrubber />
  <div id="outer" bind:this={elem}>
    {#each replays as replay (replay.id)}
      <div
        class={["stats", selectedId === replay.id ? "selected" : ""]}
        data-id={replay.id}
        {@attach attachReplay}
        {onclick}
        {onkeyup}
        aria-label="Replay {replay.id}"
        role="presentation"
      >
        <Stats {replay} visible={visibility.has(replay.id)} />
      </div>
      <div
        class={["playfield", selectedId === replay.id ? "selected" : ""]}
        data-id={replay.id}
        {onclick}
        {onkeyup}
        aria-label="Replay {replay.id}"
        role="presentation"
      >
        <Playfield {replay} visible={visibility.has(replay.id)} />
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

  .selected {
    background-color: #8f82;
  }
</style>
