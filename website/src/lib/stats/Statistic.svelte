<script lang="ts" generics="R extends Reference">
  import ReferenceLink from "./ReferenceLink.svelte";
  import type { Statistic } from "./stats.svelte";
  import type { Reference } from "./statsObject.svelte";

  let { statistic }: { statistic: Statistic<R> } = $props();
</script>

<div>
  {statistic.description}: {statistic.value}
  {#if statistic.ref !== undefined}
    (<ReferenceLink reference={statistic.ref} />)
  {/if}
</div>
