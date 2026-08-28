import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { COMPANY } from "./company";
import logoUrl from "@/assets/company-logo.png";
import sealUrl from "@/assets/company-seal.png";
import signatureUrl from "@/assets/fizal-mohamed-signature-transparent.png";
import msmeLogoUrl from "@/assets/msme-logo.png";
import { supabase } from "@/integrations/supabase/client";

// Helper to preload images safely in the browser
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Preprocess signature image: darken strokes while keeping transparent background
function darkenSignature(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 0) {
      // Darken non-transparent pixels significantly
      const factor = 0.35;
      data[i] = Math.round(data[i] * factor);
      data[i + 1] = Math.round(data[i + 1] * factor);
      data[i + 2] = Math.round(data[i + 2] * factor);
      // Boost alpha slightly for bolder strokes
      data[i + 3] = Math.min(255, Math.round(a * 1.3));
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function drawVectorSeal(doc: jsPDF, sealY: number) {
  doc.setDrawColor(37, 99, 235);
  doc.setTextColor(37, 99, 235);
  doc.setLineWidth(0.8);
  doc.circle(156, sealY, 18);
  doc.setLineWidth(0.3);
  doc.circle(156, sealY, 16.5);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("YR NOVATECH", 156, sealY - 9.5, { align: "center" });
  doc.setFontSize(4.5);
  doc.text("UDYAM-TN-17-0077694", 156, sealY - 5.5, { align: "center" });
  doc.setFontSize(3.8);
  doc.text("INNOVATE • DEVELOP • DELIVER", 156, sealY - 1.5, { align: "center" });
  doc.text("TAMIL NADU, INDIA", 156, sealY + 2.5, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("★ OFFICIAL SEAL ★", 156, sealY + 7.5, { align: "center" });
}

function drawVectorCertificateSeal(doc: jsPDF, x = 170, y = 165) {
  doc.setDrawColor(37, 99, 235);
  doc.setTextColor(37, 99, 235);
  doc.circle(x, y, 13);
  doc.circle(x, y, 15);
  doc.setFontSize(7);
  doc.text("YR NOVATECH", x, y - 2, { align: "center" });
  doc.text("OFFICIAL SEAL", x, y + 2, { align: "center" });
}

function drawVectorIdCardSeal(doc: jsPDF, x = 68, y = 118) {
  doc.setDrawColor(37, 99, 235);
  doc.setTextColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.circle(x, y, 7);
  doc.setLineWidth(0.3);
  doc.circle(x, y, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4);
  doc.text("YR NOVATECH", x, y - 3.5, { align: "center" });
  doc.setFontSize(2.8);
  doc.text("UDYAM-TN-17-0077694", x, y - 0.5, { align: "center" });
  doc.setFontSize(2.5);
  doc.text("INNOVATE • DEVELOP • DELIVER", x, y + 2, { align: "center" });
  doc.setFontSize(3.5);
  doc.text("★ OFFICIAL SEAL ★", x, y + 5, { align: "center" });
}

export async function generateOfferLetterPDF(data: {
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string;
  startedAt?: string | null;
  duration?: string | null;
}): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  
  // Preload logo, seal, signature, and MSME logo images
  const [logo, seal, signature, msmeLogo] = await Promise.all([
    loadImage(logoUrl),
    loadImage(sealUrl),
    loadImage(signatureUrl),
    loadImage(msmeLogoUrl)
  ]);

  // Preprocess signature to make it darker/bolder
  const darkSignature = signature ? darkenSignature(signature) : null;

  // --- Outer Border (Premium HR styling) ---
  doc.setDrawColor(37, 99, 235); // royal blue
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.2);
  doc.rect(11.2, 11.2, 187.6, 274.6);

  // --- 1. HEADER LOGO & INFO ---
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 16, 16, 22, 15);
    } catch (err) {
      console.error("Failed to load logo on offer letter", err);
    }
  }

  // Centered Company Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // YR blue
  doc.text("YR NOVATECH", 105, 24, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100);
  doc.text("INNOVATE • DEVELOP • DELIVER", 105, 29, { align: "center" });

  // MSME Logo + Udyam Registration at the top right
  if (msmeLogo) {
    try {
      const msmeW = 12;
      const msmeH = msmeW * (msmeLogo.naturalHeight / msmeLogo.naturalWidth);
      doc.addImage(msmeLogo, "PNG", 162, 14, msmeW, msmeH);
    } catch (err) {
      console.error("Failed to render MSME logo header on offer letter", err);
    }
  }
  doc.setFontSize(7.5);
  doc.text(`Udyam Registration No:`, 176, 18, { align: "right" });
  doc.text(`${COMPANY.udyam}`, 192, 22, { align: "right" });
  doc.text(`Email: ${COMPANY.email}`, 192, 26, { align: "right" });
  doc.text(`Web: www.yrnovatech.online`, 192, 30, { align: "right" });

  // Divider Line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(16, 38, 194, 38);

  // --- 2. TITLE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text("INTERNSHIP OFFER LETTER", 105, 48, { align: "center" });

  // --- 3. METADATA FIELDS ---
  const startDate = data.startedAt ? new Date(data.startedAt) : new Date();
  const today = startDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const durationMonths = parseInt((data.duration ?? "1 Month").match(/\d+/)?.[0] ?? "1", 10) || 1;
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const endDateText = endDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(70);
  doc.text(`Date: ${today}`, 16, 58);
  doc.text(`Reference Number: ${data.offerCode}`, 194, 58, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`To, ${data.fullName}`, 16, 68);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Internship ID: ${data.internshipCode}`, 16, 72.5);

  // --- 4. BODY PARAGRAPHS ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  let bodyY = 82;

  doc.text(`Dear ${data.fullName},`, 16, bodyY);
  bodyY += 8;

  const p1 = "We are pleased to offer you an Internship opportunity at YR NOVATECH. Your application has been successfully accepted.";
  const p1Lines = doc.splitTextToSize(p1, 178);
  doc.text(p1Lines, 16, bodyY);
  bodyY += p1Lines.length * 5.5 + 2;

  const p2 = "This Remote Based Internship program is designed to provide practical industry exposure, project experience, and professional skill development in your selected domain.";
  const p2Lines = doc.splitTextToSize(p2, 178);
  doc.text(p2Lines, 16, bodyY);
  bodyY += p2Lines.length * 5.5 + 2;

  const p3 = "Upon successful completion of the internship requirements and assigned project work, the intern will be eligible to receive the Internship Completion Certificate.";
  const p3Lines = doc.splitTextToSize(p3, 178);
  doc.text(p3Lines, 16, bodyY);
  bodyY += p3Lines.length * 5.5 + 2;

  const p4 = "We wish you success throughout your internship journey with YR NOVATECH.";
  const p4Lines = doc.splitTextToSize(p4, 178);
  doc.text(p4Lines, 16, bodyY);
  bodyY += p4Lines.length * 5.5 + 2;

  doc.text("Welcome to YR NOVATECH.", 16, bodyY);

  // --- 5. INTERNSHIP DETAILS BOX ---
  const boxY = bodyY + 10;
  doc.setFillColor(245, 247, 250);
  doc.rect(16, boxY, 178, 34, "F");
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.3);
  doc.rect(16, boxY, 178, 34, "D");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("• Internship ID:", 22, boxY + 7);
  doc.text("• Domain:", 22, boxY + 13);
  doc.text("• Start Date:", 22, boxY + 19);
  doc.text("• End Date:", 22, boxY + 25);
  doc.text("• Duration:", 22, boxY + 31);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(data.internshipCode, 60, boxY + 7);
  doc.text(`${data.domain} – Remote Based Internship (${data.duration || '1 Month'})`, 60, boxY + 13);
  doc.text(today, 60, boxY + 19);
  doc.text(endDateText, 60, boxY + 25);
  doc.text(data.duration || "1 Month", 60, boxY + 31);

  // --- 6. SIGNATURE & SEAL SECTION ---
  const footerY = boxY + 45;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("For YR NOVATECH,", 16, footerY);

  // Founder Signature
  if (darkSignature) {
    try {
      const tempImg = await loadImage(darkSignature);
      const sigW = 12 * ((tempImg?.naturalWidth ?? 445) / (tempImg?.naturalHeight ?? 285));
      doc.addImage(darkSignature, "PNG", 16, footerY + 2, sigW, 12);
    } catch (err) {
      console.error("Failed to load signature on offer letter", err);
      doc.setFont("times", "italic");
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text("S. Fizal Mohamed", 16, footerY + 14);
    }
  } else {
    doc.setFont("times", "italic");
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("S. Fizal Mohamed", 16, footerY + 14);
  }

  // Perfectly straight horizontal line directly below signature
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.4);
  doc.line(16, footerY + 16, 75, footerY + 16);

  // Founder Name and Labels directly below line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("S. Fizal Mohamed", 16, footerY + 21);
  doc.setFont("helvetica", "normal");
  doc.text("Founder & CEO", 16, footerY + 25);
  doc.text("YR NOVATECH", 16, footerY + 29);

  // Company Seal placed horizontally next to signature section
  const sealY = footerY + 14;
  if (seal) {
    try {
      // 142 is x-position (aligned to the right side of the signature section)
      doc.addImage(seal, "PNG", 142, sealY - 18, 36, 36);
    } catch (err) {
      console.error("Failed to render seal image, falling back to vector", err);
      drawVectorSeal(doc, sealY);
    }
  } else {
    drawVectorSeal(doc, sealY);
  }

  return doc;
}

export async function uploadOfferLetterToStorage(data: {
  studentId: string;
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string;
  startedAt?: string | null;
  duration?: string | null;
}) {
  const doc = await generateOfferLetterPDF(data);
  const blob = doc.output("blob");
  const filePath = `${data.studentId}/offer-letter.pdf`;
  const { error } = await supabase.storage
    .from("offer-letters")
    .upload(filePath, blob, { contentType: "application/pdf", upsert: true });
  if (error) {
    console.error("Failed to upload offer letter to storage:", error);
    throw error;
  }
}

export async function ensureOfferLetterStored(data: {
  studentId: string;
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string;
  startedAt?: string | null;
  duration?: string | null;
}) {
  const filePath = `${data.studentId}/offer-letter.pdf`;
  const { data: existing, error: listError } = await supabase.storage
    .from("offer-letters")
    .list(data.studentId, { limit: 1, search: "offer-letter.pdf" });
  const stored = !listError && Array.isArray(existing) ? existing.find((f) => f.name === "offer-letter.pdf") : undefined;
  // Regenerate if missing or if the stored file is empty/corrupt (e.g. a
  // stale upload), so the Download/View buttons always have a real PDF.
  if (stored && (stored.metadata?.size ?? 0) >= 500) return;
  await uploadOfferLetterToStorage(data);
}

export async function downloadOfferLetter(data: {
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string;
  startedAt?: string | null;
  duration?: string | null;
}) {
  const doc = await generateOfferLetterPDF(data);
  doc.save(`${COMPANY.name}-OfferLetter-${data.internshipCode}.pdf`);
}

export async function downloadOfferLetterFromStorage(studentId: string, internshipCode: string) {
  const { data, error } = await supabase.storage
    .from("offer-letters")
    .download(`${studentId}/offer-letter.pdf`);
  if (error || !data) {
    throw new Error(error?.message || "Failed to download offer letter from storage");
  }
  if (data.size < 500) {
    throw new Error("Stored offer letter is empty or corrupt");
  }
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `YR-NOVATECH-OfferLetter-${internshipCode}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Always-successful downloader: tries the stored PDF first, and if it is
// missing (e.g. legacy users registered before the offer-letter migration, or a
// transient storage error) falls back to generating the PDF in-browser. This
// guarantees the intern can download their offer letter unlimited times no
// matter what state storage is in.
export async function downloadOfferLetterAnywhere(data: {
  studentId: string;
  fullName: string;
  domain: string;
  domainSlug?: string | null;
  internshipCode: string;
  offerCode: string | null | undefined;
  startedAt?: string | null;
  duration?: string | null;
}) {
  const payload = { ...data, offerCode: data.offerCode ?? `YRN-OL-${data.internshipCode}` };
  try {
    await downloadOfferLetterFromStorage(data.studentId, data.internshipCode);
  } catch (err) {
    console.warn("[pdf] stored offer letter missing, generating in browser:", err);
    await downloadOfferLetter(payload);
  }
}

export async function viewOfferLetterFromStorage(studentId: string) {
  const { data, error } = await supabase.storage
    .from("offer-letters")
    .createSignedUrl(`${studentId}/offer-letter.pdf`, 300);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Failed to generate preview URL");
  }
  window.open(data.signedUrl, "_blank");
}

export async function downloadCertificate(data: {
  fullName: string;
  domain: string;
  internshipCode: string;
  certificateCode: string;
  issuedAt?: string | null;
  duration?: string | null;
}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  // Preload logo, seal, signature, and MSME logo images
  const [logo, seal, signature, msmeLogo] = await Promise.all([
    loadImage(logoUrl),
    loadImage(sealUrl),
    loadImage(signatureUrl),
    loadImage(msmeLogoUrl)
  ]);

  // Preprocess signature to make it darker/bolder
  const darkSignature = signature ? darkenSignature(signature) : null;

  // border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.rect(8, 8, 281, 194);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186);

  if (logo) {
    try {
      doc.addImage(logo, "PNG", 138.5, 14, 20, 20);
    } catch {}
  }

  // MSME Logo — top right near company branding
  if (msmeLogo) {
    try {
      const msmeW = 14;
      const msmeH = msmeW * (msmeLogo.naturalHeight / msmeLogo.naturalWidth);
      doc.addImage(msmeLogo, "PNG", 255, 14, msmeW, msmeH);
    } catch (err) {
      console.error("Failed to render MSME logo header on certificate", err);
    }
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text(`Udyam Registration No:`, 269, 18, { align: "center" });
  doc.text(`${COMPANY.udyam}`, 269, 22, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235);
  doc.text(COMPANY.name, 148.5, 40, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(COMPANY.tagline, 148.5, 47, { align: "center" });

  doc.setFontSize(32);
  doc.setFont("times", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Certificate of Completion", 148.5, 66, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("This is to certify that", 148.5, 82, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor(37, 99, 235);
  doc.text(data.fullName, 148.5, 99, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const text = `has successfully completed the project-based internship program at ${COMPANY.name}.`;
  doc.text(text, 148.5, 112, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`Domain: ${data.domain}  |  Duration: ${data.duration || "1 Month"}`, 148.5, 120, { align: "center" });
  doc.text(`Mode: Remote  |  Internship ID: ${data.internshipCode}`, 148.5, 126, { align: "center" });

  doc.setFontSize(10);
  const issued = data.issuedAt ? new Date(data.issuedAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  doc.text(`Issued: ${issued}`, 148.5, 134, { align: "center" });

  // QR
  try {
    const qr = await QRCode.toDataURL(`Certificate: ${data.certificateCode} | Intern: ${data.internshipCode} | ${COMPANY.name}`, { margin: 0, width: 180 });
    doc.addImage(qr, "PNG", 240, 150, 32, 32);
  } catch {}

  // signature — must sit completely above the horizontal line
  const lineY = 172;
  const sigH = 28;
  const sigY = lineY - sigH - 4;
  if (darkSignature) {
    try {
      const tempImg = await loadImage(darkSignature);
      const sigW = sigH * ((tempImg?.naturalWidth ?? 445) / (tempImg?.naturalHeight ?? 285));
      doc.addImage(darkSignature, "PNG", 40, sigY, sigW, sigH);
    } catch (err) {
      console.error("Failed to load signature on certificate", err);
      doc.setFont("times", "italic");
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text(COMPANY.founder, 60, sigY + sigH * 0.6);
    }
  } else {
    doc.setFont("times", "italic");
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 255);
    doc.text(COMPANY.founder, 60, sigY + sigH * 0.6);
  }
  doc.setDrawColor(80);
  doc.setLineWidth(0.5);
  doc.line(40, lineY, 110, lineY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(COMPANY.founder, 75, lineY + 7, { align: "center" });
  doc.setFontSize(9);
  doc.text(COMPANY.founderTitle, 75, lineY + 13, { align: "center" });

  // seal
  if (seal) {
    try {
      doc.addImage(seal, "PNG", 155, 150, 30, 30);
    } catch {
      drawVectorCertificateSeal(doc, 170, 165);
    }
  } else {
    drawVectorCertificateSeal(doc, 170, 165);
  }

  // bottom row
  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.text(`Certificate ID: ${data.certificateCode}`, 20, 195);
  doc.text(`Internship ID: ${data.internshipCode}`, 148.5, 195, { align: "center" });

  doc.save(`${COMPANY.name}-Certificate-${data.certificateCode}.pdf`);
}

export async function downloadIdCard(data: {
  fullName: string;
  internshipCode: string;
  domain: string;
  photoDataUrl?: string | null;
  email?: string | null;
  duration?: string | null;
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [85, 135] });

  const [logo, seal] = await Promise.all([
    loadImage(logoUrl),
    loadImage(sealUrl)
  ]);

  // ── HEADER BAND ──
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 85, 28, "F");

  if (logo) {
    try {
      doc.addImage(logo, "PNG", 5, 4, 16, 16);
    } catch {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(COMPANY.name, 25, 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text(COMPANY.tagline, 25, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INTERN ID CARD", 25, 20);
  doc.setFontSize(4);
  doc.setFont("helvetica", "normal");
  doc.text(`Udyam: ${COMPANY.udyam}`, 25, 25);

  // ── STUDENT PHOTO ──
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(27.5, 34, 30, 36, 2, 2, "FD");
  if (data.photoDataUrl) {
    try { doc.addImage(data.photoDataUrl, "JPEG", 27.5, 34, 30, 36); } catch {}
  } else {
    doc.setFontSize(6);
    doc.setTextColor(140);
    doc.text("PHOTO", 42.5, 54, { align: "center" });
  }

  // ── STUDENT NAME ──
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.fullName, 42.5, 77, { align: "center", maxWidth: 75 });

  // ── DIVIDER ──
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.4);
  doc.line(10, 81, 75, 81);

  // ── INFO SECTION ──
  const issueDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const months = parseInt(data.duration ?? "1") || 1;
  const validUntil = new Date(Date.now() + months * 30 * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  let y = 87;
  const labelColor: [number, number, number] = [100, 110, 130];
  const valueColor: [number, number, number] = [15, 23, 42];

  const fieldRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(...labelColor);
    doc.text(label, 8, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...valueColor);
    const lines = doc.splitTextToSize(value, 58);
    doc.text(lines, 8, y + 4);
    y += 4 + lines.length * 3.2 + 2;
  };

  fieldRow("INTERNSHIP ID", data.internshipCode);
  fieldRow("DOMAIN", data.domain);
  fieldRow("DURATION", data.duration || "1 Month");
  fieldRow("ISSUE DATE", issueDate);
  fieldRow("VALID UNTIL", validUntil);
  if (data.email) fieldRow("EMAIL", data.email);

  // ── COMPANY SEAL ──
  if (seal) {
    try {
      doc.addImage(seal, "PNG", 62, 108, 16, 16);
    } catch {
      drawVectorIdCardSeal(doc, 70, 116);
    }
  } else {
    drawVectorIdCardSeal(doc, 70, 116);
  }

  // ── FOOTER BAND ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 131, 85, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(3);
  doc.setFont("helvetica", "normal");
  doc.text("This is a digitally issued ID card", 42.5, 134, { align: "center" });

  doc.save(`${COMPANY.name}-IDCard-${data.internshipCode}.pdf`);
}
