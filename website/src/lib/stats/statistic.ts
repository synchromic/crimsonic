import type { Reference } from "./statsObject";

const categories = ["accuracy"] as const;
export type Category = (typeof categories)[number];

interface StatisticProps<R extends Reference> {
  name: string;
  description: string;
  value: number;
  category: Category;
  ref: R;
  display?: () => string;
}

export class Statistic<R extends Reference> {
  name: string;
  description: string;
  value: number;
  category: Category;
  ref: R;
  display: () => string;

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
    this.display = display ?? (() => this.value.toFixed(2));
  }
}
