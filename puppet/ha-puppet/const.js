import { readFileSync, existsSync } from "fs";

// load first file that exists
const optionsFile = ["./options-dev.json", "/data/options.json"].find(
  existsSync,
);

const options = optionsFile ? JSON.parse(readFileSync(optionsFile)) : {};

export const isAddOn = optionsFile === "/data/options.json";

if (!optionsFile && !process.env.ACCESS_TOKEN) {
  console.error(
    "No options configuration found. Please copy options-dev.json.sample to options-dev.json or provide configuration via environment variables (e.g., ACCESS_TOKEN, HOME_ASSISTANT_URL).",
  );
  process.exit(1);
}

export const hassUrl = isAddOn
  ? (options.home_assistant_url || process.env.HOME_ASSISTANT_URL || "http://homeassistant:8123")
  : (options.home_assistant_url || process.env.HOME_ASSISTANT_URL || "http://localhost:8123");

export const hassToken = options.access_token || process.env.ACCESS_TOKEN;
export const debug = process.env.DEBUG === 'true' || false;

export const chromiumExecutable = isAddOn 
  ? "/usr/bin/chromium" 
  : (options.chromium_executable || process.env.CHROMIUM_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");

export const keepBrowserOpen = options.keep_browser_open || process.env.KEEP_BROWSER_OPEN === 'true' || false;

if (!hassToken) {
  console.warn("No access token configured. UI will show configuration instructions.");
}
