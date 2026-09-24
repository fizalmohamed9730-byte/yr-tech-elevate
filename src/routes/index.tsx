import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Code2,
  Smartphone,
  Brain,
  Palette,
  Settings,
  Briefcase,
  GraduationCap,
  Clock,
  Users,
  UserCheck,
  FileText,
  CheckCircle,
  Target,
  Eye,
  Rocket,
  ShieldCheck,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroTech from "@/assets/hero-tech.jpg";
import skyrovixLogo from "@/assets/skyrovix-logo.png";
import vinixLogo from "@/assets/vinix-logo.png";
import msmeLogo from "@/assets/msme-logo.png";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "YR NOVATECH - Innovate. Develop. Deliver." },
        {
          name: "description",
          content:
            "Premium software development and project-based internships in Full Stack, UI/UX, AI, Python, and C++.",
        },
        { property: "og:title", content: "YR NOVATECH - Innovate. Develop. Deliver." },
        {
          property: "og:description",
          content:
            "YR NOVATECH - premium software development, AI, web, mobile, and UI/UX services plus project-based internships.",
        },
      ],
    }),
    component: Index,
  },
);

/* ─── Service cards data ─── */
const services = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Modern, scalable, and responsive web applications.",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    desc: "Android & iOS applications with great UX.",
  },
  {
    icon: Brain,
    title: "AI & Data Analytics",
    desc: "Data-driven insights for smarter decisions.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Beautiful and user-friendly digital experiences.",
  },
  {
    icon: Settings,
    title: "Custom Software",
    desc: "Tailored solutions for your business needs.",
  },
];

/* ─── Why Choose Us cards ─── */
const whyUsCards = [
  {
    icon: Target,
    title: "Mission",
    desc: "Empower businesses and aspiring engineers through high-quality software and immersive training.",
  },
  {
    icon: Eye,
    title: "Vision",
    desc: "Become India's most trusted partner for software craftsmanship and ed-tech excellence.",
  },
  {
    icon: Rocket,
    title: "Future Goals",
    desc: "Train 10,000+ engineers and launch our own SaaS products by 2027.",
  },
];

function Index() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    completed: number;
  } | null>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Single batch fetch for both stats and testimonials
    (async () => {
      try {
        // Stats: Fetch counts from internships table
        const [
          { count: total },
          { count: active },
          { count: pending },
          { count: completed },
        ] = await Promise.all([
          supabase.from("internships").select("id", { count: "exact", head: true }),
          supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "completed"),
        ]);
        setStats({
          total: total ?? 0,
          active: active ?? 0,
          pending: pending ?? 0,
          completed: completed ?? 0,
        });
      } catch {
        // Silently ignore — stats are non-critical for page render
      }

      try {
        const { data, error } = await (supabase as any)
          .from("feedback")
          .select("id, rating, message, created_at, user_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(12);
        if (error || !data || data.length === 0) return;

        const userIds = [...new Set(data.map((f: any) => f.user_id).filter(Boolean))] as string[];
        let profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          if (profiles) {
            for (const p of profiles) profileMap[p.id] = p;
          }
        }

        setTestimonials(
          data.map((f: any) => ({
            ...f,
            student_name: profileMap[f.user_id]?.full_name ?? null,
          })),
        );
      } catch {
        // Silently ignore — testimonials are non-critical
      }
    })();
  }, []);

  return (
    <div className="bg-white">
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 -z-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(37,99,235) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-[120px] -z-0" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left content */}
            <div className="order-2 md:order-1">
              <p className="text-blue-600 font-semibold text-xs md:text-sm tracking-[0.15em] uppercase mb-4">
                BUILDING A SMARTER TOMORROW
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] mb-6">
                Innovate.{" "}
                <span className="text-blue-600">Develop.</span>
                <br />
                Deliver.
              </h1>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                YR NOVATECH is a premium software company. We design, engineer and ship world-class digital products and train the next generation of engineers through project-based internships.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all"
                >
                  <Link to="/services">
                    Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Link to="/internship">Apply for Internship</Link>
                </Button>
              </div>
            </div>

            {/* Right illustration */}
            <div className="order-1 md:order-2 flex justify-center">
              <img
                src={heroTech}
                alt="Software development technology illustration"
                className="w-full max-w-lg md:max-w-xl object-contain drop-shadow-[0_20px_40px_rgba(37,99,235,0.12)]"
                width={600}
                height={450}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATISTICS STRIP ═══════════════════ */}
      <section className="border-y border-blue-100/60 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Briefcase, value: "5+", label: "Service Lines" },
              { icon: GraduationCap, value: "5", label: "Internship Domains" },
              { icon: Clock, value: "24h", label: "Response Time" },
              { icon: Users, value: "100%", label: "Hands-on Projects" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 md:gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ OUR SERVICES ═══════════════════ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Our Services</h2>
            <p className="text-slate-400 text-sm mt-1">Tailored solutions for your digital growth.</p>
          </div>
          <Link
            to="/services"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-blue-100/60 bg-white p-5 hover:shadow-[0_8px_30px_rgba(37,99,235,0.1)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <s.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.desc}</p>
              <Link
                to="/services"
                className="w-8 h-8 rounded-full border border-blue-200 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ OUR IMPACT — STATS ═══════════════════ */}
      <section className="bg-blue-50/50">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            {/* Left heading */}
            <div className="md:max-w-xs shrink-0">
              <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-blue-200 text-blue-600 mb-4">
                Our Impact
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                Growing Together
                <br />
                Building Better Futures
              </h2>
              <p className="text-slate-400 text-sm mt-3">
                A quick look at the numbers that define our journey.
              </p>
            </div>

            {/* Right stat cards */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, value: stats?.total ?? "—", label: "Total Interns", color: "text-blue-600 bg-blue-100" },
                { icon: UserCheck, value: stats?.active ?? "—", label: "Active Interns", color: "text-blue-600 bg-blue-100" },
                { icon: FileText, value: stats?.pending ?? "—", label: "Pending Applications", color: "text-blue-600 bg-blue-100" },
                { icon: CheckCircle, value: stats?.completed ?? "—", label: "Completed", color: "text-blue-600 bg-blue-100" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-blue-100/60 p-5 text-center shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center mx-auto mb-3`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ IMPACT CTA PANEL ═══════════════════ */}
      <section className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-blue-100/60 bg-blue-50/30 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-blue-200 text-blue-600 mb-3">
              Our Impact
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              Growing Together
              <br />
              Building Better Futures
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              A quick look at the numbers that define our journey.
            </p>
          </div>
          <Link
            to="/about"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED COLLABORATIONS ═══════════════════ */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Trusted Collaborations</h2>
            <p className="text-slate-400 text-sm mt-1">
              We work with trusted partners to deliver the best technology solutions.
            </p>
          </div>
          <Link
            to="/about"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8">
          <a
            href="https://www.skyrovix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={skyrovixLogo}
              alt="Skyrovix"
              className="h-10 md:h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <div className="w-px h-14 bg-slate-200 hidden md:block" />
          <a
            href="https://www.vinix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={vinixLogo}
              alt="Vinix Partner"
              className="h-10 md:h-14 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </section>

      {/* ═══════════════════ WHY CHOOSE US ═══════════════════ */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left heading */}
          <div className="md:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
              Why Choose Us?
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              We focus on quality, innovation and long-term growth for every learner and client.
            </p>
            <Button
              asChild
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
            >
              <Link to="/about">
                Explore More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Right cards grid */}
          <div className="md:col-span-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyUsCards.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border border-blue-100/60 bg-white p-5 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <w.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-2">{w.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}

            {/* MSME Certified Card */}
            <div className="rounded-2xl border border-blue-100/60 bg-white p-5 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <img src={msmeLogo} alt="MSME" className="h-6 w-6 object-contain" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-2">MsME Certified</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registered under the Ministry of Micro, Small & Medium Enterprises, Government of India.
              </p>
              <p className="text-[10px] font-mono text-blue-600 mt-2 font-semibold">
                {COMPANY.udyam}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      {testimonials.length > 0 && (
        <section className="bg-blue-50/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-blue-200 text-blue-600 mb-4">
                Testimonials
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Student Experiences</h2>
              <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                Real experiences from students and interns who learned, built, and grew with YR NOVATECH.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-blue-100/60 bg-white p-6 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all flex flex-col"
                >
                  <Quote className="h-7 w-7 text-blue-200 mb-3" />
                  <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">{t.message}</p>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[0, 1, 2, 3, 4].map((si) => (
                      <Star
                        key={si}
                        className={`h-3.5 w-3.5 ${si < t.rating ? "fill-blue-500 text-blue-500" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-blue-100/60">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {t.student_name ? t.student_name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{t.student_name ?? "Student"}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 p-10 md:p-16 text-center">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to build something great?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-8">
              Whether you're hiring a team or starting your career — we'd love to talk.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-6 shadow-lg"
              >
                <Link to="/contact">Get in touch</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 rounded-full px-6"
              >
                <Link to="/apply">Apply for Internship</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
