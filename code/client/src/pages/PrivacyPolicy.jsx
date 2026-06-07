// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~30%
// AI-Assisted Areas: page structure, section layout
// Human Contributions: content decisions, routing integration, styling adjustments
// Notes: BARI-156 — public route, no auth required

import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '760px' }}>

        {/* Back link */}
        <div className="mb-4">
          <Link to="/register" className="text-decoration-none text-primary">
            ← Back to Registration
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded shadow-sm p-4 mb-3">
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>
            Privacy Policy, Disclaimer & Consent
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Effective Date: June 1, 2026 · BariatricPath Health System
          </p>
        </div>

        {/* Sections */}
        {[
          {
            title: '1. Information We Collect',
            content: (
              <p>
                BariatricPath collects personal and medical information you provide during
                registration and program intake, including your name, email address, date of birth,
                BMI data, insurance information, and clinical status updates. This information is
                necessary to coordinate your bariatric care program.
              </p>
            ),
          },
          {
            title: '2. How We Use Your Information',
            content: (
              <>
                <p className="mb-2">Your information is used to:</p>
                <ul className="mb-0">
                  <li>Coordinate your pre-authorization and insurance verification</li>
                  <li>Track your clinical progress through the bariatric program</li>
                  <li>Send you status updates and notifications through the patient portal</li>
                  <li>Generate progress reports for your care team</li>
                </ul>
              </>
            ),
          },
          {
            title: '3. Data Security',
            content: (
              <p>
                All data is encrypted in transit using TLS and stored securely. Access to your
                records is restricted to authorized coordinators and program directors. We do not
                sell or share your personal health information with third parties without your
                explicit consent, except as required by law.
              </p>
            ),
          },
          {
            title: '4. Your Rights',
            content: (
              <>
                <p className="mb-2">You have the right to:</p>
                <ul className="mb-0">
                  <li>Access the personal information we hold about you</li>
                  <li>Request corrections to inaccurate information</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Withdraw consent at any time by contacting your care coordinator</li>
                </ul>
              </>
            ),
          },
          {
            title: '5. Disclaimer',
            content: (
              <p>
                BariatricPath is a care coordination platform and does not provide medical advice.
                All clinical decisions are made by qualified healthcare professionals. The
                information in this portal is for coordination purposes only.
              </p>
            ),
          },
          {
            title: '6. Contact',
            content: (
              <p>
                For questions about this policy, contact your program coordinator or email{' '}
                <a href="mailto:privacy@bariatricpath.com">privacy@bariatricpath.com</a>.
              </p>
            ),
          },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded shadow-sm p-4 mb-3">
            <h5 className="fw-semibold mb-3" style={{ color: '#1a1a2e' }}>
              {section.title}
            </h5>
            <div style={{ color: '#444', lineHeight: '1.7' }}>
              {section.content}
            </div>
          </div>
        ))}

        {/* Return button */}
        <div className="text-center mt-2 mb-5">
          <Link to="/register" className="btn btn-primary px-5">
            Return to Registration
          </Link>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicyPage;