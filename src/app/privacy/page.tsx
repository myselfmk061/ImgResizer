'use client';

'use client';

import { ImageUp, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const router = useRouter();
  
  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
  
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm">
        <div className="flex items-center gap-2">
          <ImageUp className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            ImgResizer
          </h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              ImgResizer is designed with privacy in mind. We collect minimal information to provide our service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Images:</strong> Images you upload are processed locally in your browser and are not stored on our servers</li>
              <li><strong>Feedback:</strong> When you submit feedback, we collect your name, email, and message</li>
              <li><strong>Usage Data:</strong> Basic analytics about how you use our service (page views, feature usage)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and resize your images locally in your browser</li>
              <li>Respond to your feedback and support requests</li>
              <li>Improve our service based on usage patterns</li>
              <li>Send important updates about our service (if you provided email)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
            <p className="mb-4">
              <strong>Your Privacy is Our Priority:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Images are processed entirely in your browser - they never leave your device</li>
              <li>No images are uploaded to or stored on our servers</li>
              <li>Feedback data is stored securely and used only for service improvement</li>
              <li>We use industry-standard security measures to protect any data we do collect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Vercel:</strong> For hosting our website</li>
              <li><strong>FormSubmit:</strong> For processing feedback forms</li>
              <li><strong>Analytics:</strong> For understanding how our service is used (anonymized data only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access any personal data we have about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of communications</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Local Storage</h2>
            <p className="mb-4">
              We use minimal cookies and local storage for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remembering your preferences (theme, settings)</li>
              <li>Basic analytics (anonymous usage data)</li>
              <li>No tracking cookies or personal identification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: myselfmkapps@gmail.com</li>
              <li>Through our feedback form on the main page</li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm">
              ImgResizer processes your images locally in your browser for maximum privacy. We don't store your images on our servers. 
              We only collect minimal data (feedback, basic analytics) to improve our service. Your privacy and data security are our top priorities.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
