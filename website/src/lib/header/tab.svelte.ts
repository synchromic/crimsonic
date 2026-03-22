const tabs = ["none", "main", "about", "settings"] as const;
export type Tab = (typeof tabs)[number];

function isTab(value: string): value is Tab {
  return (tabs as readonly string[]).includes(value);
}

function getTabFromHash(): Tab {
  const hash = window.location.hash.slice(1);
  if (isTab(hash)) return hash;
  return "main";
}

export let tab: { value: Tab } = $state({ value: getTabFromHash() });
