import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { Features } from '@/sections/Features';
import { CTA } from '@/sections/CTA';

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <HowItWorks />
      <Features />
      <CTA />
    </div>
  );
}
