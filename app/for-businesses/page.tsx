import type { Metadata } from 'next';
import { getVerticalBySlug } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import VerticalLanding from '@/components/sections/VerticalLanding';

const SLUG = 'for-businesses';
const vertical = getVerticalBySlug(SLUG)!;

export const metadata: Metadata = pageMetadata({
  title: vertical.meta.title,
  description: vertical.meta.description,
  path: `/${SLUG}`,
});

export default function BusinessesPage() {
  return <VerticalLanding slug={SLUG} />;
}
