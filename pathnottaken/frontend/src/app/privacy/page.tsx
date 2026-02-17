import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PathNotTaken",
  description: "How PathNotTaken collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "June 15, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {lastUpdated}</p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">
            When you create an account, we collect your name and email address. When you use our
            career exploration tools, we collect the skills and interests you provide to generate
            personalized recommendations. We also collect basic usage data such as pages visited and
            features used to improve our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed">
            We use your information to provide personalized career recommendations, generate learning
            roadmaps, and improve our platform. We do not sell your personal information to third
            parties. Your skills and career data are used solely to power your experience on
            PathNotTaken.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Storage &amp; Security</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is stored securely and we implement industry-standard security measures to
            protect it. Passwords are hashed using bcrypt and are never stored in plain text.
            Authentication tokens are used for session management and expire after a set period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Cookies &amp; Local Storage</h2>
          <p className="text-slate-600 leading-relaxed">
            We use browser local storage to maintain your session and remember your preferences.
            We do not use third-party tracking cookies. Essential storage is used only to keep you
            logged in and save your skill selections between visits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">
            You can access, update, or delete your account and all associated data at any time from
            your account settings page. Upon account deletion, all your personal data, saved
            roadmaps, and career preferences are permanently removed from our systems.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Changes to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any material
            changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this privacy policy or your data, please reach out via
            our{" "}
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
