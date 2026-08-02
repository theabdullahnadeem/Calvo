import type { Metadata } from 'next';
import { legal } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';
import LegalPage from '@/components/sections/LegalPage';

const doc = legal.privacy;

export const metadata: Metadata = {
  title: doc.meta.title,
  description: doc.meta.description,
  alternates: { canonical: `${SITE_URL}/${doc.slug}` },
  openGraph: {
    title: doc.meta.title,
    description: doc.meta.description,
    url: `${SITE_URL}/${doc.slug}`,
  },
};

export default function PrivacyPage() {
  return <LegalPage doc={doc} />;
}
