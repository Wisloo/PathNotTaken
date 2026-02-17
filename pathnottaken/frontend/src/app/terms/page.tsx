import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PathNotTaken",
  description: "Terms and conditions for using the PathNotTaken platform.",
};

export default function TermsPage() {
  const lastUpdated = "June 15, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {lastUpdated}</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using PathNotTaken, you agree to be bound by these Terms of Service. If
            you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            PathNotTaken is a career discovery platform that provides personalized career
            recommendations and learning roadmaps based on your skills, interests, and goals.
            Our recommendations are generated using AI and data analysis and are intended as
            guidance, not guarantees of employment outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Accounts</h2>
          <p className="text-slate-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials. You
            must provide accurate information when creating an account. You may not share your
            account or use another person&apos;s account without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed">
            You agree not to misuse the service, including but not limited to: attempting to access
            other users&apos; accounts, scraping or harvesting data, submitting malicious content, or
            using the service for any unlawful purpose. We reserve the right to suspend or terminate
            accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">
            All content, branding, and technology on PathNotTaken are owned by us or our licensors.
            You may not copy, modify, or distribute any part of the service without our written
            permission. Your user-generated content (skills, preferences) remains yours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Disclaimers</h2>
          <p className="text-slate-600 leading-relaxed">
            PathNotTaken is provided &quot;as is&quot; without warranties of any kind. Career
            recommendations are suggestions based on available data and should not be considered
            professional career counseling. We do not guarantee job placement, salary levels, or
            career outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            To the maximum extent permitted by law, PathNotTaken shall not be liable for any
            indirect, incidental, or consequential damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Changes to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            We may revise these terms at any time. Continued use of the service after changes
            constitutes acceptance of the updated terms. Material changes will be communicated
            through the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Questions about these terms? Visit our{" "}
            <a href="/contact" className="text-emerald-600 hover:text-emerald-700 underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
