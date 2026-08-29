import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User, Mail, MessageSquare, Building, Globe, Instagram } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { COMPANY } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${COMPANY.name} - Get in Touch` },
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
    } catch {
      toast.error("Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact Us"
        description={`Reach out to ${COMPANY.name} for internship inquiries, partnerships, or collaboration opportunities.`}
      />
      <div className="grid gap-8 md:grid-cols-5 max-w-5xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="md:col-span-3 p-6 md:p-8 border border-border bg-card rounded-2xl space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-10"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                maxLength={100}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                maxLength={255}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="message"
                className="pl-10"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                maxLength={1000}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="md:col-span-2 space-y-4">
          <div className="p-5 border border-border bg-card rounded-xl flex items-start gap-3">
            <Building className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Company</div>
              <div className="text-sm text-muted-foreground">{COMPANY.name}</div>
            </div>
          </div>
          <div className="p-5 border border-border bg-card rounded-xl flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">{COMPANY.founderTitle}</div>
              <div className="text-sm text-muted-foreground">{COMPANY.founder}</div>
            </div>
          </div>
          <div className="p-5 border border-border bg-card rounded-xl flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Email</div>
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {COMPANY.email}
              </a>
            </div>
          </div>
          <div className="p-5 border border-border bg-card rounded-xl flex items-start gap-3">
            <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Website</div>
              <a
                href={`https://${COMPANY.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {COMPANY.website}
              </a>
            </div>
          </div>
          <div className="p-5 border border-border bg-card rounded-xl flex items-start gap-3">
            <Instagram className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Instagram</div>
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                @yrnovatech_official
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
