<script module lang="ts">
  import ReferenceLink from "./ReferenceLink.svelte";
  import type { Reference } from "./statsObject.svelte";

  const categories = ["accuracy"] as const;
  export type Category = (typeof categories)[number];

  interface StatisticProps<R extends Reference> {
    name: string;
    description: string;
    value: number;
    category: Category;
    ref: R;
    display?: (value: number) => string;
  }

  export class Statistic<R extends Reference> {
    name: string;
    description: string;
    value: number;
    category: Category;
    ref: R;
    display: (value: number) => string;

    constructor({
      name,
      description,
      value,
      category,
      ref,
      display,
    }: StatisticProps<R>) {
      this.name = name;
      this.description = description;
      this.value = value;
      this.category = category;
      this.ref = ref;
      this.display = display ?? ((value) => value.toFixed(2));
    }
  }
</script>

<script lang="ts" generics="R extends Reference">
  let { statistic }: { statistic: Statistic<R> } = $props();
</script>

<div>
  {statistic.description}: {statistic.display(statistic.value)}
  {#if statistic.ref !== undefined}
    (<ReferenceLink reference={statistic.ref} />)
  {/if}
</div>
