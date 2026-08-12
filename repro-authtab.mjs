import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";
const EMAIL = `authtab${Date.now()}@test.local`;

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
    // 1. Register via /auth Register tab
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const clicked = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button')).filter((b) => b.textContent && b.textContent.trim().toLowerCase().includes("register"));
      const tab = tabs.find((t) => t.textContent && t.textContent.trim().toLowerCase() === "register");
      const use = tabs[0];
      if (use) { use.click(); return use.textContent.trim(); }
      return null;
    });
    console.log("REGISTER TAB CLICKED:", clicked);
    await new Promise((r) => setTimeout(r, 1200));

    const regInputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input[name],select[name]')).map((el) => ({ tag: el.tagName, name: el.getAttribute("name"), type: el.type, id: el.id }))
    );
    console.log("REGISTER FORM INPUTS:", JSON.stringify(regInputs));

    // Fill only the register form fields (the ones in the register schema)
    const fill = async (sel, val) => {
      const el = await page.$(sel);
      if (el) { await el.type(val); return true; }
      return false;
    };
    await fill('input[name="fullName"]', "Auth Tab Intern");
    await fill('input[name="email"]', EMAIL);
    await fill('input[name="phone"]', "9876543211");
    await fill('input[name="college"]', "Auth Tab College");
    await fill('input[name="department"]', "CS");
    await fill('input[name="password"]', "password123");
    await fill('input[name="confirmPassword"]', "password123");

    // selects
    const sel = async (name) => {
      const el = await page.$(`select[name="${name}"]`);
      if (el) {
        const val = await page.evaluate((e) => e.querySelectorAll("option")[1]?.value, el);
        if (val) await page.select(`select[name="${name}"]`, val);
      }
    };
    await sel("domainId");
    await sel("duration");
    await sel("year");

    const subClick = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent && b.textContent.trim().toLowerCase().includes("register"));
      const btn = btns[0];
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log("REGISTER SUBMIT CLICKED:", subClick);
    for (let i = 0; i < 70 && page.url().includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 1500));
    console.log("AFTER REGISTER URL:", page.url());
    let body = await page.evaluate(() => document.body.innerText);
    console.log("REGISTER TOASTS:", body.split("\n").filter((l) => l.trim() && l.length < 90).slice(0, 12).join(" | "));

    // 2. Sign out
    const so = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a"));
      const b = els.find((el) => el.textContent && el.textContent.trim() === "Sign out");
      if (b) { b.click(); return true; }
      return false;
    });
    console.log("SIGN OUT CLICKED:", so);
    await new Promise((r) => setTimeout(r, 2500));
    console.log("AFTER SIGNOUT URL:", page.url());

    // 3. Sign back in
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', "password123");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent && b.textContent.trim().toLowerCase() === "sign in");
      if (btns[0]) btns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    for (let i = 0; i < 70 && page.url().includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 3500));
    console.log("AFTER LOGIN URL:", page.url());
    body = await page.evaluate(() => document.body.innerText);
    console.log("HAS ACCESS DENIED:", body.includes("Access denied"));
    console.log("HAS WELCOME BACK:", body.includes("Welcome back"));
    console.log("FINAL TOASTS:", body.split("\n").filter((l) => l.trim() && l.length < 90).slice(0, 20).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("CONSOLE:", consoleItems.slice(0, 30).join("\n  "));
    await browser.close();
  }
}
main();