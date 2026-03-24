<script lang="ts">
  import type { Referenceable } from "./statsObject.svelte";

  let { reference }: { reference: Referenceable } = $props();
</script>

{reference.reference()}
