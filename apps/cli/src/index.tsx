#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app";
import { isLoggedIn, getToken } from "./auth";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { initCommand } from "./commands/init";

// Parse command from argv
const command = process.argv[2];

async function main() {
  // Handle commands
  switch (command) {
    case "login":
      await loginCommand();
      break;

    case "logout":
      await logoutCommand();
      break;

    case "init":
      await initCommand();
      break;

    case undefined:
    case "dashboard":
      // Open TUI dashboard
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        console.error("Error: Not logged in. Run 'plots login' first");
        process.exit(1);
      }

      // Pre-flight check: validate token works
      const token = await getToken();
      if (token) {
        process.env.BEARER_TOKEN = token;

        // Test the token before starting TUI
        const { API_URL } = await import("@plots/config");
        const testUrl = `${process.env.API_URL || API_URL}/api/projects`;
        console.log(`Testing API connection to ${testUrl}...`);
        console.log(`Token prefix: ${token.substring(0, 15)}...`);

        try {
          const testResponse = await fetch(testUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!testResponse.ok) {
            const body = await testResponse.text().catch(() => "");
            console.error(`\nAuthentication failed (${testResponse.status}):`);
            console.error(`Response: ${body}`);
            console.error(`\nRun 'plots login' to re-authenticate.`);
            process.exit(1);
          }
          console.log("✓ Connected successfully\n");
        } catch (err: any) {
          console.error(`\nAPI connection failed: ${err.message}`);
          process.exit(1);
        }
      }

      const renderer = await createCliRenderer();
      createRoot(renderer).render(<App />);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log("\nAvailable commands:");
      console.log("  plots             Open dashboard");
      console.log("  plots login       Authenticate");
      console.log("  plots init        Generate tracking script");
      console.log("  plots logout      Remove stored token");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
