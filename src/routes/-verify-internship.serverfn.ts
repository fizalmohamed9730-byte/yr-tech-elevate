import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyInternship = createServerFn({ method: "GET" })
  .validator(z.object({ internshipCode: z.string() }))
  .handler(async ({ data }) => {
    const code = data.internshipCode.trim().toUpperCase();
    if (!code) {
      return { found: false as const, error: "Please enter an Internship ID." };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: internship, error } = await supabaseAdmin
        .from("internships")
        .select(`
          id,
          internship_code,
          status,
          duration,
          started_at,
          completed_at,
          certificate_code,
          certificate_released_at,
          student_id,
          domain_id,
          domains!internships_domain_id_fkey ( name )
        `)
        .eq("internship_code", code)
        .maybeSingle();

      if (error) {
        console.error("[verifyInternship] Query error:", error.message);
        return { found: false as const, error: "Unable to verify Internship ID. Please try again." };
      }

      if (!internship) {
        return { found: false as const, error: "Internship ID not found." };
      }

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", internship.student_id)
        .maybeSingle();

      const domainName = (internship.domains as any)?.name ?? "N/A";
      const internName = profile?.full_name ?? "N/A";
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
      console.error("[verifyInternship] Unexpected error:", err?.message ?? err);
      return { found: false as const, error: "Unable to verify Internship ID. Please try again." };
    }
  });
