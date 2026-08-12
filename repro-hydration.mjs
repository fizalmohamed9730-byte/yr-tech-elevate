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
  page.on("console", (m) => consoleItems.push(`[c:${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => consoleItems.push(`[pageerror] ${e.message}`));

  try {
    await page.goto(`${BASE}/apply`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 6000));
    console.log("URL:", page.url());

    // Check React hydration: does the button have __react props?
    const h = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === "Submit Application");
      if (!btn) return JSON.stringify({ found: false });
      const keys = Object.keys(btn).filter((k) => k.includes("react"));
      const form = btn.closest("form");
      return JSON.stringify({
        found: true,
        hasReactProp: keys.length > 0,
        reactKeys: keys.slice(0, 4),
        buttonType: btn.getAttribute("type"),
        insideForm: !!form,
        formOnSubmit: form ? Object.keys(form).filter((k) => k.includes("react")).length : -1,
        htmlClass: document.documentElement.className,
        bodyClass: document.body.className,
      });
    });
    console.log("REACT PROPS:", h);

    // Try native requestSubmit to fire React onSubmit
    const subResult = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").trim() === "Submit Application");
      const form = btn && btn.closest("form");
      if (!form) return "no form";
      if (form.requestSubmit) { form.requestSubmit(btn); return "requestSubmit called"; }
      return "no requestSubmit";
    });
    console.log("SUBMIT RESULT:", subResult);
    await new Promise((r) => setTimeout(r, 4000));
    console.log("URL AFTER SUBMIT:", page.url());
    let body = await page.evaluate(() => document.body.innerText);
    console.log("BODY HAS TOAST:", body.split("\n").filter((l) => l.trim() && l.length < 80 && (l.includes("Account") || l.includes("Application") || l.includes("error") || l.includes("required") || l.includes("Valid") || l.includes("choose") || l.includes("select"))).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("CONSOLE:", consoleItems.slice(0, 30).join("\n  "));
    await browser.close();
  }
}
main();