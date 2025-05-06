import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
    <section className="mb-8">
    
      <h1 className="text-3xl font-bold text-white mb-2 mt-0 neon-text">Privacy Policy</h1>
      <p className="text-white/60 mb-6">
        Your privacy is important to us. Please read this Privacy Policy carefully to understand how we handle your information.
      </p>

      <Card className="p-6 border border-primary/20 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white">Privacy Policy for AIVisionContest</CardTitle>
          <CardDescription className="text-white/60">
            Welcome to AIVisionContest, a service provided by Winbergh Media ("we", "us", "our"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mt-4">1. Information We Collect</h2>
          <p className="text-white/60">
            We may collect the following types of information when you use AIVisionContest:
          </p>
          <ul className="list-disc list-inside text-white/60">
            <li><strong>Personal Information</strong>: Such as your name, email address, and payment details when you create an account or make a purchase.</li>
            <li><strong>Usage Data</strong>: Information about how you interact with our service, including IP addresses, browser type, and pages visited.</li>
            <li><strong>Content Data</strong>: Any content you create or upload, such as AI-generated artists, images, music, and text.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-4">2. How We Use Your Information</h2>
          <p className="text-white/60">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside text-white/60">
            <li>To provide, maintain, and improve our service.</li>
            <li>To process transactions and send you related information, including purchase confirmations.</li>
            <li>To communicate with you about updates, promotions, and support.</li>
            <li>To monitor and analyze usage trends and preferences.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-4">3. Sharing Your Information</h2>
          <p className="text-white/60">
            We do not sell or rent your personal information to third parties. However, we may share your information in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-white/60">
            <li>With third-party service providers who assist us in operating our service (e.g., payment processors, API providers).</li>
            <li>If required by law or to protect our rights, property, or safety.</li>
            <li>With your consent or at your direction.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-4">4. Data Security</h2>
          <p className="text-white/60">
            We take reasonable measures to protect your information from unauthorized access, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-bold text-white mt-4">5. Your Rights</h2>
          <p className="text-white/60">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-white/60">
            <li>Access, update, or delete your personal information.</li>
            <li>Opt-out of receiving promotional communications.</li>
            <li>Request a copy of the data we hold about you.</li>
          </ul>
          <p className="text-white/60">
            To exercise these rights, please contact us at{" "}
            <a href="mailto:support@winberghmedia.com" className="text-primary hover:underline">
              support@winberghmedia.com
            </a>.
          </p>

          <h2 className="text-xl font-bold text-white mt-4">6. Third-Party Links</h2>
          <p className="text-white/60">
            Our service may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to review their privacy policies before providing any personal information.
          </p>

          <h2 className="text-xl font-bold text-white mt-4">7. Changes to This Privacy Policy</h2>
          <p className="text-white/60">
            We may update this Privacy Policy from time to time. Any changes will be effective immediately upon posting on this page. Your continued use of the service after any changes constitutes your acceptance of the updated Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-white mt-4">8. Contact Us</h2>
          <p className="text-white/60">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:support@winberghmedia.com" className="text-primary hover:underline">
              support@winberghmedia.com
            </a>.
          </p>
        </div>
      </Card>
    </section>
     </div>
     
  );
};

export default PrivacyPolicy;