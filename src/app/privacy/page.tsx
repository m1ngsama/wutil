import type { Metadata } from 'next';
import { getPrivacyToolNames, PRIVACY_NOTES } from '@/lib/privacy-notes';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy information for wutil, a collection of browser-only web utilities.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3 mb-2">Privacy</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-3">Privacy</h1>
        <p className="text-base text-ink-2 max-w-[56ch]">
          wutil is designed so utility work happens in your browser.
        </p>
      </header>

      <div className="space-y-6 text-sm leading-7 text-ink-2">
        <section>
          <h2 className="text-base font-semibold text-ink mb-2">Local processing</h2>
          <p>
            The tools run client-side. Text, images, PDFs, dates, colors, hashes, and generated passwords are processed in your browser and are not uploaded to a wutil server.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-2">No accounts</h2>
          <p>
            wutil does not require sign-in and does not collect account profile information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-2">Browser storage</h2>
          <p>
            The app may use browser-managed storage for interface preferences such as theme. Tool inputs are not intentionally stored by wutil.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-2">Tool data handling</h2>
          <div className="space-y-4">
            {PRIVACY_NOTES.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                <p>{group.note}</p>
                <p className="text-xs leading-6 text-ink-3">
                  Applies to: {getPrivacyToolNames(group.toolIds).join(', ')}.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-2">External services</h2>
          <p>
            The deployed site may be served by Cloudflare Pages. Standard hosting logs and Cloudflare Web Analytics performance metrics may be produced by the hosting platform. The application code does not send your tool content to analytics or backend processing endpoints.
          </p>
        </section>
      </div>
    </div>
  );
}
