import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${COMPANY.name}` },
      {
        name: "description",
        content: `Privacy Policy for ${COMPANY.name}. Learn how we collect, use, store, and protect your personal information.`,
      },
      { property: "og:title", content: `Privacy Policy — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `How ${COMPANY.name} handles your data, cookies, and personal information.`,
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: September 2026`}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {COMPANY.name} ("we," "our," or "us") is committed to protecting the
            privacy of visitors to our website and users of our services. This
            Privacy Policy explains what personal information we collect, why we
            collect it, how we use and protect it, and your rights regarding your
            data. This policy applies to our website at{" "}
            <a href="https://yrnovatech.in" className="text-primary hover:underline">
              yrnovatech.in
            </a>{" "}
            and all services provided through it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">2.1 Information You Provide</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you register for an internship, submit a contact form, or create
            an account, we may collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Full name, email address, and phone number</li>
            <li>Educational details (college name, department, year of study)</li>
            <li>Country of residence</li>
            <li>Profile photograph (if uploaded during registration)</li>
            <li>Resume or CV (if uploaded)</li>
            <li>Internship domain and duration preferences</li>
            <li>Project submissions and task responses</li>
            <li>Feedback and messages submitted through contact forms</li>
          </ul>

          <h3 className="text-lg font-medium mb-2 mt-4">2.2 Automatically Collected Information</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            When you visit our website, we may automatically collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Browser type and version</li>
            <li>Device information (operating system, screen resolution)</li>
            <li>IP address and approximate geographic location</li>
            <li>Pages visited, time spent, and referring URLs</li>
            <li>Cookies and similar tracking technologies (see Section 5)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use collected information for the following purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Internship administration:</strong> Processing applications, assigning tasks, tracking progress, issuing offer letters and certificates.</li>
            <li><strong>Account management:</strong> Creating and maintaining your user account, authenticating logins, managing your profile.</li>
            <li><strong>Communication:</strong> Responding to inquiries, sending internship updates, task assignments, and certificate notifications.</li>
            <li><strong>Service improvement:</strong> Understanding how our website is used so we can improve functionality and user experience.</li>
            <li><strong>Legal compliance:</strong> Meeting our obligations under applicable Indian law and regulations.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            We do not sell, rent, or trade your personal information to third parties
            for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Your data is stored securely using Supabase, a cloud database platform,
            with servers hosted in compliance with industry-standard security
            practices. We implement the following safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>All data transmitted between your browser and our servers is encrypted using TLS/SSL.</li>
            <li>Database access is controlled through Row Level Security (RLS) policies, ensuring users can only access their own data.</li>
            <li>Authentication is handled via secure session management with automatic token rotation.</li>
            <li>Passwords are hashed using industry-standard algorithms — we never store passwords in plain text.</li>
            <li>File uploads (photos, resumes) are stored in secure, access-controlled storage buckets.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            While we take reasonable precautions to protect your data, no method of
            electronic storage or transmission is 100% secure. We cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies and Tracking</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Our website uses cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Essential cookies:</strong> Required for authentication, session management, and basic site functionality.</li>
            <li><strong>Preference cookies:</strong> Storing your theme preference (light/dark mode).</li>
            <li><strong>Analytics:</strong> Understanding site usage patterns to improve our services.</li>
            <li><strong>Advertising:</strong> We use Google AdSense, which may use cookies to serve relevant advertisements. Google's use of advertising cookies is governed by their own privacy policies.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            You can manage cookie preferences through your browser settings. Note
            that disabling essential cookies may affect site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We use the following third-party services that may process your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Supabase:</strong> Database hosting, authentication, and file storage.</li>
            <li><strong>Google AdSense:</strong> Advertising platform that may collect browsing data for ad personalization.</li>
            <li><strong>Vercel:</strong> Website hosting and deployment.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Each of these services has its own privacy policy governing how they
            handle data. We recommend reviewing their policies for full details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> You can request corrections to inaccurate or incomplete data through your profile settings or by contacting us.</li>
            <li><strong>Deletion:</strong> You can request deletion of your account and associated data by contacting us at {COMPANY.email}.</li>
            <li><strong>Data portability:</strong> You can request your data in a structured, machine-readable format.</li>
            <li><strong>Withdraw consent:</strong> You can withdraw consent for data processing at any time, though this may affect your ability to use certain services.</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            To exercise any of these rights, please contact us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            . We will respond within 30 days of receiving your request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We retain your personal data for as long as necessary to provide our
            services and fulfill the purposes described in this policy. Internship
            records, certificates, and verification data are retained to enable
            ongoing certificate verification. If you request account deletion, we
            will remove your personal data within 30 days, though we may retain
            certain anonymized records for legitimate business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our services are intended for individuals aged 16 and above. We do not
            knowingly collect personal information from children under 16. If we
            become aware that we have collected data from a child under 16, we will
            take steps to delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes
            will be posted on this page with an updated "Last updated" date. We
            encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you have any questions about this Privacy Policy or how we handle
            your data, please contact us:
          </p>
          <ul className="list-none space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Company:</strong> {COMPANY.name}</li>
            <li><strong>MSME Registration:</strong> {COMPANY.udyam}</li>
            <li>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
                {COMPANY.email}
              </a>
            </li>
            <li>
              <strong>Website:</strong>{" "}
              <a href="https://yrnovatech.in" className="text-primary hover:underline">
                yrnovatech.in
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Section>
  );
}
