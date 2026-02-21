import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Coins, TrendingUp, Gift } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    title: 'Hit Play',
    description:
      'Browse our curated library of royalty-free tracks. Find your perfect sound and start streaming instantly.',
    Icon: Play,
  },
  {
    number: '02',
    title: 'Earn Coins',
    description:
      'Every song you play earns you coins. The more you listen, the more you earn. It\'s that simple.',
    Icon: Coins,
  },
  {
    number: '03',
    title: 'Watch It Grow',
    description:
      'See your coin balance grow in real-time. Track your earnings and set goals for bigger rewards.',
    Icon: TrendingUp,
  },
  {
    number: '04',
    title: 'Cash Out',
    description:
      'Redeem your coins for real rewards. PayPal cash, gift cards, or exclusive music perks.',
    Icon: Gift,
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];

      // Title animation
      triggers.push(
        ScrollTrigger.create({
          trigger: titleRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              titleRef.current?.querySelectorAll('.word') || [],
              { y: 50, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.05,
                ease: 'expo.out',
              }
            );
          },
          once: true,
        })
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.step-card');
      if (cards) {
        cards.forEach((card, index) => {
          triggers.push(
            ScrollTrigger.create({
              trigger: card,
              start: 'top 85%',
              onEnter: () => {
                gsap.fromTo(
                  card,
                  { x: -100, rotateY: 25, opacity: 0 },
                  {
                    x: 0,
                    rotateY: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: 'expo.out',
                  }
                );
              },
              once: true,
            })
          );
        });
      }

      // Connector line animation
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength();
        gsap.set(lineRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        triggers.push(
          ScrollTrigger.create({
            trigger: cardsRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
            onUpdate: (self) => {
              gsap.set(lineRef.current, {
                strokeDashoffset: length * (1 - self.progress),
              });
            },
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
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#030303]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF5A65]/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6">
            {'How SoundCoin Works'.split(' ').map((word, i) => (
              <span key={i} className="word inline-block mr-3">
                {word}
              </span>
            ))}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Your journey from first play to first reward
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={cardsRef} className="relative">
          {/* Connector Line (Desktop) */}
          <svg
            className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 hidden lg:block"
            preserveAspectRatio="none"
          >
            <path
              ref={lineRef}
              d="M 100 8 Q 300 8 400 8 Q 500 8 700 8 Q 900 8 1100 8"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 8"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF5A65" />
                <stop offset="100%" stopColor="#FF8A93" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="step-card group relative"
                style={{ perspective: '1000px' }}
              >
                <div className="glass-card p-8 h-full transition-all duration-500 hover:-translate-y-3 hover:border-[#FF5A65]/30 hover:shadow-[0_20px_40px_rgba(255,90,101,0.15)]">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-2 w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="icon-gradient w-16 h-16 mb-6 animate-pulse-glow transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <step.Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-medium text-white mb-3 font-['Fraunces']">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF5A65]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating coins decoration */}
        <div className="absolute top-20 right-10 opacity-20">
          <Coins className="w-16 h-16 text-[#FF5A65] animate-float" />
        </div>
        <div className="absolute bottom-20 left-10 opacity-20">
          <Coins className="w-12 h-12 text-[#FF8A93] animate-float-delayed" />
        </div>
      </div>
    </section>
  );
}
