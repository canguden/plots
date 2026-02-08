// Login command - authenticate user
import { saveToken } from "../auth";

export async function loginCommand() {
  console.log("Welcome to Plots!");
  console.log("\nTo get your API token:");
  console.log("1. Visit https://plots.sh/settings");
  console.log("2. Copy your API token");
  console.log("3. Paste it below\n");

  // Read token from stdin
  process.stdout.write("Enter your API token: ");

  const token = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });

  if (!token) {
    console.error("Error: No token provided");
    process.exit(1);
  }

  if (!token.startsWith("pl_live_") && !token.startsWith("pl_test_")) {
    console.error("Error: Invalid token format. Token should start with pl_live_ or pl_test_");
    process.exit(1);
  }

  await saveToken(token);
  console.log("\n✓ Successfully logged in!");
  console.log("\nRun 'plots' to open the dashboard");
  process.exit(0);
}
