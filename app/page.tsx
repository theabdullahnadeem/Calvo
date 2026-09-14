import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import {
  faqSchema,
  graph,
  organizationSchema,
  serviceSchema,
  websiteSchema,
} from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import SectionDepth from '@/components/motion/SectionDepth';
import Hero from '@/components/sections/Hero';
import ProblemStatement from '@/components/sections/ProblemStatement';
import HowItWorks from '@/components/sections/HowItWorks';
import ProductPillars from '@/components/sections/ProductPillars';
import MarqueeBand from '@/components/sections/MarqueeBand';
import VerticalProof from '@/components/sections/VerticalProof';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import CTASection from '@/components/sections/CTASection';

export const metadata: Metadata = pageMetadata({
  title: site.meta.titleDefault,
  description: site.meta.description,
  path: '',
});

/**
 * Homepage.
 *
 * Section order follows 05-animation-spec.md — hero, problem, how it works,
 * pillars, proof, close — with pricing added before the close and a marquee band
 * breaking the rhythm in the middle.
 *
 * Surfaces alternate ink / ink / paper / paper / ink / ink / paper / paper, which
 * gives the page a dark opening act, a light explanatory middle, a dark proof
 * beat and a calm light close. Each section declares `data-surface` so the fixed
 * header can re-theme itself against whatever is under it.
 *
 * SectionDepth wraps only the unpinned sections. It applies a transform, and a
 * transformed ancestor breaks the `position: fixed` that ScrollTrigger pins
 * with — so ProblemStatement and HowItWorks are deliberately left bare and carry
 * their own depth choreography internally.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graph(
          organizationSchema(),
          websiteSchema(),
          serviceSchema(),
          faqSchema(),
        )}
      />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <SectionDepth>
        <ProductPillars />
      </SectionDepth>
      <MarqueeBand />
      <SectionDepth>
        <VerticalProof />
      </SectionDepth>
      <SectionDepth>
        <Pricing />
      </SectionDepth>
      <Faq />
      <CTASection />
    </>
  );
}
