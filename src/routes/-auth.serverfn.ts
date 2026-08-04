import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const confirmStudentEmail = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    let confirmed = false;
    let errorMessage: string | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        email_confirm: true,
      });
      if (error) {
        errorMessage = error.message;
        console.error("[confirmStudentEmail] Admin update failed:", error.message);
      } else {
        confirmed = true;
      }
    } catch (err: any) {
      // SERVICE_ROLE_KEY may not be configured — that's fine (autoconfirm trigger covers it).
      errorMessage = err?.message ?? "unknown";
      console.warn("[confirmStudentEmail] skipped:", errorMessage);
    }
    return { confirmed, error: errorMessage };
  });
