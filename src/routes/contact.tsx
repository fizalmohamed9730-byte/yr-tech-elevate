import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  MessageSquare,
  Building2,
  Globe,
  Instagram,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { COMPANY } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact ${COMPANY.name} - Get in Touch` },
      {
        name: "description",
        content: `Contact ${COMPANY.name}. Reach out for custom software, web & mobile builds, AI solutions, or internship inquiries.`,
      },
      { property: "og:title", content: `Contact ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Get in touch with ${COMPANY.name} for software engineering and internship programs.`,
      },
      { property: "og:url", content: "https://www.yrnovatech.in/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message too short (minimum 10 characters)").max(1000),
});

const inquiryTypes = [
  "Custom Software / Web App",
  "AI & ML Solution",
  "Internship Inquiry",
  "Corporate Partnership",
  "General Question",
];

function Contact() {
  const [selectedTopic, setSelectedTopic] = useState<string>("Custom Software / Web App");
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
      const fullMessage = `[Topic: ${selectedTopic}]\n\n${parsed.data.message}`;
      const { error } = await supabase.from("enquiries").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        message: fullMessage,
        status: "new",
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Message sent successfully. We will reply to this address as soon as we can.");
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      toast.error("Unable to send your message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="py-12 md:py-20">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Let's Build Something Exceptional"
        asH1
        description={`Reach out to ${COMPANY.name} for technical projects, software consulting, or internship guidance.`}
      />

      <div className="grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto">
        {/* Form Column */}
        <Card className="lg:col-span-7 p-6 sm:p-8 border border-border bg-card shadow-sm rounded-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Topic Select */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What are you inquiring about?
              </Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {inquiryTypes.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTopic === topic
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Your Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10 h-11 rounded-xl bg-background border-border"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Work or Personal Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10 h-11 rounded-xl bg-background border-border"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  maxLength={255}
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-medium">
                  Project or Inquiry Details
                </Label>
                <span className="text-xs text-muted-foreground">
                  {form.message.length}/1000
                </span>
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="message"
                  className="pl-10 pt-3 rounded-xl bg-background border-border min-h-[140px]"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your project requirements, scope, target timeline, or internship inquiry..."
                  maxLength={1000}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold shadow-elegant rounded-xl text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending message...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Replies are sent to the email address you provide</span>
            </div>
          </form>
        </Card>

        {/* Sidebar Information Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* MSME Badge Card */}
          <Card className="p-5 border border-border bg-accent/30 rounded-2xl">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Verified Enterprise</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {COMPANY.name} is a Government-registered Micro, Small &amp; Medium Enterprise (MSME: {COMPANY.udyam}).
                </p>
              </div>
            </div>
          </Card>

          {/* Company Details Cards */}
          <Card className="p-5 border border-border bg-card rounded-2xl flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Organization</div>
              <div className="font-semibold text-sm text-foreground">{COMPANY.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{COMPANY.tagline}</div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card rounded-2xl flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">{COMPANY.founderTitle}</div>
              <div className="font-semibold text-sm text-foreground">{COMPANY.founder}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Leadership &amp; Technical Strategy</div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card rounded-2xl flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Direct Email</div>
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-sm font-semibold text-primary hover:underline transition-colors block"
              >
                {COMPANY.email}
              </a>
              <div className="text-xs text-muted-foreground mt-0.5">Usually answered within a business day</div>
            </div>
          </Card>

          <Card className="p-5 border border-border bg-card rounded-2xl flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Social Channels</div>
              <a
                href={COMPANY.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
              >
                @yrnovatech_official
              </a>
              <div className="text-xs text-muted-foreground mt-0.5">Updates, announcements &amp; tech insights</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Self-service routes — most questions are answered before we need to reply */}
      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-foreground mb-2">Looking for something specific?</h2>
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
          These pages answer most of what people write to us about, and they are faster than
          waiting for a reply.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/services">Services &amp; what we build</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/internship">Internship program</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/faq">Frequently asked questions</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/projects">Projects &amp; case studies</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/careers">Careers &amp; hiring status</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/resources">Technology resources</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/about">About the company</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/refund-policy">Refund policy</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
