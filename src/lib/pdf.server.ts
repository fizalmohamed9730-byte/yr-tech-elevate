import PDFDocument from "pdfkit";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";
import { COMPANY } from "./company";

// In production (Vercel), src/assets/ does not exist. We resolve assets
// from multiple fallback paths so local dev, CI, and serverless all work.
function resolveAssetPath(filename: string): string | null {
  const candidates = [
    join(process.cwd(), "src", "assets", filename),
    join(process.cwd(), "assets", filename),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function loadAssetBuffer(filename: string): Buffer | null {
  const resolved = resolveAssetPath(filename);
  if (!resolved) {
    console.warn(`[pdf.server] Asset not found: ${filename} (searched multiple paths)`);
    return null;
  }
  try {
    return readFileSync(resolved);
  } catch (err) {
    console.error(`[pdf.server] Failed to read asset ${filename}:`, err);
    return null;
  }
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const BLUE = toHex(37, 99, 235);
const DARK = toHex(15, 23, 42);
const GRAY = toHex(100, 100, 100);
const BORDER_GRAY = toHex(220, 225, 230);
const LIGHT_BG = toHex(245, 247, 250);
const SIG_GRAY = toHex(80, 80, 80);

function pt(mm: number): number {
  return mm * 2.83465;
}

function drawVectorSeal(doc: PDFKit.PDFDocument, x: number, y: number, radius: number) {
  doc.save();
  doc.circle(x, y, radius).lineWidth(0.8).strokeColor(BLUE).stroke();
  doc.circle(x, y, radius - 1.5).lineWidth(0.3).stroke();
  doc.fontSize(6.5).font("Helvetica-Bold").fillColor(BLUE).text("YR NOVATECH", x - radius, y - pt(9.5), { width: radius * 2, align: "center" });
  doc.fontSize(4.5).font("Helvetica").text("UDYAM-TN-17-0077694", x - radius, y - pt(5.5), { width: radius * 2, align: "center" });
  doc.fontSize(3.8).text("INNOVATE • DEVELOP • DELIVER", x - radius, y - pt(1.5), { width: radius * 2, align: "center" });
  doc.text("TAMIL NADU, INDIA", x - radius, y + pt(2.5), { width: radius * 2, align: "center" });
  doc.fontSize(5.5).text("★ OFFICIAL SEAL ★", x - radius, y + pt(7.5), { width: radius * 2, align: "center" });
  doc.restore();
}

export async function generateOfferLetterPDFBuffer(data: {
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string;
  startedAt?: string | null;
  duration?: string | null;
}): Promise<Buffer> {
  console.log(`[pdf.server] Generating offer letter PDF for ${data.internshipCode}`);

  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      const buf = Buffer.concat(chunks);
      console.log(`[pdf.server] Offer letter PDF generated: ${buf.length} bytes`);
      resolve(buf);
    });
    doc.on("error", (err) => {
      console.error("[pdf.server] PDF generation error:", err);
      reject(err);
    });
  });

  const logoBuf = loadAssetBuffer("company-logo.png");
  const sealBuf = loadAssetBuffer("company-seal.png");
  const sigBuf = loadAssetBuffer("fizal-mohamed-signature-transparent.png");
  const msmeBuf = loadAssetBuffer("msme-logo.png");

  console.log(`[pdf.server] Assets loaded: logo=${!!logoBuf}, seal=${!!sealBuf}, sig=${!!sigBuf}, msme=${!!msmeBuf}`);

  // Border
  doc.save();
  doc.rect(pt(10), pt(10), pt(190), pt(277)).lineWidth(0.8).strokeColor(BLUE).stroke();
  doc.rect(pt(11.2), pt(11.2), pt(187.6), pt(274.6)).lineWidth(0.2).stroke();
  doc.restore();

  // Logo
  if (logoBuf) {
    try { doc.image(logoBuf, pt(16), pt(16), { width: pt(22), height: pt(15) }); } catch {}
  }

  // Company Name
  doc.save();
  doc.fontSize(22).font("Helvetica-Bold").fillColor(BLUE).text(COMPANY.name, pt(16), pt(18), { width: pt(190) - pt(16) * 2, align: "center" });
  doc.fontSize(8.5).font("Helvetica").fillColor(GRAY).text("INNOVATE • DEVELOP • DELIVER", pt(16), pt(24), { width: pt(190) - pt(16) * 2, align: "center" });
  doc.restore();

  // Right info
  doc.save();
  doc.fontSize(7.5).font("Helvetica").fillColor(GRAY);
  doc.text("UDYAM-TN-17-0077694", pt(160), pt(19), { width: pt(34), align: "right" });
  doc.text(`Email: ${COMPANY.email}`, pt(160), pt(23), { width: pt(34), align: "right" });
  doc.text("Web: www.yrnovatech.online", pt(160), pt(27), { width: pt(34), align: "right" });
  doc.restore();

  // Divider
  doc.save().moveTo(pt(16), pt(38)).lineTo(pt(194), pt(38)).lineWidth(0.5).strokeColor(BLUE).stroke().restore();

  // Title
  doc.save().fontSize(14).font("Helvetica-Bold").fillColor(BLUE).text("INTERNSHIP OFFER LETTER", pt(16), pt(44), { width: pt(178), align: "center" }).restore();

  // Date + Reference
  const startDate = data.startedAt ? new Date(data.startedAt) : new Date();
  const today = startDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const durationMonths = parseInt((data.duration ?? "1 Month").match(/\d+/)?.[0] ?? "1", 10) || 1;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const endDateText = endDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  doc.save().fontSize(9.5).font("Helvetica").fillColor(GRAY);
  doc.text(`Date: ${today}`, pt(16), pt(56));
  doc.text(`Reference Number: ${data.offerCode}`, pt(16), pt(56), { width: pt(178), align: "right" });
  doc.restore();

  // Recipient
  doc.save().fontSize(9.5).font("Helvetica-Bold").fillColor(DARK);
  doc.text(`To, ${data.fullName}`, pt(16), pt(66));
  doc.restore();
  doc.save().fontSize(9.5).font("Helvetica").fillColor(GRAY);
  doc.text(`Internship ID: ${data.internshipCode}`, pt(16), pt(70.5));
  doc.restore();

  // Body
  let bodyY = pt(80);
  doc.save().fontSize(10.5).font("Helvetica").fillColor(DARK);

  doc.text(`Dear ${data.fullName},`, pt(16), bodyY);
  bodyY += pt(8);

  const paragraphs = [
    "We are pleased to offer you an Internship opportunity at YR NOVATECH. Your application has been successfully accepted.",
    "This Remote Based Internship program is designed to provide practical industry exposure, project experience, and professional skill development in your selected domain.",
    "Upon successful completion of the internship requirements and assigned project work, the intern will be eligible to receive the Internship Completion Certificate.",
    "We wish you success throughout your internship journey with YR NOVATECH.",
  ];

  for (const p of paragraphs) {
    doc.text(p, pt(16), bodyY, { width: pt(178), lineGap: 2 });
    bodyY += doc.heightOfString(p, { width: pt(178) }) + pt(4);
  }

  doc.text("Welcome to YR NOVATECH.", pt(16), bodyY);
  bodyY += pt(10);
  doc.restore();

  // Internship Details Box
  doc.save();
  doc.rect(pt(16), bodyY, pt(178), pt(34)).fill(LIGHT_BG);
  doc.rect(pt(16), bodyY, pt(178), pt(34)).lineWidth(0.3).strokeColor(BORDER_GRAY).stroke();

  const labels = ["• Internship ID:", "• Domain:", "• Start Date:", "• End Date:", "• Duration:"];
  const values = [
    data.internshipCode,
    `${data.domain} – Remote Based Internship (${data.duration || "1 Month"})`,
    today,
    endDateText,
    data.duration || "1 Month",
  ];

  labels.forEach((label, idx) => {
    const rowY = bodyY + pt(5 + idx * 6);
    doc.fontSize(8).font("Helvetica-Bold").fillColor(BLUE).text(label, pt(22), rowY, { width: pt(38) });
    doc.fontSize(8).font("Helvetica").fillColor(DARK).text(values[idx], pt(60), rowY, { width: pt(130) });
  });
  doc.restore();

  // Signature Section
  const footerY = bodyY + pt(45);
  doc.save().fontSize(10.5).font("Helvetica-Bold").fillColor(DARK).text("For YR NOVATECH,", pt(16), footerY).restore();

  if (sigBuf) {
    try {
      doc.image(sigBuf, pt(16), footerY + pt(2), { width: pt(12), height: pt(12) });
    } catch {}
  } else {
    doc.save().font("Times-Italic").fontSize(18).fillColor(BLUE).text("S. Fizal Mohamed", pt(16), footerY + pt(12)).restore();
  }

  // Signature line
  doc.save().moveTo(pt(16), footerY + pt(16)).lineTo(pt(75), footerY + pt(16)).lineWidth(0.4).strokeColor(BLUE).stroke().restore();

  // Founder info
  doc.save().fontSize(9.5).font("Helvetica-Bold").fillColor(DARK).text("S. Fizal Mohamed", pt(16), footerY + pt(21)).restore();
  doc.save().fontSize(9.5).font("Helvetica").fillColor(DARK).text("Founder & CEO", pt(16), footerY + pt(25)).restore();
  doc.save().fontSize(9.5).font("Helvetica").fillColor(DARK).text("YR NOVATECH", pt(16), footerY + pt(29)).restore();

  // Seal
  if (sealBuf) {
    try {
      doc.image(sealBuf, pt(142), footerY - pt(4), { width: pt(36), height: pt(36) });
    } catch {
      drawVectorSeal(doc, pt(160), footerY + pt(14), pt(18));
    }
  } else {
    drawVectorSeal(doc, pt(160), footerY + pt(14), pt(18));
  }

  // MSME Logo
  if (msmeBuf) {
    try {
      doc.image(msmeBuf, pt(150), footerY + pt(34), { width: pt(18) });
    } catch {}
  }

  doc.end();
  return finished;
}

export async function generateCertificatePDFBuffer(data: {
  fullName: string;
  domain: string;
  internshipCode: string;
  certificateCode: string;
  issuedAt?: string | null;
  duration?: string | null;
}): Promise<Buffer> {
  console.log(`[pdf.server] Generating certificate PDF for ${data.internshipCode}`);

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      const buf = Buffer.concat(chunks);
      console.log(`[pdf.server] Certificate PDF generated: ${buf.length} bytes`);
      resolve(buf);
    });
    doc.on("error", (err) => {
      console.error("[pdf.server] Certificate PDF generation error:", err);
      reject(err);
    });
  });

  const logoBuf = loadAssetBuffer("company-logo.png");
  const sealBuf = loadAssetBuffer("company-seal.png");
  const sigBuf = loadAssetBuffer("fizal-mohamed-signature-transparent.png");
  const msmeBuf = loadAssetBuffer("msme-logo.png");

  console.log(`[pdf.server] Assets loaded: logo=${!!logoBuf}, seal=${!!sealBuf}, sig=${!!sigBuf}, msme=${!!msmeBuf}`);

  // Border
  doc.save();
  doc.rect(pt(8), pt(8), pt(281), pt(194)).lineWidth(2).strokeColor(BLUE).stroke();
  doc.rect(pt(12), pt(12), pt(273), pt(186)).lineWidth(0.5).stroke();
  doc.restore();

  // Logo
  if (logoBuf) {
    try { doc.image(logoBuf, pt(138.5), pt(14), { width: pt(20), height: pt(20) }); } catch {}
  }

  // Company name
  doc.save().fontSize(24).font("Helvetica-Bold").fillColor(BLUE).text(COMPANY.name, pt(0), pt(36), { width: 841.89, align: "center" }).restore();
  doc.save().fontSize(10).font("Helvetica").fillColor(GRAY).text(COMPANY.tagline, pt(0), pt(43), { width: 841.89, align: "center" }).restore();

  // Certificate title
  doc.save().fontSize(32).font("Times-Bold").fillColor(DARK).text("Certificate of Completion", pt(0), pt(62), { width: 841.89, align: "center" }).restore();

  // "This is to certify that"
  doc.save().fontSize(13).font("Helvetica").fillColor(DARK).text("This is to certify that", pt(0), pt(80), { width: 841.89, align: "center" }).restore();

  // Intern name
  doc.save().fontSize(28).font("Times-Bold").fillColor(BLUE).text(data.fullName, pt(0), pt(96), { width: 841.89, align: "center" }).restore();

  // Completion text
  doc.save().fontSize(12).font("Helvetica").fillColor(DARK);
  const completionText = `has successfully completed the project-based internship program at ${COMPANY.name}.`;
  doc.text(completionText, pt(0), pt(110), { width: 841.89, align: "center" });
  doc.restore();

  // Domain/Duration
  doc.save().fontSize(11).font("Helvetica-Bold").fillColor(BLUE);
  doc.text(`Domain: ${data.domain}  |  Duration: ${data.duration || "1 Month"}`, pt(0), pt(118), { width: 841.89, align: "center" });
  doc.text(`Mode: Remote  |  Internship ID: ${data.internshipCode}`, pt(0), pt(124), { width: 841.89, align: "center" });
  doc.restore();

  // Issued date
  const issued = data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  doc.save().fontSize(10).font("Helvetica").fillColor(DARK).text(`Issued: ${issued}`, pt(0), pt(132), { width: 841.89, align: "center" }).restore();

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(`Certificate: ${data.certificateCode} | Intern: ${data.internshipCode} | ${COMPANY.name}`, { margin: 0, width: 180 });
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrBuf = Buffer.from(qrBase64, "base64");
    doc.image(qrBuf, pt(240), pt(150), { width: pt(32), height: pt(32) });
  } catch {}

  // Signature
  const lineY = pt(172);
  const sigH = pt(28);
  const sigY = lineY - sigH - pt(4);

  if (sigBuf) {
    try { doc.image(sigBuf, pt(40), sigY, { height: sigH }); } catch {}
  } else {
    doc.save().font("Times-Italic").fontSize(20).fillColor(BLUE).text(COMPANY.founder, pt(60), sigY + sigH * 0.6).restore();
  }

  // Signature line
  doc.save().moveTo(pt(40), lineY).lineTo(pt(110), lineY).lineWidth(0.5).strokeColor(SIG_GRAY).stroke().restore();

  // Founder info
  doc.save().fontSize(11).font("Helvetica").fillColor(DARK).text(COMPANY.founder, pt(40), lineY + pt(5), { width: pt(70), align: "center" }).restore();
  doc.save().fontSize(9).font("Helvetica").fillColor(DARK).text(COMPANY.founderTitle, pt(40), lineY + pt(11), { width: pt(70), align: "center" }).restore();

  // Seal
  if (sealBuf) {
    try { doc.image(sealBuf, pt(155), pt(150), { width: pt(30), height: pt(30) }); } catch {
      drawVectorSeal(doc, pt(170), pt(165), pt(13));
    }
  } else {
    drawVectorSeal(doc, pt(170), pt(165), pt(13));
  }

  // MSME Logo
  if (msmeBuf) {
    try {
      doc.image(msmeBuf, pt(20), pt(170), { width: pt(18) });
    } catch {}
  }

  // Bottom row
  doc.save().fontSize(9).font("Helvetica").fillColor(SIG_GRAY);
  doc.text(`Certificate ID: ${data.certificateCode}`, pt(20), pt(193));
  doc.text(`Internship ID: ${data.internshipCode}`, pt(0), pt(193), { width: 841.89, align: "center" });
  doc.text(`Udyam: ${COMPANY.udyam}`, pt(0), pt(193), { width: 841.89 - pt(20), align: "right" });
  doc.restore();

  doc.end();
  return finished;
}
