#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app";

async function main() {
  console.log("🚀 Starting Plots CLI Demo...\n");
  console.log("This is a DEMO with mock data to preview the UI/UX");
  console.log("Use keyboard shortcuts to navigate:\n");
  console.log("  • Press 1-4 to switch between views");
  console.log("  • Press 'p' to switch projects");
  console.log("  • Press 'q' to quit\n");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const renderer = await createCliRenderer();
  createRoot(renderer).render(<App />);
}

main().catch(console.error);
