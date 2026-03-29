<script lang="ts">
  import Statistic from "../stats/Statistic.svelte";
  import { selectedObject } from "../stats/statsObject.svelte";

  let name = $derived(selectedObject.value.name());
  let stats = $derived(selectedObject.value.getStats());
</script>

<div>Selected object: {name}</div>
{#each stats as stat (stat.name)}
  <Statistic statistic={stat} />
{/each}
