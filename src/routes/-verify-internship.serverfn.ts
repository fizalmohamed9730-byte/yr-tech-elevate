import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyInternship = createServerFn({ method: "POST" })
  .validator(z.object({ internshipCode: z.string() }))
  .handler(async ({ data }) => {
    const code = data.internshipCode.trim().toUpperCase();
    if (!code) {
      return { found: false as const, error: "Please enter an Internship ID." };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

      const [domainResult, profileResult] = await Promise.all([
        (async () => {
          if (!internship.domain_id) return { data: null, error: null };
          return supabaseAdmin.from("domains").select("name").eq("id", internship.domain_id).maybeSingle();
        })(),
        (async () => {
          if (!internship.student_id) return { data: null, error: null };
          return supabaseAdmin.from("profiles").select("full_name").eq("id", internship.student_id).maybeSingle();
        })(),
      ]);

      const domainName = domainResult?.data?.name ?? "N/A";
      const internName = profileResult?.data?.full_name ?? "N/A";
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
      };
    } catch (err: any) {
      console.error("[verifyInternship] Unexpected error:", err?.message ?? err, err?.stack);
      return { found: false as const, error: "Verification service is temporarily unavailable. Please try again." };
    }
  });
