import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const netErrors = [];
  const consoleMsgs = [];
  page.on("requestfailed", (req) => netErrors.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText}`));
  page.on("console", (m) => { if (m.type() === "error") consoleMsgs.push(m.text()); });
  page.on("pageerror", (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

  try {
    // sign in with a known intern account from earlier e2e
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await page.type('input[name="email"]', "e2e1786269054744@test.local");
    await page.type('input[name="password"]', "password123");
    await page.click('form button[type="submit"]');

    for (let i = 0; i < 60 && page.url().includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    console.log("URL AFTER SIGNIN:", page.url());
    await new Promise((r) => setTimeout(r, 3000));
    const body = await page.evaluate(() => document.body.innerText);
    console.log("HAS ERROR PAGE:", body.includes("This page didn't load"));
    console.log("HAS FAILED TO FETCH TOAST:", body.includes("Failed to fetch"));
    console.log("HAS WELCOME:", body.includes("Welcome"));
    console.log("TOASTS:", body.split("\n").filter((l) => l.length < 120).slice(0, 30).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("NET ERRORS:", netErrors.length ? netErrors.join("\n  ") : "none");
    console.log("CONSOLE ERRORS:", consoleMsgs.length ? consoleMsgs.join("\n  ") : "none");
    await browser.close();
  }
}
main();