<script lang="ts">
  import Statistic from "../stats/Statistic.svelte";
  import { selectedObject } from "../stats/statsObject.svelte";

  let stats = $derived(selectedObject.value.getStats());
</script>

{#each stats as stat (stat.name)}
  <Statistic statistic={stat} />
{/each}
