const URL = "https://uhjowcyhbmvradwycpig.supabase.co";
const KEY = "sb_publishable_BAt73iC1gvBblYZenWRs0g_fa5C6_Uo";
import { createClient } from "@supabase/supabase-js";
(async () => {
  const name = "verify3" + Date.now();
  const email = name + "@test.local";
  const pw = "password123";
  const d = await createClient(URL, KEY).from("domains").select("id,name").eq("active", true).limit(1);
  const domId = d.data?.[0]?.id;
  console.log("domain:", domId, d.error?.message);
  const sb = createClient(URL, KEY);
  let su = await sb.auth.signUp({
    email,
    password: pw,
    options: {
      data: {
        full_name: "Verify Three",
        phone: "9876543210",
        college: "Test College",
        department: "CS",
        year: "3rd Year",
        avatar_url: null,
        domain_id: domId,
        duration: "1 Month",
        must_change_password: false,
      },
      emailRedirectTo: "http://localhost:5173/dashboard",
    },
  });
  console.log("signup3:", su.data.user?.id, "err:", su.error?.message, "session?", !!su.data.session);
  const si = await sb.auth.signInWithPassword({ email, password: pw });
  const uid = si.data.user?.id;
  console.log("login3:", uid, "err:", si.error?.message);
  const tok = si.data.session?.access_token;
  const r = await fetch(URL + "/rest/v1/user_roles?select=role&user_id=eq." + uid, {
    headers: { apikey: KEY, Authorization: "Bearer " + tok },
  });
  console.log("roles status:", r.status, await r.text());
  const r2 = await fetch(URL + "/rest/v1/user_roles?user_id=eq." + uid, {
    headers: { apikey: KEY, Authorization: "Bearer " + KEY },
  });
  console.log("anon roles status:", r2.status, await r2.text());
  const int = await fetch(
    URL + "/rest/v1/internships?student_id=eq." + uid + "&select=id,internship_code,offer_letter_code,status,duration,domain:domains(name,slug)",
    { headers: { apikey: KEY, Authorization: "Bearer " + tok } }
  );
  console.log("internship status:", int.status, await int.text());
})().catch((e) => {
  console.error("FATAL", e.message);
  process.exit(1);
});
