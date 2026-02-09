// Login command - OAuth device flow (industry standard)
import { saveToken } from "../auth";
import { API_URL } from "@plots/config";
import open from "open";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function loginCommand() {
  const apiUrl = process.env.API_URL || API_URL;

  console.log("🔐 Authenticating with Plots...\n");

  try {
    // Step 1: Request device code
    const codeResponse = await fetch(`${apiUrl}/cli/device/code`, {
      method: "POST",
    });

    if (!codeResponse.ok) {
      console.error("Error: Failed to initiate authentication");
      process.exit(1);
    }

    const codeData: DeviceCodeResponse = await codeResponse.json();

    console.log(`✓ Opening browser to: ${codeData.verification_uri}\n`);
    console.log(`If the browser doesn't open automatically, visit:`);
    console.log(`  ${codeData.verification_uri}\n`);
    console.log(`Verification code: ${codeData.user_code}\n`);

    // Open browser automatically
    try {
      await open(codeData.verification_uri);
    } catch {
      console.log("Unable to open browser automatically. Please visit the URL above.\n");
    }

    console.log("Waiting for authorization...");

    // Step 2: Poll for token
    const pollInterval = codeData.interval * 1000; // Convert to milliseconds
    const expiresAt = Date.now() + codeData.expires_in * 1000;

    while (Date.now() < expiresAt) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const tokenResponse = await fetch(`${apiUrl}/cli/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_code: codeData.device_code }),
      });

      if (tokenResponse.ok) {
        const tokenData: TokenResponse = await tokenResponse.json();
        await saveToken(tokenData.access_token);
        console.log("\n✓ Successfully authenticated!");
        console.log("\nRun 'plots' to open your analytics dashboard");
        process.exit(0);
      }

      const errorData = await tokenResponse.json();
      
      if (errorData.error === "expired_token") {
        console.error("\n✗ Authentication expired. Please run 'plots login' again.");
        process.exit(1);
      }

      // authorization_pending - keep polling
    }

    console.error("\n✗ Authentication timed out. Please try again.");
    process.exit(1);
  } catch (error) {
    console.error("Error during authentication:", error);
    process.exit(1);
  }
}
