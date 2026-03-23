<script>
  import { tab } from "../header/tab.svelte";
  import Settings from "./SettingsTab.svelte";
</script>

{#if tab.value !== "none"}
  <div class="container">
    {#if tab.value === "main"}
      <div>hello!</div>
    {:else if tab.value === "settings"}
      <Settings />
    {/if}
  </div>
{/if}

<style>
  .container {
    background-color: var(--dark-bg);
    border-bottom: 1px solid var(--red-border);
  }
</style>
