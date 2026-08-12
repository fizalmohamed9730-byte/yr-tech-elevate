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
  try {
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));
    const before = await page.evaluate(() => Array.from(document.querySelectorAll("form input, form select")).map((el) => el.getAttribute("name") || el.id));
    console.log("BEFORE TAB:", JSON.stringify(before));
    const tab = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[role="tab"]'));
      const t = els.find((el) => el.textContent && el.textContent.trim() === "Register");
      if (t) { t.click(); return true; }
      return false;
    });
    console.log("clicked:", tab);
    await new Promise((r) => setTimeout(r, 2000));
    const after = await page.evaluate(() => Array.from(document.querySelectorAll("form input, form select, [role=tab], [role=tabpanel]")).map((el) => ({ tag: el.tagName, name: el.getAttribute("name") || "", id: el.id || "", role: el.getAttribute("role") || "", aria: el.getAttribute("data-state") || "" })));
    console.log("AFTER TAB:", JSON.stringify(after, null, 1));
    const content = await page.evaluate(() => document.querySelector('[role="tabpanel"]')?.textContent?.slice(0, 300));
    console.log("TABPANEL TEXT:", JSON.stringify(content));
  } catch (err) {
    console.log("FAILED:", err.message);
  } finally {
    await browser.close();
  }
}
main();