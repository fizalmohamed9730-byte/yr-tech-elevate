import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${COMPANY.name}` },
      {
        name: "description",
        content: `Terms and Conditions for using ${COMPANY.name} services, internship programs, and website.`,
      },
      { property: "og:title", content: `Terms & Conditions — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Terms of use for ${COMPANY.name} services and internship programs.`,
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Terms & Conditions"
        description="Last updated: September 2026"
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using the {COMPANY.name} website (yrnovatech.in) and any
            services provided through it, you agree to be bound by these Terms &
            Conditions. If you do not agree with any part of these terms, you should
            not use our website or services. {COMPANY.name} is a Micro, Small &
            Medium Enterprise registered under the Government of India (MSME
            Registration: {COMPANY.udyam}).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Services Overview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {COMPANY.name} provides the following services through its website:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Software development services:</strong> Custom software, web applications, mobile applications, AI solutions, and UI/UX design for businesses and organizations.</li>
            <li><strong>Project-based internship programs:</strong> Structured internship programs across multiple technology domains including Full Stack Development, Artificial Intelligence, Python, C/C++, and UI/UX Design.</li>
            <li><strong>Educational resources:</strong> Technical articles, engineering knowledge, and learning materials published on our website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">3.1 Account Creation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To participate in our internship programs, you must create an account by
            providing accurate and complete information. You are responsible for
            maintaining the confidentiality of your account credentials and for all
            activity under your account. You must notify us immediately of any
            unauthorized use of your account.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">3.2 Account Accuracy</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You agree that the information you provide during registration — including
            your name, email, phone number, educational institution, and department — is
            truthful and accurate. Providing false information may result in account
            suspension or termination.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">3.3 Account Termination</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these
            terms, engage in fraudulent activity, or submit plagiarized work.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Internship Program Terms</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">4.1 Nature of Internship</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {COMPANY.name} internships are project-based learning programs. They are
            not employment. Interns are not employees of {COMPANY.name} and no
            employer-employee relationship is created through participation.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">4.2 Domain and Duration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upon registration, you select your internship domain and duration. These
            selections cannot be changed after registration. Available durations are
            1 month, 2 months, and 3 months.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">4.3 Tasks and Submissions</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Interns are assigned project tasks that must be completed and submitted
            through the platform. All submissions must be original work. Plagiarism,
            copy-pasting from other sources without attribution, or submitting work
            done by others will result in task rejection and potential program
            termination.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">4.4 Certificates</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certificates of completion are issued to interns who successfully complete
            all required tasks and receive approval from the review team. Certificate
            issuance is at the discretion of {COMPANY.name} based on the quality and
            completeness of submitted work. A certificate processing fee may apply
            as communicated during the internship program.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">4.5 Verification</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All certificates issued by {COMPANY.name} include a unique verification
            code and can be verified publicly on our website. This verification
            service is provided to enable employers and institutions to confirm the
            authenticity of certificates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">5.1 Our Content</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All content on the {COMPANY.name} website — including text, graphics,
            logos, images, design, layout, and software — is the property of{" "}
            {COMPANY.name} or its content suppliers and is protected by Indian and
            international intellectual property laws. You may not reproduce,
            distribute, modify, or create derivative works from our content without
            prior written consent.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">5.2 User Submissions</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By submitting project work, feedback, or other content through our
            platform, you grant {COMPANY.name} a non-exclusive, royalty-free license
            to use, display, and showcase such content for promotional and educational
            purposes (for example, showcasing anonymized project examples in our
            portfolio). You retain ownership of your original work.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Acceptable Use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Use the website for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to gain unauthorized access to other user accounts, systems, or data.</li>
            <li>Submit false, misleading, or plagiarized information or work.</li>
            <li>Interfere with the proper functioning of the website or its infrastructure.</li>
            <li>Scrape, crawl, or harvest content from the website without permission.</li>
            <li>Use automated systems (bots, scripts) to access or interact with the website without authorization.</li>
            <li>Upload malicious files, viruses, or harmful code.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Payments and Refunds</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where applicable, certain services — such as certificate processing fees — may
            require payment. All payments are processed through secure payment
            gateways. Please refer to our{" "}
            <Link to="/refund-policy" className="text-primary hover:underline">
              Refund & Cancellation Policy
            </Link>{" "}
            for details on refund eligibility and procedures.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {COMPANY.name} provides its website and services on an "as is" and "as
            available" basis. We do not guarantee uninterrupted access, error-free
            operation, or specific outcomes from using our services or completing our
            internship programs. To the fullest extent permitted by law, {COMPANY.name}
            shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the website or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Completion of a {COMPANY.name} internship program does not guarantee
            employment, university credit, or any specific career outcome. Our
            internship programs are independent learning experiences. Any career
            benefits are dependent on individual effort, skill development, and
            market conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms & Conditions are governed by and construed in accordance with
            the laws of India. Any disputes arising from these terms shall be subject
            to the exclusive jurisdiction of the courts in Tamil Nadu, India.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms & Conditions at any time.
            Material changes will be posted on this page with an updated date.
            Continued use of our website after changes constitutes acceptance of the
            updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For questions about these Terms & Conditions, contact us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            .
          </p>
        </section>
      </div>
    </Section>
  );
}
