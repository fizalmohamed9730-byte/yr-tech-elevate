import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:5174";
const EMAIL = `rtab${Date.now()}@test.local`;

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
  page.on("requestfailed", (r) => consoleItems.push(`[reqfail] ${r.method()} ${r.url()} ${r.failure()?.errorText}`));

  try {
    await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Click Register tab using real DOM click
    const tabClicked = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[role="tab"],button'));
      const t = els.find((el) => el.textContent && el.textContent.trim() === "Register");
      if (t) { t.click(); return true; }
      return false;
    });
    console.log("TAB CLICKED:", tabClicked);
    await new Promise((r) => setTimeout(r, 1200));

    const regFields = await page.evaluate(() => Array.from(document.querySelectorAll("#su-name, #su-email, #su-phone, #su-college, #su-dept, #su-year, #su-domain, #su-duration, #su-password, #su-confirm")).map((el) => ({ id: el.id, name: el.getAttribute("name"), tag: el.tagName })));
    console.log("REG FIELDS:", JSON.stringify(regFields));

    const type = async (sel, val) => {
      await page.click(sel);
      await page.keyboard.down("Control"); await page.keyboard.press("A"); await page.keyboard.up("Control");
      await page.type(sel, val);
    };
    await type("#su-name", "RegisterTab Intern");
    await type("#su-email", EMAIL);
    await type("#su-phone", "9876567800");
    await type("#su-college", "RT College");
    await type("#su-dept", "CSE");
    await type("#su-password", "password123");
    await type("#su-confirm", "password123");
    const sel = async (id) => {
      await page.select(id, await page.evaluate((s) => s.querySelectorAll("option")[1].value, await page.$(id)));
    };
    await sel("#su-year");
    await sel("#su-duration");
    await sel("#su-domain");

    // Click "Register & enroll" submit
    const sub = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button"));
      const b = els.find((el) => el.textContent && el.textContent.trim().toLowerCase().includes("register & enroll"));
      if (b) { b.click(); return true; }
      return false;
    });
    console.log("SUBMIT CLICKED:", sub);

    let url = "";
    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 500));
      url = page.url();
      if (!url.includes("/auth")) break;
    }
    await new Promise((r) => setTimeout(r, 4000));
    console.log("FINAL URL:", page.url());
    const body = await page.evaluate(() => document.body.innerText);
    console.log("SHORT LINES:", body.split("\n").filter((l) => l.trim() && l.length < 90 && !["YR NOVATECH","INNOVATE · DEVELOP · DELIVER","Home","About","Services","Internship","Projects","Contact","Sign in","Register","Email","Password","Remember me","Forgot password?","By continuing you agree to our terms."].includes(l.trim())).join(" | "));
  } catch (err) {
    console.log("E2E FAILED:", err.message);
  } finally {
    console.log("CONSOLE:", consoleItems.slice(-30).join("\n  "));
    await browser.close();
  }
}
main();