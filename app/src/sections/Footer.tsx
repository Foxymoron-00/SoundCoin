import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Headphones, Twitter, Instagram, MessageCircle, Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: [
    { label: 'Features', path: '/features' },
    { label: 'Library', path: '/library' },
    { label: 'Rewards', path: '/rewards' },
    { label: 'Premium', path: '/premium' },
  ],
  company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Press', path: '/press' },
  ],
  support: [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact', path: '/contact' },
    { label: 'Terms', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
  ],
};

const socialLinks = [
  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: MessageCircle, href: 'https://discord.com', label: 'Discord' },
  { Icon: Github, href: 'https://github.com', label: 'GitHub' },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const triggers: ScrollTrigger[] = [];

      // Top line draw
      triggers.push(
        ScrollTrigger.create({
          trigger: footerRef.current,
          start: 'top 90%',
          onEnter: () => {
            gsap.fromTo(
              lineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'expo.out' }
            );
          },
          once: true,
        })
      );

      // Content fade in
      const elements = contentRef.current?.querySelectorAll('.footer-item');
      if (elements) {
        triggers.push(
          ScrollTrigger.create({
            trigger: contentRef.current,
            start: 'top 90%',
            onEnter: () => {
              gsap.fromTo(
                elements,
                { y: 20, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.5,
                  stagger: 0.05,
                  ease: 'power2.out',
                  delay: 0.2,
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
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-black pt-20 pb-8">
      {/* Top gradient line */}
      <div
        ref={lineRef}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF5A65] to-transparent origin-left"
      />

      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="footer-item flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white font-['Fraunces']">
                SoundCoin
              </span>
            </Link>
            <p className="footer-item text-white/50 text-sm max-w-xs leading-relaxed">
              Stream music. Earn rewards. Repeat. The world's first music platform that pays you to listen.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="footer-item text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="footer-item text-white/50 text-sm hover:text-white transition-colors duration-300 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="footer-item text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="footer-item text-white/50 text-sm hover:text-white transition-colors duration-300 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="footer-item text-sm font-medium text-white mb-4 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="footer-item text-white/50 text-sm hover:text-white transition-colors duration-300 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-item pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-item w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-[#FF5A65] hover:text-white hover:scale-110 hover:rotate-12 transition-all duration-300"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="footer-item text-white/40 text-sm">
            © {new Date().getFullYear()} SoundCoin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
