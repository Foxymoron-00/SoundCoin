import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Music, Coins, Star, Headphones, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const floatingIcons = [
  { Icon: Music, delay: 0, x: '-10%', y: '20%' },
  { Icon: Coins, delay: 0.5, x: '85%', y: '15%' },
  { Icon: Star, delay: 1, x: '90%', y: '60%' },
  { Icon: Headphones, delay: 1.5, x: '5%', y: '70%' },
  { Icon: Gift, delay: 2, x: '75%', y: '80%' },
  { Icon: Zap, delay: 2.5, x: '15%', y: '85%' },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation - word by word
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.fromTo(
          words,
          { y: 100, rotateX: 45, opacity: 0 },
          {
            y: 0,
            rotateX: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'expo.out',
            delay: 0.3,
          }
        );
      }

      // Subheadline blur in
      gsap.fromTo(
        subheadlineRef.current,
        { filter: 'blur(20px)', opacity: 0 },
        {
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          delay: 0.8,
        }
      );

      // Description fade up
      gsap.fromTo(
        descriptionRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          delay: 1,
        }
      );

      // CTA buttons
      gsap.fromTo(
        ctaRef.current?.children || [],
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)',
          delay: 1.2,
        }
      );

      // Hero image 3D reveal
      gsap.fromTo(
        imageRef.current,
        { rotateY: -30, x: 100, opacity: 0 },
        {
          rotateY: 0,
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          delay: 0.6,
        }
      );

      // Floating icons orbit in
      const icons = iconsRef.current?.querySelectorAll('.floating-icon');
      if (icons) {
        gsap.fromTo(
          icons,
          { scale: 0, rotate: -180 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'elastic.out(1, 0.5)',
            delay: 1.4,
          }
        );
      }

      // Scroll parallax effects
      const triggers: ScrollTrigger[] = [];

      triggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(headlineRef.current, { y: -80 * progress });
            gsap.set(subheadlineRef.current, { y: -50 * progress });
            gsap.set(imageRef.current, {
              y: -30 * progress,
              scale: 1 - 0.05 * progress,
            });
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
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030303] via-[#0a0a0a] to-[#030303]">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5A65]/20 rounded-full blur-[128px] animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FF8A93]/15 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          />
        </div>
      </div>

      {/* Floating Icons */}
      <div ref={iconsRef} className="absolute inset-0 pointer-events-none">
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <div
            key={index}
            className="floating-icon absolute icon-gradient"
            style={{
              left: x,
              top: y,
              animationDelay: `${delay}s`,
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="text-center lg:text-left">
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-white leading-tight mb-6"
              style={{ perspective: '1000px' }}
            >
              <span className="word inline-block">Stream</span>{' '}
              <span className="word inline-block">Music.</span>{' '}
              <span className="word inline-block gradient-text">Earn</span>{' '}
              <span className="word inline-block gradient-text">Rewards.</span>
            </h1>

            <p
              ref={subheadlineRef}
              className="text-xl sm:text-2xl text-white/80 mb-6 font-['Fraunces']"
            >
              Every beat pays you back.
            </p>

            <p
              ref={descriptionRef}
              className="text-base sm:text-lg text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Discover royalty-free tracks, enjoy seamless streaming, and collect
              coins redeemable for real-world rewards. Your soundtrack, your
              earnings.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button className="btn-primary text-base px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Start Earning Now
                </Button>
              </Link>
              <Link to="/library">
                <Button className="btn-secondary text-base px-8 py-6">
                  Explore the Library
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div
            ref={imageRef}
            className="relative hidden lg:block"
            style={{ perspective: '1000px' }}
          >
            <div className="relative group">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A65]/30 to-[#FF8A93]/30 rounded-3xl blur-3xl transform scale-95 group-hover:scale-105 transition-transform duration-700" />

              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop"
                  alt="Person enjoying music with headphones"
                  className="w-full h-auto object-cover"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/60 via-transparent to-transparent" />

                {/* Circular progress indicator */}
                <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="#FF5A65"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="276"
                        strokeDashoffset="69"
                        className="animate-pulse"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Headphones className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stats overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="glass-card px-4 py-3">
                    <p className="text-xs text-white/60 mb-1">Coins Earned</p>
                    <p className="text-2xl font-bold gradient-text">2,847</p>
                  </div>
                  <div className="glass-card px-4 py-3">
                    <p className="text-xs text-white/60 mb-1">Tracks Played</p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
    </section>
  );
}
