import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Terms and Conditions governing use of the YR NOVATECH website, accounts, services, internship participation, task submissions, certificates, and payments.",
      },
      { property: "og:title", content: `Terms & Conditions — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "Rules governing use of the YR NOVATECH website, internship program, submissions, certificates, and payments.",
      },
      { property: "og:url", content: "https://www.yrnovatech.in/terms-and-conditions" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/terms-and-conditions" }],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Terms & Conditions"
        description={`Last updated: September 2026`}
      />

      <div className="max-w-3xl mx-auto space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms & Conditions ("Terms") govern your access to and use of the {COMPANY.name}{" "}
            website (www.yrnovatech.in) and the services provided through it, including account
            registration, the internship program, task submissions, certificates, and payments made
            where applicable.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            By accessing or using this website or any of our services, you agree to be bound by
            these Terms. If you do not agree with any part of these Terms, you should not use our
            website or services. {COMPANY.name} is a Micro, Small & Medium Enterprise registered
            under the Government of India (Udyam Registration: {COMPANY.udyam}).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of Website</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This website is provided for informative and functional purposes, including learning
            more about our company, applying for internships, managing accounts, submitting
            internship work, verifying certificates, and contacting us. You agree to use the website
            only for lawful purposes and in a manner that does not restrict or inhibit any other
            user's use and enjoyment of the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To participate in our internship program you must create an account by providing
            accurate and complete information. You are responsible for maintaining the
            confidentiality of your account credentials and for all activity that occurs under your
            account. You must notify us immediately if you become aware of any unauthorized use of
            your account. We may suspend or terminate accounts that violate these Terms or engage in
            fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Registration Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you register, we collect information including your name, email address, phone
            number, educational institution, department, year of study, and country of residence,
            along with the internship domain and duration you select. You agree that the information
            you provide is truthful and accurate. Providing false or misleading information may
            result in rejection of your application or termination of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Internship Program</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {COMPANY.name} internship programs are project-based learning experiences. They are not
            employment, and participation does not create an employment relationship. Interns select
            a domain and a duration (1 month, 2 months, or 3 months) at the time of registration.
            Internships follow a structured flow: registration, offer letter, project tasks,
            submission, review, and, upon successful completion, a certificate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Task Submission</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Interns are assigned project tasks that must be completed and submitted through the
            platform using the method specified (such as a GitHub repository, documented project, or
            other required deliverable). All submissions must be your original work. Plagiarism,
            submitting someone else's work, or copying content without attribution may result in
            rejection of the submission and, in serious cases, termination of the internship.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Task Review and Approval</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Submitted tasks are reviewed by our team. Tasks may be approved, rejected, or returned
            with feedback. Interns are expected to incorporate feedback and resubmit where required.
            Approval is based on the quality, completeness, and originality of the submitted work.
            Progress towards completion is determined by approved tasks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Certificate Eligibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certificates are issued to interns who successfully complete all required tasks for
            their selected duration and receive approval for those tasks. Where a certificate
            payment requirement applies to the intern's internship flow, the relevant payment must
            also be made and verified. Certificate eligibility is at the discretion of{" "}
            {COMPANY.name}, based on the completeness and quality of the submitted work. Completing
            a program does not guarantee a certificate, employment, or any specific career outcome.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Certificate Issuance</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            On successful completion, {COMPANY.name} may issue a certificate with a unique
            certificate code. Each certificate includes a verification code that can be checked
            publicly on our website to confirm authenticity. Issued certificates may be revoked if
            they were issued in error or if the issuing conditions were not met.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Certificate Payment, where applicable</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certain internship flows include a certificate processing fee, which is communicated to
            the intern within their account dashboard at the appropriate stage. Payment, where
            applicable, is made via the payment method shown in the account (UPI). You must provide
            the exact transaction or UTR reference and, where requested, a payment screenshot. The
            fee amount is displayed clearly before payment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Payment Verification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Payments are verified manually by our team using the transaction details and screenshot
            you provide. Until verification is complete, a payment is marked as pending. Once
            verified, it is marked as paid. If verification fails, the payment is marked as rejected
            with a reason, and you may resubmit with correct or additional details. A certificate is
            issued only after verification of payment where a payment requirement applies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. User Responsibilities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            As a user of our website or internship program, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Provide accurate and truthful registration and submission information.</li>
            <li>Keep your account credentials secure and confidential.</li>
            <li>Complete and submit your own, original work.</li>
            <li>Follow the tasks, deadlines, and review feedback communicated in the program.</li>
            <li>Use the website in compliance with applicable laws.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">13. Prohibited Activities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Use the website for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to other users' accounts, systems, or data.</li>
            <li>Submit false, misleading, or plagiarized information or work.</li>
            <li>Upload malicious files, viruses, or harmful code.</li>
            <li>Scrape, crawl, or harvest content from the website without permission.</li>
            <li>Interfere with the proper functioning of the website or its infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">14. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All content on the {COMPANY.name} website — including text, graphics, logos, images,
            design, layout, and software — is the property of {COMPANY.name} or its content
            suppliers and is protected by applicable intellectual property laws. You may not
            reproduce, distribute, modify, or create derivative works from our content without prior
            written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">15. Website Content</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We publish content such as articles, resources, internship details, and company
            information for general informational purposes. While we strive for accuracy, content
            may be updated from time to time and is provided without warranty of any kind. Nothing
            on this website constitutes a promise or guarantee of employment, placement,
            certification, or refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">16. Third-Party Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This website relies on third-party infrastructure providers, including but not limited
            to a cloud database and authentication platform (Supabase) for data storage,
            authentication, and file storage, and an email delivery service for sending
            notifications such as offer letters and certificates. These providers have their own
            terms and privacy policies, which we encourage you to review. Certain payment steps are
            conducted through the payment method shown in your account; we do not collect or store
            your bank or card details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">17. Service Availability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            While we aim to keep the website available, we do not guarantee uninterrupted or
            error-free operation. The website and services may be temporarily unavailable for
            maintenance, upgrades, or reasons beyond our control. We reserve the right to modify,
            suspend, or discontinue parts of the website or services at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">18. Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {COMPANY.name} provides this website and its services on an "as is" and "as available"
            basis. Our internship programs are independent learning experiences. Completion of a
            program does not guarantee employment, university credit, placement, or any specific
            career outcome. Any career benefits depend on individual effort, skill development, and
            market conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">19. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To the fullest extent permitted by law, {COMPANY.name} shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of the
            website or services, including loss of data, loss of opportunity, or interruption of
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">20. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We may update these Terms & Conditions from time to time. Material changes will be
            reflected by an updated "Last updated" date on this page. Continued use of the website
            or services after changes are posted constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">21. Contact Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about these Terms & Conditions, you can reach us on our{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contact page
            </Link>{" "}
            or via email at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            .
          </p>
          <p className="text-sm text-muted-foreground mt-6">
            Related policies:{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link to="/refund-policy" className="text-primary hover:underline">
              Refund & Cancellation Policy
            </Link>
          </p>
        </section>
      </div>
    </Section>
  );
}
