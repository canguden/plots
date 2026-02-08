// Logout command - remove stored token
import { deleteToken, isLoggedIn } from "../auth";

export async function logoutCommand() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    console.log("You are not logged in");
    process.exit(0);
  }

  await deleteToken();
  console.log("✓ Successfully logged out");
  process.exit(0);
}
