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
  const msgs = [];
  page.on("console", (m) => msgs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => msgs.push(`[pageerror] ${e.message}`));

  try {
    await page.goto(`${BASE}/apply`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 3000));
    console.log("URL:", page.url());
    const inputs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input,select,button,textarea")).map((el) => ({
        tag: el.tagName,
        name: el.getAttribute("name") || "",
        id: el.id || "",
        type: el.type || "",
        placeholder: el.getAttribute("placeholder") || "",
        text: (el.textContent || "").trim().slice(0, 30),
      }))
    );
    console.log("ELEMENTS:", JSON.stringify(inputs, null, 2));
    const body = await page.evaluate(() => document.body.innerText.slice(0, 1500));
    console.log("BODY:", body);
    await page.screenshot({ path: "apply.png" });
    console.log("SCREENSHOT SAVED");
  } catch (err) {
    console.log("FAILED:", err.message);
  } finally {
    console.log("MSGS:", msgs.slice(0, 20).join("\n"));
    await browser.close();
  }
}
main();