const categories = ["accuracy"] as const;
export type Category = (typeof categories)[number];

export interface Statistic<R> {
  name: string;
  description: string;
  value: number;
  category: Category;
  ref: R;
  display(): string;
}
