import { notFound } from 'next/navigation';
import { content, getStatsForSlug, getVerticalBySlug } from '@/lib/content';
import { breadcrumbSchema, graph, organizationSchema } from '@/lib/schema';
import JsonLd from '@/components/seo/JsonLd';
import SectionDepth from '@/components/motion/SectionDepth';
import Hero from '@/components/sections/Hero';
import PainPoints from '@/components/sections/PainPoints';
import HowItWorks from '@/components/sections/HowItWorks';
import ProductPillars from '@/components/sections/ProductPillars';
import MarqueeBand from '@/components/sections/MarqueeBand';
import VerticalProof from '@/components/sections/VerticalProof';
import Pricing from '@/components/sections/Pricing';
import OtherIndustries from '@/components/sections/OtherIndustries';
import CTASection from '@/components/sections/CTASection';

/**
 * Shared body for every /for-[vertical] page.
 *
 * Structurally identical to the homepage, content-swapped — exactly the reuse
 * model 04-file-structure.md describes. The only differences are the hero copy,
 * the industry-specific pain points, and whether a proof section renders at all.
 *
 * Proof only appears where a real result exists. 01-info.json carries a proof
 * point for the CPA vertical and for no other, and 02-design-brief.md rules out
 * placeholder proof — so the restaurant, cafe and general pages simply do not
 * have that section rather than showing borrowed or invented numbers.
 */
export function VerticalLanding({ slug }: { slug: string }) {
  const vertical = getVerticalBySlug(slug);
  if (!vertical) notFound();

  const stats = getStatsForSlug(slug);

  return (
    <>
      <JsonLd
        data={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: vertical.name, path: `/${vertical.slug}` },
          ]),
        )}
      />
      <Hero
        eyebrow={vertical.hero.eyebrow}
        headline={vertical.hero.headline}
        subheadline={vertical.hero.subheadline}
        secondaryHref="#the-problem"
      />
      <SectionDepth>
        <PainPoints vertical={vertical} />
      </SectionDepth>
      <HowItWorks />
      <SectionDepth>
        <ProductPillars />
      </SectionDepth>
      <MarqueeBand />
      {stats && (
        <SectionDepth>
          <VerticalProof
            stats={stats}
            // On the CPA page the vertical framing is the point of the page, so
            // the homepage's "this is only one example" hedge would read as odd.
            showFraming={false}
            showLink={false}
            heading={content.verticals.primary.proofHeading}
          />
        </SectionDepth>
      )}
      <SectionDepth>
        <Pricing />
      </SectionDepth>
      <OtherIndustries currentSlug={slug} />
      <CTASection />
    </>
  );
}

export default VerticalLanding;
