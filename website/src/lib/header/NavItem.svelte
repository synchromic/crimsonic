<script lang="ts">
  import type { Snippet } from "svelte";
  import { tab, type Tab } from "./tab.svelte";

  let { id, children }: { id: Tab; children: Snippet } = $props();

  let selected = $derived(id === tab.value);
</script>

<div class={{ container: true, selected }}>
  <a
    href="#{id}"
    onclick={() => {
      tab.value = id;
    }}
  >
    {@render children()}
  </a>
</div>

<style>
  .container {
    width: auto;
    flex-grow: 1;
    font-size: 1.5em;
    text-align: center;
    background-color: var(--dark-bg);
    border-bottom: 1px solid var(--red-border);
    padding: 3px;
  }

  .container:not(:last-child) {
    border-right: 1px solid var(--red-border);
  }

  a {
    display: block;
    width: 100%;
    height: 100%;
  }

  .container:hover {
    background-color: color-mix(in srgb, var(--dark-bg), #fff 10%);
  }

  .container.selected {
    background-color: inherit;

    /* can't set it to none because things would shift */
    border-bottom: 1px solid transparent;
  }
</style>
