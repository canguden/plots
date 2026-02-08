// Init command - generate tracking script installation code
import { getToken } from "../auth";

export async function initCommand() {
  const token = await getToken();

  if (!token) {
    console.error("Error: Not logged in. Run 'plots login' first");
    process.exit(1);
  }

  // For now, use a placeholder project ID
  // In production, this would prompt for project selection or create a new one
  const projectId = "proj_demo";

  console.log("\n✨ Plots Analytics Setup\n");
  console.log("Add this script to your website's <head> tag:\n");
  console.log("─".repeat(60));
  console.log(`<script
  defer
  src="https://plots.sh/plots.js"
  data-project="${projectId}"
></script>`);
  console.log("─".repeat(60));
  console.log("\nFor local development, use:");
  console.log("─".repeat(60));
  console.log(`<script
  defer
  src="http://localhost:3001/plots.js"
  data-project="${projectId}"
></script>`);
  console.log("─".repeat(60));
  console.log("\nCustom events:");
  console.log("─".repeat(60));
  console.log(`import { track } from "plots/analytics";

track("signup");
track("purchase", { value: 29 });`);
  console.log("─".repeat(60));
  console.log("\n✓ Setup complete! Your analytics will appear in the dashboard.\n");
  process.exit(0);
}
