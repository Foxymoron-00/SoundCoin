import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Music, Coins, Star, Headphones, Gift, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const orbitingIcons = [
  { Icon: Music, orbit: 1, size: 'w-10 h-10', delay: 0 },
  { Icon: Coins, orbit: 1, size: 'w-8 h-8', delay: 2 },
  { Icon: Star, orbit: 2, size: 'w-6 h-6', delay: 1 },
  { Icon: Headphones, orbit: 2, size: 'w-8 h-8', delay: 3 },
  { Icon: Gift, orbit: 3, size: 'w-6 h-6', delay: 1.5 },
  { Icon: Zap, orbit: 3, size: 'w-10 h-10', delay: 2.5 },
  { Icon: Sparkles, orbit: 1, size: 'w-6 h-6', delay: 3.5 },
];

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];

      // Background radial expand
      const sectionEl = sectionRef.current;
      if (sectionEl) {
        triggers.push(
          ScrollTrigger.create({
            trigger: sectionEl,
            start: 'top 80%',
            onEnter: () => {
              const radialBg = sectionEl.querySelector('.radial-bg');
              if (radialBg) {
                gsap.fromTo(
                  radialBg,
                  { scale: 0, opacity: 0 },
                  { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }
                );
              }
            },
            once: true,
          })
        );
      }

      // Headline scale + blur
      const headlineEl = headlineRef.current;
      if (headlineEl) {
        triggers.push(
          ScrollTrigger.create({
            // @ts-ignore
            trigger: headlineEl,
            start: 'top 85%',
            onEnter: () => {
              gsap.fromTo(
                headlineEl,
                { scale: 0.8, filter: 'blur(10px)', opacity: 0 },
                {
                  scale: 1,
                  filter: 'blur(0px)',
                  opacity: 1,
                  duration: 0.8,
                  ease: 'expo.out',
                  delay: 0.3,
                }
              );
            },
            once: true,
          })
        );
      }

      // Description fade up
      triggers.push(
        ScrollTrigger.create({
          trigger: descriptionRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(
              descriptionRef.current,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.5 }
            );
          },
          once: true,
        })
      );

      // CTA bounce in
      triggers.push(
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(
              ctaRef.current?.children || [],
              { scale: 0, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: 'elastic.out(1, 0.5)',
                delay: 0.7,
              }
            );
          },
          once: true,
        })
      );

      // Orbit icons
      const icons = orbitsRef.current?.querySelectorAll('.orbit-icon');
      if (icons) {
        triggers.push(
          ScrollTrigger.create({
            trigger: orbitsRef.current,
            start: 'top 85%',
            onEnter: () => {
              gsap.fromTo(
                icons,
                { scale: 0, rotate: -180 },
                {
                  scale: 1,
                  rotate: 0,
                  duration: 0.5,
                  stagger: 0.08,
                  ease: 'elastic.out(1, 0.5)',
                  delay: 0.9,
                }
              );
            },
            once: true,
          })
        );
      }

      return () => {
        triggers.forEach(t => t.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Radial gradient background */}
      <div className="radial-bg absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#FF5A65]/20 via-[#FF5A65]/5 to-transparent blur-3xl" />
      </div>

      {/* Particle burst effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#FF5A65]/40"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 12}deg) translateX(${100 + Math.random() * 200}px)`,
              animation: `particle-burst ${3 + Math.random() * 4}s ease-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Orbiting icons */}
      <div ref={orbitsRef} className="absolute inset-0 pointer-events-none">
        {orbitingIcons.map(({ Icon, orbit, size, delay }, index) => (
          <div
            key={index}
            className={`orbit-icon absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${size}`}
            style={{
              animation: `orbit-${orbit % 2 === 0 ? 'cw' : 'ccw'} ${15 + orbit * 5}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <div className="icon-gradient w-full h-full">
              <Icon className="w-1/2 h-1/2 text-white mx-auto" style={{ marginTop: '25%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          ref={headlineRef}
          className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-6 font-['Fraunces']"
        >
          Start Earning <span className="gradient-text">Today</span>
        </h2>

        <p
          ref={descriptionRef}
          className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Join thousands of listeners who've turned their love for music into real
          rewards. No fees, no catch—just play and earn.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button className="btn-primary text-base px-10 py-6 shadow-[0_0_40px_rgba(255,90,101,0.3)] hover:shadow-[0_0_60px_rgba(255,90,101,0.5)]">
              Create Free Account
            </Button>
          </Link>
          <Link to="/about">
            <Button className="btn-secondary text-base px-10 py-6">Learn More</Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5A65]" />
            <span>Free Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FF5A65]" />
            <span>Instant Payouts</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#FF5A65]" />
            <span>10,000+ Tracks</span>
          </div>
        </div>
      </div>

      {/* Custom styles for orbit animations */}
      <style>{`
        @keyframes orbit-cw {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(200px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(200px) rotate(-360deg); }
        }
        @keyframes orbit-ccw {
          from { transform: translate(-50%, -50%) rotate(360deg) translateX(280px) rotate(-360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg) translateX(280px) rotate(0deg); }
        }
        @keyframes particle-burst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5) translateX(50px); }
        }
      `}</style>
    </section>
  );
}
