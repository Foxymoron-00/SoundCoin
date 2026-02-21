import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Music, ListMusic, Coins, Gift } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Curated Library',
    description:
      'Thousands of royalty-free tracks across every genre. Hand-picked and quality-checked.',
    Icon: Music,
  },
  {
    title: 'Smart Playlists',
    description:
      'AI-powered recommendations that learn your taste. Discover your next favorite song.',
    Icon: ListMusic,
  },
  {
    title: 'Real-Time Earnings',
    description:
      'Watch your coin balance grow with every beat. Live counter, instant gratification.',
    Icon: Coins,
  },
  {
    title: 'Instant Rewards',
    description:
      'Redeem for PayPal, gift cards, or exclusive perks. No minimums, no waiting.',
    Icon: Gift,
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];

      // Label typewriter effect
      triggers.push(
        ScrollTrigger.create({
          trigger: labelRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(
              labelRef.current,
              { width: 0, opacity: 0 },
              { width: 'auto', opacity: 1, duration: 0.4, ease: 'none' }
            );
          },
          once: true,
        })
      );

      // Title word split animation
      triggers.push(
        ScrollTrigger.create({
          trigger: titleRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(
              titleRef.current?.querySelectorAll('.word') || [],
              { y: 60, rotateX: 30, opacity: 0 },
              {
                y: 0,
                rotateX: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: 'expo.out',
                delay: 0.2,
              }
            );
          },
          once: true,
        })
      );

      // Subtitle fade up
      triggers.push(
        ScrollTrigger.create({
          trigger: subtitleRef.current,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(
              subtitleRef.current,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.4 }
            );
          },
          once: true,
        })
      );

      // Feature cards slide in
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        cards.forEach((card, index) => {
          triggers.push(
            ScrollTrigger.create({
              trigger: card,
              start: 'top 90%',
              onEnter: () => {
                gsap.fromTo(
                  card,
                  { x: -80, opacity: 0 },
                  {
                    x: 0,
                    opacity: 1,
                    duration: 0.7,
                    delay: 0.5 + index * 0.12,
                    ease: 'expo.out',
                  }
                );
              },
              once: true,
            })
          );
        });
      }

      // Image 3D reveal
      triggers.push(
        ScrollTrigger.create({
          trigger: imageRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              imageRef.current,
              { rotateY: -40, x: 150, opacity: 0 },
              {
                rotateY: 0,
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'expo.out',
                delay: 0.3,
              }
            );
          },
          once: true,
        })
      );

      // Parallax on scroll
      triggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(imageRef.current, { y: 50 - 100 * progress });
          },
        })
      );

      return () => {
        triggers.forEach(t => t.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#030303]">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF5A65]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Section Label */}
            <span
              ref={labelRef}
              className="inline-block text-sm font-medium text-[#FF5A65] tracking-wider uppercase mb-4 overflow-hidden whitespace-nowrap"
            >
              Features
            </span>

            {/* Title */}
            <h2
              ref={titleRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6"
              style={{ perspective: '1000px' }}
            >
              {'Everything You Need'.split(' ').map((word, i) => (
                <span key={i} className="word inline-block mr-3">
                  {word}
                </span>
              ))}
            </h2>

            {/* Subtitle */}
            <p ref={subtitleRef} className="text-lg text-white/60 mb-12">
              A complete music ecosystem designed for listeners who earn
            </p>

            {/* Feature Cards */}
            <div ref={cardsRef} className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card group glass-card p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.05] hover:border-[#FF5A65]/30 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="icon-gradient w-12 h-12 flex-shrink-0 transition-all duration-300 group-hover:scale-115 group-hover:rotate-12">
                      <feature.Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-2 font-['Fraunces'] group-hover:text-[#FF5A65] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Left border accent on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#FF5A65] to-[#FF8A93] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div
            ref={imageRef}
            className="relative hidden lg:block"
            style={{ perspective: '1000px' }}
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A65]/20 to-[#FF8A93]/20 rounded-3xl blur-3xl transform scale-90 group-hover:scale-100 transition-transform duration-700" />

              {/* Image container */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=800&fit=crop"
                  alt="Music production studio with headphones and equipment"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/80 via-[#030303]/20 to-transparent" />

                {/* Floating stats cards */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  <div className="glass-card px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">Today's Earnings</p>
                      <p className="text-xl font-bold gradient-text">+47 coins</p>
                    </div>
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="glass-card px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">Listening Time</p>
                      <p className="text-xl font-bold text-white">2h 34m</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 border border-[#FF5A65]/30 rounded-full animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-[#FF8A93]/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
