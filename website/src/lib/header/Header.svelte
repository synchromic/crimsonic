<script lang="ts">
  import NavItem from "./NavItem.svelte";
</script>

<header>
  <div class="nav nav-left">
    <div class="nav-spacer"></div>
    <div class="nav-items">
      <NavItem side="left" id="main">Main</NavItem>
    </div>
  </div>
  <div class="center">
    <img src="crimsonic-cooltext.gif" alt="crimsonic" />
  </div>
  <div class="nav nav-right">
    <div class="nav-spacer"></div>
    <div class="nav-items">
      <NavItem side="right" id="about">About</NavItem>
      <NavItem side="right" id="settings">Settings</NavItem>
    </div>
  </div>
</header>

<style>
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    z-index: 1;
  }

  .center {
    background: var(--dark-bg-alpha);
    border-bottom: 1px solid var(--red-border);
    padding: 0 20px;
    text-align: center;
  }

  .nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 2;
  }

  .nav-spacer {
    background: var(--dark-bg-alpha);
    border-bottom: 1px solid var(--red-border);
    flex-grow: 1;
  }

  .nav-items {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
</style>
