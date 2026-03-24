<script>
  import { tab } from "../header/tab.svelte";
  import SettingsTab from "./SettingsTab.svelte";
  import StatsTab from "./StatsTab.svelte";

  function onclick() {
    tab.value = "none";
  }
</script>

{#if tab.value !== "none"}
  <div id="container">
    <button id="hide" aria-label="hide panel" {onclick}>
      <svg width="15" height="15" viewBox="-1 -1 12 12">
        <path
          d="M 0,7.5 L 5,2.5 L10,7.5"
          stroke="#eee"
          stroke-width="2"
          fill="none"
        />
      </svg>
    </button>
    {#if tab.value === "main"}
      <div>hello!</div>
    {:else if tab.value === "stats"}
      <StatsTab />
    {:else if tab.value === "settings"}
      <SettingsTab />
    {/if}
  </div>
{/if}

<style>
  #container {
    background-color: var(--dark-bg);
    border-bottom: 1px solid var(--red-border);
    min-height: 20%;
    position: relative;
  }

  #hide {
    background: none;
    background-color: var(--dark-bg);
    cursor: pointer;
    border: 1px solid var(--red-border);
    border-bottom: none;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 20px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #hide:hover {
    background-color: color-mix(in srgb, var(--dark-bg) 90%, white);
  }
</style>
