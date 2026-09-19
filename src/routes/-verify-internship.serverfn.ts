import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyInternship = createServerFn({ method: "POST" })
  .validator(z.object({ internshipCode: z.string() }))
  .handler(async ({ data }) => {
    const code = data.internshipCode.trim().toUpperCase();
    if (!code) {
      return { found: false as const, error: "Please enter an Internship ID." };
    }

    try {
      const { data: internship, error: internErr } = await supabaseAdmin
        .from("internships")
        .select("id, internship_code, status, duration, started_at, completed_at, certificate_code, certificate_released_at, student_id, domain_id")
        .eq("internship_code", code)
        .maybeSingle();

      if (internErr) {
        console.error("[verifyInternship] internships query error:", internErr.message, internErr.code, internErr.details);
        return { found: false as const, error: "Verification service is temporarily unavailable. Please try again." };
      }

      if (!internship) {
        return { found: false as const, error: "Internship ID not found." };
      }

      let certificateStatus = "none";
      if (internship.certificate_code && internship.certificate_released_at) {
        certificateStatus = "issued";
      }
      try {
        const { data: extData, error: extErr } = await (supabaseAdmin as any)
          .from("internships")
          .select("certificate_status, certificate_revoked_at, certificate_revoke_reason")
          .eq("id", internship.id)
          .maybeSingle();
        if (!extErr && extData?.certificate_status) {
          certificateStatus = extData.certificate_status;
        }
      } catch {
        // certificate_status column may not exist in production schema yet; default derived above is safe
      }

      let domainName = "N/A";
      if (internship.domain_id) {
        const { data: domain } = await supabaseAdmin
          .from("domains")
          .select("name")
          .eq("id", internship.domain_id)
          .maybeSingle();
        domainName = domain?.name ?? "N/A";
      }

      let internName = "N/A";
      if (internship.student_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("id", internship.student_id)
          .maybeSingle();
        internName = profile?.full_name ?? "N/A";
      }

      const certificateIssued = !!(internship.certificate_code && internship.certificate_released_at);

      return {
        found: true as const,
        internName,
        internshipCode: internship.internship_code,
        domain: domainName,
        duration: internship.duration ?? "N/A",
        status: internship.status,
        startedAt: internship.started_at,
        completedAt: internship.completed_at,
        certificateIssued,
        certificateCode: certificateIssued ? internship.certificate_code : null,
        certificateStatus,
      };
    } catch (err: any) {
      console.error("[verifyInternship] Unexpected error:", err?.message ?? err, err?.stack);
      return { found: false as const, error: "Verification service is temporarily unavailable. Please try again." };
    }
  });
