import { chromium } from '@playwright/test';

export function launchProductionBrowser(options = {}) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const channel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;
  const launchOptions = {
    headless: true,
    ...options,
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  } else if (channel) {
    launchOptions.channel = channel;
  }

  return chromium.launch(launchOptions);
}
