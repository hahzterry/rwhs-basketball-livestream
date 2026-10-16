import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";

const target = document.getElementById("app");

if (!target) {
  console.error("Target element #app not found");
  throw new Error("Target element #app not found");
}

const app = mount(App, {
  target
});

export default app;
