import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-24 px-4">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 mt-0 neon-text">Terms and Conditions</h1>
        <p className="text-white/60 mb-6">
          Please read these Terms and Conditions carefully before using AIVisionContest.
        </p>

        <Card className="p-6 border border-primary/20 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Terms and Conditions for AIVisionContest</CardTitle>
            <CardDescription className="text-white/60">
              Welcome to AIVisionContest, a service provided by Winbergh Media ("we", "us", "our"). By using our web app and services, you agree to these Terms and Conditions. Please read the following terms carefully before using our service.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mt-4">1. Description of Service</h2>
            <p className="text-white/60">
              AIVisionContest is a platform that allows users to create AI-generated artists, including images, music, and text. The service relies on third-party APIs to generate content, and we cannot guarantee the availability or quality of these APIs.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">2. Ownership of Content</h2>
            <p className="text-white/60">
              By using AIVisionContest, you agree that all content created on the platform, including but not limited to music, images, and text, is the sole property of Winbergh Media. You grant Winbergh Media a worldwide, royalty-free, perpetual, and irrevocable license to use, reproduce, modify, distribute, and publicly display the content for any purpose, including commercial and promotional use.
            </p>
            <p className="text-white/60">
              This means that Winbergh Media has the right to use the content in any manner, including but not limited to publishing, distribution, and promotion, without requiring additional consent or compensation.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">3. Royalty and Spotify Distribution</h2>
            <p className="text-white/60">
              In connection with the AI-generated music created via our platform, two distribution models to Spotify are available:
            </p>
            <ul className="list-disc ml-6 text-white/60">
              <li>
                <strong>Standard Upload:</strong> If you choose to have your song uploaded to Spotify, you will be charged a one-time fee of $4.95. Under this model, you shall retain 100% of the royalties generated from your song on Spotify.
              </li>
              <li>
                <strong>Contest Winning:</strong> If your song wins one of the contests hosted on AIVisionContest, your song will be uploaded to Spotify free of charge. In this scenario, you shall retain 50% of the royalties generated from your song, with Winbergh Media retaining 50%.
              </li>
            </ul>
            <p className="text-white/60">
              By using our service, you acknowledge and agree to the applicable royalty distribution model. Winbergh Media reserves the right to modify these terms, with appropriate notice, as needed.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">4. User Responsibility</h2>
            <p className="text-white/60">
              You are responsible for ensuring that any content you create or upload does not infringe on the intellectual property rights of third parties. By using our service, you confirm that you have the necessary rights to all content you submit.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">5. Third-Party APIs</h2>
            <p className="text-white/60">
              Our service depends on third-party APIs to function correctly. We cannot guarantee the uptime, reliability, or performance of these APIs. If a third-party API fails or becomes unavailable, we are not responsible for any disruptions or losses resulting from such failures.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">6. Payments and Refunds</h2>
            <p className="text-white/60">
              All payments made through AIVisionContest are final. We do not offer refunds for any purchases, including in-app transactions. Please ensure you understand the features and limitations of the service before making a purchase.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">7. Limitation of Liability</h2>
            <p className="text-white/60">
              Winbergh Media shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our service. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">8. Changes to Terms</h2>
            <p className="text-white/60">
              We reserve the right to modify these Terms and Conditions at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the service after any changes constitutes your acceptance of the new Terms.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">9. Governing Law</h2>
            <p className="text-white/60">
              These Terms and Conditions are governed by and construed in accordance with the laws of Sweden. Any disputes arising from these Terms shall be resolved exclusively in the courts of Sweden.
            </p>

            <h2 className="text-xl font-bold text-white mt-4">10. Prize Payments and Tax Responsibility</h2>
            <p className="text-white/60">
            Prizes are paid out in U.S. Dollars via Stripe Connect to the payment account you provide.  
You are solely responsible for reporting and paying all taxes, duties, or levies that may be due in your jurisdiction. Winbergh Media will not withhold or remit taxes on your behalf unless required by law.  
If cumulative prizes exceed USD 600 (or local equivalent) in a calendar year, Winbergh Media may request additional identification (KYC) and issue any tax forms required by applicable law (e.g., IRS Form 1099-MISC for U.S. residents).  
Prizes are awarded in a skill-based contest. No element of chance determines the winners. Residents of jurisdictions where such contests are prohibited are ineligible.  
 All currency conversion costs, bank fees, and other charges related to receiving the prize are your responsibility.

            </p>

            <p className="text-white/60 mt-6">
              If you have any questions about these Terms, please contact us at{" "}
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

export default Terms;
