// Authentication management for CLI
import { homedir } from "os";
import { join } from "path";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";

const CONFIG_DIR = join(homedir(), ".config", "plots");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  token: string;
}

export async function getToken(): Promise<string | null> {
  try {
    const content = await readFile(CONFIG_FILE, "utf-8");
    const config: Config = JSON.parse(content);
    return config.token || null;
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  const config: Config = { token };
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function deleteToken(): Promise<void> {
  try {
    await unlink(CONFIG_FILE);
  } catch {
    // File doesn't exist, that's fine
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}
