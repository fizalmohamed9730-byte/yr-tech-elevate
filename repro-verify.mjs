import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";
const EMAIL = `verify${Date.now()}@test.local`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const consoleItems = [];
  page.on("console", (m) => consoleItems.push(`[c:${m.type()}] ${m.text().slice(0, 300)}`));
  page.on("pageerror", (e) => consoleItems.push(`[pageerror] ${e.message}`));

  try {
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Click the Register tab with a REAL mouse click at its coordinates
    const tabBox = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[role="tab"]'));
      const t = els.find((el) => el.textContent && el.textContent.trim() === "Register");
      if (!t) return null;
      const r = t.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!tabBox) { console.log("NO REGISTER TAB"); return; }
    await page.mouse.click(tabBox.x, tabBox.y);
    await new Promise((r) => setTimeout(r, 1200));

    const visible = await page.evaluate(() => {
      const p = document.querySelector('[role="tabpanel"]');
      return p ? p.textContent.slice(0, 120) : "(no panel)";
    });
    console.log("ACTIVE PANEL TEXT:", JSON.stringify(visible));

    // Fill register form
    await page.type("#su-name", "Verify Flow Intern");
    await page.type("#su-email", EMAIL);
    await page.type("#su-phone", "9876543212");
    await page.type("#su-college", "V College");
    await page.type("#su-dept", "CS");
    await page.type("#su-password", "password123");
    await page.type("#su-confirm", "password123");
    const sel1 = await page.evaluate(() => Array.from(document.querySelectorAll("#su-year option")).map((o) => o.value));
    const sel2 = await page.evaluate(() => Array.from(document.querySelectorAll("#su-duration option")).map((o) => o.value));
    const sel3 = await page.evaluate(() => Array.from(document.querySelectorAll("#su-domain option")).map((o) => o.value));
    console.log("YEAR", JSON.stringify(sel1));
    console.log("DUR", JSON.stringify(sel2));
    console.log("DOMAIN", JSON.stringify(sel3));
    if (sel1[1]) await page.select("#su-year", sel1[1]);
    if (sel2[1]) await page.select("#su-duration", sel2[1]);
    if (sel3[1]) await page.select("#su-domain", sel3[1]);

    // Click submit with mouse
    const subBox = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button"));
      const b = els.find((el) => el.textContent && el.textContent.trim().toLowerCase().includes("register & enroll"));
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (subBox) { await page.mouse.click(subBox.x, subBox.y); await new Promise((r) => setTimeout(r, 1200)); }
    else console.log("NO REGISTER SUBMIT BUTTON");

    let url = page.url();
    for (let i = 0; i < 90 && url.includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
      url = page.url();
    }
    await new Promise((r) => setTimeout(r, 2500));
    console.log("A) after register URL:", page.url());
    let body = await page.evaluate(() => document.body.innerText);
    console.log("A) shows Access denied:", body.includes("Access denied"));
    console.log("A) toasts:", body.split("\n").filter((l) => l.trim() && l.length < 90 && !["YR NOVATECH","INNOVATE · DEVELOP · DELIVER","Home","About","Services","Internship","Projects","Contact","Sign in","Register"].includes(l.trim())).slice(0, 14).join(" | "));

    // Sign out (works with real clicks on buttons; try header)
    const so = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a"));
      const b = els.find((el) => el.textContent && el.textContent.trim() === "Sign out");
      if (b) { b.click(); return true; }
      return false;
    });
    console.log("B) sign out via DOM click:", so);
    await new Promise((r) => setTimeout(r, 2000));
    console.log("B) after signout URL:", page.url());

    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.type("input[name=email]", EMAIL);
    await page.type("input[name=password]", "password123");
    const signInBox = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button"));
      const b = els.find((el) => el.textContent && el.textContent.trim() === "Sign in");
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (signInBox) await page.mouse.click(signInBox.x, signInBox.y);
    await new Promise((r) => setTimeout(r, 1500));
    url = page.url();
    for (let i = 0; i < 90 && url.includes("/auth"); i++) {
      await new Promise((r) => setTimeout(r, 500));
      url = page.url();
    }
    await new Promise((r) => setTimeout(r, 3000));
    console.log("C) after login URL:", page.url());
    body = await page.evaluate(() => document.body.innerText);
    console.log("C) Access denied:", body.includes("Access denied"));
    console.log("C) Welcome back:", body.includes("Welcome back"));
    console.log("C) toasts:", body.split("\n").filter((l) => l.trim() && l.length < 90 && !["YR NOVATECH","INNOVATE · DEVELOP · DELIVER","Home","About","Services","Internship","Projects","Contact","Sign in","Register","Dashboard","Sign out"].includes(l.trim())).slice(0, 14).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("CONSOLE:", consoleItems.slice(-25).join("\n  "));
    await browser.close();
  }
}
main();