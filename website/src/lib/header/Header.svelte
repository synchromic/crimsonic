<script module lang="ts">
  export const HEADER_HEIGHT = 80; // pixels
</script>

<script lang="ts">
  import NavItem from "./NavItem.svelte";
</script>

<header style="height: {HEADER_HEIGHT}px">
  <div class="nav nav-left">
    <div class="nav-spacer"></div>
    <div class="nav-items">
      <NavItem id="main">Main</NavItem>
    </div>
  </div>
  <div class="center">
    <img
      style="height: {HEADER_HEIGHT - 10}px"
      src="crimsonic-cooltext.gif"
      alt="crimsonic"
    />
  </div>
  <div class="nav nav-right">
    <div class="nav-spacer"></div>
    <div class="nav-items">
      <NavItem id="about">About</NavItem>
      <NavItem id="settings">Settings</NavItem>
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
    background: var(--dark-bg);
    border: 1px solid var(--red-border);
    border-top: none;
    padding: 0 20px;
    text-align: center;
  }

  .nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    z-index: 2;
  }

  .nav-left {
    /* overlap border of center */
    margin-right: -1px;
  }

  .nav-right {
    margin-left: -1px;
  }

  .nav-spacer {
    background: #0d0500;
    border-bottom: 1px solid var(--red-border);
    flex-grow: 1;
  }

  .nav-items {
    width: 100%;
    display: flex;
    flex-direction: row;
  }

  .nav-left > .nav-items {
    padding-right: 1px;
  }

  .nav-right > .nav-items {
    padding-left: 1px;
  }
</style>
