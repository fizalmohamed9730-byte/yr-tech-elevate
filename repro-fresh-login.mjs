import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";
const EMAIL = `fresh${Date.now()}@test.local`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const consoleItems = [];
  page.on("console", (m) => consoleItems.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => consoleItems.push(`[pageerror] ${e.message}`));

  try {
    // Open apply page
    await page.goto(`${BASE}/apply`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));
    console.log("1) apply URL:", page.url());

    // Fill all fields
    await page.click('input[name="fullName"]'); await page.type('input[name="fullName"]', "Fresh Test Biz");
    await page.click('input[name="email"]'); await page.type('input[name="email"]', EMAIL);
    await page.click('input[name="phone"]'); await page.type('input[name="phone"]', "9876567890");
    await page.click('input[name="college"]'); await page.type('input[name="college"]', "GC");
    await page.click('input[name="department"]'); await page.type('input[name="department"]', "CS");
    await page.click('input[name="password"]'); await page.type('input[name="password"]', "password123");
    await page.click('input[name="confirmPassword"]'); await page.type('input[name="confirmPassword"]', "password123");

    // year select
    const yr = await page.$('select[name="year"]');
    if (yr) {
      const val = await page.evaluate((e) => e.querySelectorAll("option")[1].value, yr);
      await page.select('select[name="year"]', val);
    }
    const dom = await page.$('select[name="domainId"]');
    if (dom) {
      const val = await page.evaluate((e) => e.querySelectorAll("option")[1].value, dom);
      await page.select('select[name="domainId"]', val);
    }
    const dur = await page.$('select[name="duration"]');
    if (dur) {
      const val = await page.evaluate((e) => e.querySelectorAll("option")[1].value, dur);
      await page.select('select[name="duration"]', val);
    }

    // Submit: click the button that contains "Submit Application"
    const sub = await page.$$("button");
    for (const b of sub) {
      const txt = (await page.evaluate((el) => el.textContent, b)).trim();
      if (txt === "Submit Application") { await b.click(); console.log("2) clicked Submit Application"); break; }
    }
    let landed = false;
    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const url = page.url();
      if (!url.includes("/apply")) { landed = true; console.log("3) left /apply ->", url); break; }
    }
    if (!landed) console.log("3) STILL ON /apply after 40s");
    await new Promise((r) => setTimeout(r, 3000));
    let body = await page.evaluate(() => document.body.innerText);
    console.log("3b) URL:", page.url());
    console.log("3c) TOASTS:", body.split("\n").filter((l) => l.trim() && l.length < 90 && (l.includes("Application") || l.includes("Dashboard") || l.includes("Redirect") || l.includes("error") || l.includes("Error") || l.includes("offer"))).join(" | "));

    // Now sign out (we should be logged in)
    const so = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a"));
      const b = els.find((el) => el.textContent && el.textContent.trim() === "Sign out");
      if (b) { b.click(); return true; }
      return false;
    });
    console.log("4) sign out clicked:", so);
    await new Promise((r) => setTimeout(r, 2500));

    // Sign back in via /auth
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.click('input[name="email"]'); await page.type('input[name="email"]', EMAIL);
    await page.click('input[name="password"]'); await page.type('input[name="password"]', "password123");
    // click sign in submit button (the Sign in form one)
    const btns = await page.$$("button");
    for (const b of btns) {
      const txt = (await page.evaluate((el) => el.textContent, b)).trim();
      if (txt === "Sign in") { await b.click(); console.log("5) clicked Sign in"); break; }
    }
    await new Promise((r) => setTimeout(r, 2500));
    console.log("6) after login URL:", page.url());
    body = await page.evaluate(() => document.body.innerText);
    console.log("7) HAS ACCESS DENIED:", body.includes("Access denied"));
    console.log("7b) HAS WELCOME BACK:", body.includes("Welcome back"));
    console.log("8) FINAL URL:", page.url());
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("CONSOLE (last 40):", consoleItems.slice(-40).join("\n  "));
    await browser.close();
  }
}
main();