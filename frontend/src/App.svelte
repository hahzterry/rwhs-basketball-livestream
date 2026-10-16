<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "./stores/page";
  import Camera from "./routes/Camera.svelte";
  import Admin from "./routes/Admin.svelte";
  import Output from "./routes/Output.svelte";

  onMount(() => {
    const path = window.location.pathname;

    if (path.includes("camera"))      $page = "camera";
    else if (path.includes("admin"))  $page = "admin";
    else if (path.includes("output")) $page = "output";
    else                              $page = "home";
  });
</script>

<main>
  {#if $page === "camera"}
    <Camera />
  {:else if $page === "admin"}
    <Admin />
  {:else if $page === "output"}
    <Output />
  {:else}
    <div class="landing">
      <header class="brand">
        <span class="mark">◉</span>
        <span class="wordmark">Broadcast</span>
        <span class="live-pill" style="margin-left: 8px;">
          <span class="dot"></span>
          Live
        </span>
      </header>

      <h1>High School Basketball<br />Livestream System</h1>
      <p class="lede">Semi-final and final coverage, live to Instagram.</p>

      <nav>
        <a href="/camera">
          <span class="num">01</span>
          <span class="label">Mobile Camera</span>
          <span class="arrow">→</span>
        </a>
        <a href="/admin">
          <span class="num">02</span>
          <span class="label">Admin Panel</span>
          <span class="arrow">→</span>
        </a>
        <a href="/output">
          <span class="num">03</span>
          <span class="label">Output View</span>
          <span class="arrow">→</span>
        </a>
      </nav>

      <footer>v1.3 · LiveKit · Rust · Svelte 5</footer>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .landing {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px 24px;
    text-align: center;
    gap: 20px;
    background:
      radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.14), transparent 60%),
      radial-gradient(circle at 50% 100%, rgba(239, 68, 68, 0.08), transparent 60%),
      var(--bg);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.24em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .brand .mark {
    color: var(--live);
    font-size: 16px;
    line-height: 1;
  }

  .brand .wordmark {
    font-weight: 600;
    color: var(--text);
  }

  h1 {
    font-family: var(--font-display);
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 400;
    letter-spacing: 0.02em;
    line-height: 1.05;
    margin: 0;
    text-transform: uppercase;
    max-width: 18ch;
  }

  .lede {
    color: var(--text-muted);
    font-size: 15px;
    margin: 0;
    max-width: 420px;
    line-height: 1.5;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
    width: 100%;
    max-width: 360px;
  }

  a {
    display: grid;
    grid-template-columns: 40px 1fr 24px;
    align-items: center;
    gap: 16px;
    padding: 18px 22px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
    border-radius: 2px;
    transition: border-color var(--dur-fast) var(--ease),
                background var(--dur-fast) var(--ease),
                transform var(--dur-fast) var(--ease);
  }

  a:hover {
    border-color: var(--team-a);
    background: color-mix(in srgb, var(--team-a) 10%, var(--panel));
    transform: translateY(-1px);
  }

  a:focus-visible {
    outline: 2px solid var(--team-a);
    outline-offset: 2px;
  }

  a .num {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--text-dim);
  }

  a .label {
    text-align: left;
    font-size: 16px;
    letter-spacing: 0.01em;
  }

  a .arrow {
    color: var(--text-dim);
    font-size: 18px;
    line-height: 1;
    transition: transform var(--dur-fast) var(--ease),
                color var(--dur-fast) var(--ease);
  }

  a:hover .arrow {
    color: var(--team-a);
    transform: translateX(3px);
  }

  footer {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-top: 24px;
  }
</style>
