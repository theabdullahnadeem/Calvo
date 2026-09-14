import type { Metadata } from 'next';
import { legal } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import LegalPage from '@/components/sections/LegalPage';

const doc = legal.terms;

export const metadata: Metadata = pageMetadata({
  title: doc.meta.title,
  description: doc.meta.description,
  path: `/${doc.slug}`,
});

export default function TermsPage() {
  return <LegalPage doc={doc} />;
}
