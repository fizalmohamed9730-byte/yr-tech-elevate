import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, User, Building } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { COMPANY } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${COMPANY.name} — Get in Touch` },
      { name: "description", content: `Contact ${COMPANY.name}. Reach out for internship inquiries, partnerships, or collaborations.` },
      { property: "og:title", content: `Contact ${COMPANY.name}` },
      { property: "og:description", content: `Get in touch with ${COMPANY.name} for internships and collaborations.` },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message too short").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        status: "new",
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Message sent! We'll get back within 24 hours.");
        setForm({ name: "", email: "", message: "" });
      }
    } catch (err: any) {
      toast.error("Unable to send your message. Please try again.");
      console.error("[contact] submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <SectionHeading eyebrow="Contact" title="Get in Touch" description={`Reach out to ${COMPANY.name} for internship inquiries, partnerships, or collaboration opportunities.`} />
      <div className="grid gap-8 md:grid-cols-5 max-w-5xl mx-auto">
        <Card className="p-6 md:col-span-3 border border-border">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" maxLength={255} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" maxLength={1000} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-elegant">
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5 flex items-start gap-3 border border-border">
            <Building className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Company</div>
              <div className="text-sm text-muted-foreground">{COMPANY.name}</div>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3 border border-border">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Founder & CEO</div>
              <div className="text-sm text-muted-foreground">{COMPANY.founder}</div>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3 border border-border">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Email</div>
              <a href={`mailto:${COMPANY.email}`} className="text-sm text-muted-foreground hover:text-foreground">{COMPANY.email}</a>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
