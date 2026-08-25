import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  college: z.string().trim().max(150).optional().or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  year: z.string().trim().max(40).optional().or(z.literal("")),
  github_url: z.string().trim().url().max(300).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().max(300).optional().or(z.literal("")),
});

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("profiles").select("id, full_name, email, phone, college, department, year, avatar_url, github_url, linkedin_url, must_change_password").eq("id", u.user.id).single();
    setProfile(data);
    setPhoto(data?.avatar_url ?? null);
  }
  useEffect(() => { load(); }, []);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 600 * 1024) return toast.error("Photo must be under 600KB");
    const r = new FileReader();
    r.onload = () => setPhoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    const payload: any = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]));
    payload.avatar_url = photo;
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    load();
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("new_password") ?? "");
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (!error) await supabase.from("profiles").update({ must_change_password: false }).eq("id", profile.id);
    setPwBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    (e.target as HTMLFormElement).reset();
    load();
  }

  if (!profile) return <div className="container mx-auto py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {profile.must_change_password && (
        <Card className="p-4 border-orange-400/60 bg-orange-50 dark:bg-orange-950/30 text-sm">
          You're still using your default password (phone number). Please set a new password below.
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4">
            {photo ? <img src={photo} alt="me" className="h-20 w-20 rounded object-cover border" /> : <div className="h-20 w-20 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No photo</div>}
            <div>
              <Label>Student photo</Label>
              <Input type="file" accept="image/*" onChange={onPhoto} />
            </div>
          </div>
          <div><Label>Email</Label><Input value={profile.email ?? ""} disabled /></div>
          <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={profile.phone ?? ""} /></div>
            <div><Label htmlFor="year">Year</Label><Input id="year" name="year" defaultValue={profile.year ?? ""} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="college">College</Label><Input id="college" name="college" defaultValue={profile.college ?? ""} /></div>
            <div><Label htmlFor="department">Department</Label><Input id="department" name="department" defaultValue={profile.department ?? ""} /></div>
          </div>
          <div><Label htmlFor="github_url">GitHub</Label><Input id="github_url" name="github_url" type="url" defaultValue={profile.github_url ?? ""} placeholder="https://github.com/username" /></div>
          <div><Label htmlFor="linkedin_url">LinkedIn</Label><Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={profile.linkedin_url ?? ""} /></div>
          <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-3">Change password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <div><Label htmlFor="new_password">New password</Label><Input id="new_password" name="new_password" type="password" minLength={6} required /></div>
          <Button type="submit" disabled={pwBusy} variant="outline">{pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}</Button>
        </form>
      </Card>
    </div>
  );
}
