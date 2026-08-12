const URL = "https://uhjowcyhbmvradwycpig.supabase.co";
const KEY = "sb_publishable_BAt73iC1gvBblYZenWRs0g_fa5C6_Uo";
import { createClient } from "@supabase/supabase-js";
(async () => {
  const sb = createClient(URL, KEY, { auth: { persistSession: false } });
  // Existing e2e intern test account
  const si = await sb.auth.signInWithPassword({ email: "e2e1786269054744@test.local", password: "password123" });
  const uid = si.data.user?.id;
  console.log("existing intern login:", uid, "err:", si.error?.message);
  if (uid) {
    const tok = si.data.session?.access_token;
    const r = await fetch(URL + "/rest/v1/user_roles?select=*&user_id=eq." + uid, {
      headers: { apikey: KEY, Authorization: "Bearer " + tok },
    });
    console.log("existing intern roles:", r.status, await r.text());
    // profile + internship
    const p = await fetch(URL + "/rest/v1/profiles?select=id,full_name,role,internship_id&id=eq." + uid, {
      headers: { apikey: KEY, Authorization: "Bearer " + tok },
    });
    console.log("existing intern profile:", p.status, await p.text());
    const int = await fetch(URL + "/rest/v1/internships?select=id,status,offer_letter_code,internship_code&student_id=eq." + uid, {
      headers: { apikey: KEY, Authorization: "Bearer " + tok },
    });
    console.log("existing intern internship:", int.status, await int.text());
  }
  // Check has_role RPC signature by trying to call it
  const hr = await fetch(URL + "/rest/v1/rpc/has_role", {
    method: "POST",
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ _user_id: "00000000-0000-0000-0000-000000000000", _role: "admin" }),
  });
  console.log("has_role RPC (anon) status:", hr.status, await hr.text());
})().catch((e) => {
  console.error("FATAL", e.message);
  process.exit(1);
});
