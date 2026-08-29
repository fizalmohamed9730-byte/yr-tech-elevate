import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const sendOfferLetterEmail = createServerFn({ method: "POST" })
  .validator(
    z.object({
      internshipId: z.string().uuid(),
      email: z.string().email(),
      fullName: z.string().min(1),
      domain: z.string().min(1),
      duration: z.string().min(1),
      internshipCode: z.string().min(1),
      offerCode: z.string().min(1),
      startedAt: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data }) => {
    const maskedEmail = data.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    console.log(`[email] === sendOfferLetterEmail invoked ===`);
    console.log(`[email] internshipId: ${data.internshipId}`);
    console.log(`[email] recipient: ${maskedEmail}`);
    console.log(`[email] intern: ${data.fullName}`);
    console.log(`[email] internshipCode: ${data.internshipCode}`);

    // 1. Check config
    const { getEmailConfig } = await import("@/lib/config.server");
    const config = getEmailConfig();
    console.log(`[email] RESEND_API_KEY present: ${!!config.resendApiKey}`);
    console.log(`[email] EMAIL_FROM: ${config.emailFrom}`);

    if (!config.resendApiKey) {
      const errMsg = "RESEND_API_KEY environment variable is not configured. Set it in Vercel Dashboard > Settings > Environment Variables.";
      console.error(`[email] FATAL: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    // 2. Generate PDF
    console.log(`[email] Generating offer letter PDF...`);
    let pdfBuffer: Buffer;
    try {
      const { generateOfferLetterPDFBuffer } = await import("@/lib/pdf.server");
      pdfBuffer = await generateOfferLetterPDFBuffer({
        fullName: data.fullName,
        domain: data.domain,
        internshipCode: data.internshipCode,
        offerCode: data.offerCode,
        startedAt: data.startedAt,
        duration: data.duration,
      });
      console.log(`[email] PDF generated: ${pdfBuffer.length} bytes`);
      if (pdfBuffer.length < 500) {
        console.warn(`[email] WARNING: PDF seems too small (${pdfBuffer.length} bytes) — images may not have loaded`);
      }
    } catch (pdfErr: any) {
      const errMsg = `PDF generation failed: ${pdfErr?.message ?? "Unknown error"}`;
      console.error(`[email] ${errMsg}`);
      // Record failure
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await (supabaseAdmin as any)
          .from("internships")
          .update({
            offer_letter_email_sent: false,
            offer_letter_email_error: errMsg.slice(0, 500),
          })
          .eq("id", data.internshipId);
      } catch {}
      return { success: false, error: errMsg };
    }

    // 3. Send via Resend
    console.log(`[email] Calling Resend API...`);
    let resendResult: any;
    let resendError: any;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(config.resendApiKey);

      const response = await resend.emails.send({
        from: config.emailFrom,
        to: [data.email],
        replyTo: config.emailReplyTo,
        subject: "YR NOVATECH - Internship Offer Letter",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;background-color:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:24px;color:#2563eb;">YR NOVATECH</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">INNOVATE • DEVELOP • DELIVER</p>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
      <p style="font-size:16px;margin:0 0 16px;">Dear ${data.fullName},</p>
      <p style="font-size:16px;margin:0 0 16px;"><strong>Congratulations!</strong></p>
      <p style="font-size:15px;margin:0 0 20px;color:#374151;">Please find your official YR NOVATECH Internship Offer Letter attached to this email.</p>
      <div style="background:#f5f7fa;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Internship ID:</strong> ${data.internshipCode}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Domain:</strong> ${data.domain}</p>
        <p style="margin:0;font-size:14px;"><strong>Duration:</strong> ${data.duration}</p>
      </div>
      <p style="font-size:14px;color:#6b7280;margin:20px 0 0;">Please keep this document for your records.</p>
    </div>
    <div style="text-align:center;padding:24px 0 0;border-top:1px solid #e5e7eb;margin-top:24px;">
      <p style="font-size:14px;margin:0 0 4px;"><strong>Regards,</strong></p>
      <p style="font-size:14px;margin:0 0 2px;"><strong>S. FIZAL MOHAMED</strong></p>
      <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Founder &amp; CEO, YR NOVATECH</p>
      <p style="font-size:12px;color:#9ca3af;margin:0;">Website: <a href="https://www.yrnovatech.online" style="color:#2563eb;">www.yrnovatech.online</a> &nbsp;|&nbsp; Instagram: <a href="https://www.instagram.com/yrnovatech_official/" style="color:#2563eb;">@yrnovatech_official</a></p>
    </div>
  </div>
</body>
</html>`,
        attachments: [
          {
            filename: `offer-letter-${data.internshipCode}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      resendResult = response.data;
      resendError = response.error;
    } catch (sendErr: any) {
      resendError = sendErr;
      console.error(`[email] Resend API call threw:`, sendErr);
    }

    // 4. Handle result
    if (resendError) {
      const errMsg = `Resend error: ${resendError.message ?? JSON.stringify(resendError)}`;
      console.error(`[email] ${errMsg}`);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await (supabaseAdmin as any)
          .from("internships")
          .update({
            offer_letter_email_sent: false,
            offer_letter_email_error: errMsg.slice(0, 500),
          })
          .eq("id", data.internshipId);
        console.log(`[email] Failure recorded in DB for internship ${data.internshipId}`);
      } catch (dbErr) {
        console.error(`[email] Failed to record error in DB:`, dbErr);
      }
      return { success: false, error: errMsg };
    }

    // 5. Success
    const messageId = resendResult?.id ?? null;
    console.log(`[email] Resend accepted email. Message ID: ${messageId}`);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any)
        .from("internships")
        .update({
          offer_letter_email_sent: true,
          offer_letter_email_sent_at: new Date().toISOString(),
          offer_letter_email_error: null,
          offer_letter_resend_message_id: messageId,
        })
        .eq("id", data.internshipId);
      console.log(`[email] Success recorded in DB for internship ${data.internshipId}`);
    } catch (dbErr) {
      console.error(`[email] Failed to record success in DB:`, dbErr);
    }

    console.log(`[email] === sendOfferLetterEmail complete ===`);
    return { success: true, messageId };
  });

export const sendCertificateEmail = createServerFn({ method: "POST" })
  .validator(
    z.object({
      internshipId: z.string().uuid(),
      email: z.string().email(),
      fullName: z.string().min(1),
      domain: z.string().min(1),
      duration: z.string().min(1),
      internshipCode: z.string().min(1),
      certificateCode: z.string().min(1),
      issuedAt: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data }) => {
    const maskedEmail = data.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    console.log(`[email] === sendCertificateEmail invoked ===`);
    console.log(`[email] internshipId: ${data.internshipId}`);
    console.log(`[email] recipient: ${maskedEmail}`);
    console.log(`[email] intern: ${data.fullName}`);
    console.log(`[email] internshipCode: ${data.internshipCode}`);

    // 1. Check config
    const { getEmailConfig } = await import("@/lib/config.server");
    const config = getEmailConfig();
    console.log(`[email] RESEND_API_KEY present: ${!!config.resendApiKey}`);
    console.log(`[email] EMAIL_FROM: ${config.emailFrom}`);

    if (!config.resendApiKey) {
      const errMsg = "RESEND_API_KEY environment variable is not configured. Set it in Vercel Dashboard > Settings > Environment Variables.";
      console.error(`[email] FATAL: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    // 2. Generate PDF
    console.log(`[email] Generating certificate PDF...`);
    let pdfBuffer: Buffer;
    try {
      const { generateCertificatePDFBuffer } = await import("@/lib/pdf.server");
      pdfBuffer = await generateCertificatePDFBuffer({
        fullName: data.fullName,
        domain: data.domain,
        internshipCode: data.internshipCode,
        certificateCode: data.certificateCode,
        issuedAt: data.issuedAt,
        duration: data.duration,
      });
      console.log(`[email] PDF generated: ${pdfBuffer.length} bytes`);
      if (pdfBuffer.length < 500) {
        console.warn(`[email] WARNING: PDF seems too small (${pdfBuffer.length} bytes) — images may not have loaded`);
      }
    } catch (pdfErr: any) {
      const errMsg = `PDF generation failed: ${pdfErr?.message ?? "Unknown error"}`;
      console.error(`[email] ${errMsg}`);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await (supabaseAdmin as any)
          .from("internships")
          .update({
            certificate_email_sent: false,
            certificate_email_error: errMsg.slice(0, 500),
          })
          .eq("id", data.internshipId);
      } catch {}
      return { success: false, error: errMsg };
    }

    // 3. Send via Resend
    console.log(`[email] Calling Resend API...`);
    let resendResult: any;
    let resendError: any;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(config.resendApiKey);

      const response = await resend.emails.send({
        from: config.emailFrom,
        to: [data.email],
        replyTo: config.emailReplyTo,
        subject: "YR NOVATECH - Internship Completion Certificate",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;background-color:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:24px;color:#2563eb;">YR NOVATECH</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">INNOVATE • DEVELOP • DELIVER</p>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
      <p style="font-size:16px;margin:0 0 16px;">Dear ${data.fullName},</p>
      <p style="font-size:16px;margin:0 0 16px;"><strong>Congratulations on successfully completing your internship with YR NOVATECH.</strong></p>
      <p style="font-size:15px;margin:0 0 20px;color:#374151;">Your official Internship Completion Certificate is attached to this email.</p>
      <div style="background:#f5f7fa;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;"><strong>Internship ID:</strong> ${data.internshipCode}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Domain:</strong> ${data.domain}</p>
        <p style="margin:0;font-size:14px;"><strong>Duration:</strong> ${data.duration}</p>
      </div>
      <p style="font-size:15px;color:#374151;margin:20px 0 0;">Congratulations on your achievement.</p>
    </div>
    <div style="text-align:center;padding:24px 0 0;border-top:1px solid #e5e7eb;margin-top:24px;">
      <p style="font-size:14px;margin:0 0 4px;"><strong>Regards,</strong></p>
      <p style="font-size:14px;margin:0 0 2px;"><strong>S. FIZAL MOHAMED</strong></p>
      <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Founder &amp; CEO, YR NOVATECH</p>
      <p style="font-size:12px;color:#9ca3af;margin:0;">Website: <a href="https://www.yrnovatech.online" style="color:#2563eb;">www.yrnovatech.online</a> &nbsp;|&nbsp; Instagram: <a href="https://www.instagram.com/yrnovatech_official/" style="color:#2563eb;">@yrnovatech_official</a></p>
    </div>
  </div>
</body>
</html>`,
        attachments: [
          {
            filename: `certificate-${data.internshipCode}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      resendResult = response.data;
      resendError = response.error;
    } catch (sendErr: any) {
      resendError = sendErr;
      console.error(`[email] Resend API call threw:`, sendErr);
    }

    // 4. Handle result
    if (resendError) {
      const errMsg = `Resend error: ${resendError.message ?? JSON.stringify(resendError)}`;
      console.error(`[email] ${errMsg}`);
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await (supabaseAdmin as any)
          .from("internships")
          .update({
            certificate_email_sent: false,
            certificate_email_error: errMsg.slice(0, 500),
          })
          .eq("id", data.internshipId);
        console.log(`[email] Failure recorded in DB for internship ${data.internshipId}`);
      } catch (dbErr) {
        console.error(`[email] Failed to record error in DB:`, dbErr);
      }
      return { success: false, error: errMsg };
    }

    // 5. Success
    const messageId = resendResult?.id ?? null;
    console.log(`[email] Resend accepted email. Message ID: ${messageId}`);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any)
        .from("internships")
        .update({
          certificate_email_sent: true,
          certificate_email_sent_at: new Date().toISOString(),
          certificate_email_error: null,
          certificate_resend_message_id: messageId,
        })
        .eq("id", data.internshipId);
      console.log(`[email] Success recorded in DB for internship ${data.internshipId}`);
    } catch (dbErr) {
      console.error(`[email] Failed to record success in DB:`, dbErr);
    }

    console.log(`[email] === sendCertificateEmail complete ===`);
    return { success: true, messageId };
  });
