import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";
const EMAIL = `newtest${Date.now()}@test.local`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });
  const page = await browser.newPage();
  const netErrors = [];
  const consoleMsgs = [];
  page.on("requestfailed", (req) => netErrors.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText}`));
  page.on("console", (m) => {
    if (m.type() === "error") consoleMsgs.push(m.text());
  });
  page.on("pageerror", (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

  try {
    // --- 1. Load registration form ---
    await page.goto(`${BASE}/apply`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    console.log("APPLY URL:", page.url());
    const applyBody = await page.evaluate(() => document.body.innerText);
    console.log("APPLY HAS FORM:", applyBody.includes("First name") || applyBody.includes("Full name") || applyBody.includes("fullname"));

    // ---- if we got redirected to /auth (must be logged in), register via auth page instead ----
    if (page.url().includes("/auth")) {
      console.log("apply required auth -> using /auth register tab");
      await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
      await new Promise((r) => setTimeout(r, 1500));

      // Click "Register" tab
      const tabs = await page.$$('[role="tab"]');
      for (const t of tabs) {
        const txt = await page.evaluate((el) => el.textContent, t);
        if (txt && txt.toLowerCase().includes("register")) { await t.click(); break; }
      }
      await new Promise((r) => setTimeout(r, 800));
    }

    // --- 2. Fill + submit registration ---
    await page.type('input[name="fullName"]', "New Test Intern");
    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="phone"]', "1234567890");
    await page.type('input[name="college"]', "Test College");
    await page.type('input[name="department"]', "CSE");
    await page.type('input[name="password"]', "password123");
    await page.type('input[name="confirmPassword"]', "password123");

    // selects
    const yearSel = await page.$('select[name="year"]');
    if (yearSel) await page.select('select[name="year"]', await page.evaluate((el) => el.querySelectorAll("option")[1]?.value || el.querySelector("option").value, yearSel));
    const durSel = await page.$('select[name="duration"]');
    if (durSel) await page.select('select[name="duration"]', await page.evaluate((el) => el.querySelectorAll("option")[1]?.value || el.querySelector("option").value, durSel));
    const domainSel = await page.$('select[name="domainId"]');
    if (domainSel) await page.select('select[name="domainId"]', await page.evaluate((el) => el.querySelectorAll("option")[1]?.value || el.querySelector("option").value, domainSel));

    const submitClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.trim().toLowerCase().includes("submit application"));
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log("APPLY SUBMIT CLICKED:", submitClicked);
    for (let i = 0; i < 60 && page.url().includes("/apply"); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 2500));
    const applyBody2 = await page.evaluate(() => document.body.innerText);
    console.log("REGISTER RESULT HAS TOAST:", applyBody2.split("\n").filter((l) => l.trim() && l.length < 90).slice(0, 25).join(" | "));

    // --- 3. Sign out ---
    const signOutBtn = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a"));
      const btn = els.find((el) => el.textContent && el.textContent.trim() === "Sign out");
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log("SIGN OUT CLICKED:", signOutBtn);
    await new Promise((r) => setTimeout(r, 2500));
    console.log("AFTER SIGNOUT URL:", page.url());

    // --- 4. Sign back in ---
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', "password123");
    await page.click('form button[type="submit"]');
    for (let i = 0; i < 60 && page.url().includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 3000));
    console.log("AFTER LOGIN URL:", page.url());
    const body = await page.evaluate(() => document.body.innerText);
    console.log("HAS ACCESS DENIED:", body.includes("Access denied"));
    console.log("HAS WELCOME BACK:", body.includes("Welcome back"));
    console.log("FINAL TOASTS:", body.split("\n").filter((l) => l.trim() && l.length < 90).slice(0, 20).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("NET ERRORS:", netErrors.length ? netErrors.join("\n  ") : "none");
    console.log("CONSOLE ERRORS:", consoleMsgs.length ? consoleMsgs.join("\n  ") : "none");
    await browser.close();
  }
}
main();