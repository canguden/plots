// Init command - generate tracking script installation code
import { getToken } from "../auth";

const API_URL = process.env.API_URL || "http://localhost:3001";

interface Project {
  id: string;
  name: string;
  domain: string;
}

export async function initCommand() {
  const token = await getToken();

  if (!token) {
    console.error("Error: Not logged in. Run 'plots login' first");
    process.exit(1);
  }

  try {
    // Fetch user's projects
    const response = await fetch(`${API_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    const projects: Project[] = await response.json();

    if (projects.length === 0) {
      console.error("\n❌ No projects found. Create one at https://plots.sh/onboarding\n");
      process.exit(1);
    }

    // For now, use the first project
    // TODO: Add interactive project selection
    const project = projects[0];

    console.log("\n✨ Plots Analytics Setup\n");
    console.log(`📊 Project: ${project.name} (${project.domain})`);
    console.log(`🆔 ID: ${project.id}\n`);
    console.log("Add this script to your website's <head> tag:\n");
    console.log("─".repeat(60));
    console.log(`<script
  defer
  src="https://plots.sh/plots.js"
  data-project="${project.id}"
></script>`);
    console.log("─".repeat(60));
    console.log("\nFor local development, use:");
    console.log("─".repeat(60));
    console.log(`<script
  defer
  src="http://localhost:3001/plots.js"
  data-project="${project.id}"
></script>`);
    console.log("─".repeat(60));
    console.log("\nCustom events:");
    console.log("─".repeat(60));
    console.log(`window.plots.track("signup");
window.plots.track("purchase", { value: 29 });`);
    console.log("─".repeat(60));
    console.log("\n✓ Setup complete! Your analytics will appear in the dashboard.\n");
    
    if (projects.length > 1) {
      console.log(`💡 Tip: You have ${projects.length} projects. View all at https://plots.sh/dashboard\n`);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}
