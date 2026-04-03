import React, { useState, useEffect } from 'react';
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaTelegram } from "react-icons/fa6";
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

type SocialIcon = {
  name: string;
  icon: ReactNode;
  hoverColor: string;
  url: string;
};

interface NavItem {
  name: string;
  path: string;
}

interface FooterProps {
  // You can add props if needed, like custom nav items
  customNavItems?: NavItem[];
  customFooterLinks?: Array<{ name: string; path: string }>;
  customSocialIcons?: SocialIcon[];
}

const Footer: React.FC<FooterProps> = ({ 
  customNavItems,
  customFooterLinks,
  customSocialIcons 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default navigation items with paths
  const defaultNavItems: NavItem[] = [
    { name: "Events", path: "/events" },
    { name: "About Us", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Process", path: "/" },
    { name: "FAQs", path: "/#faqs" },
    { name: "Editor", path: "/blog/editor" },
  ];

  // Default footer links with paths
  const defaultFooterLinks: Array<{ name: string; path: string }> = [
    { name: "Privacy Policy", path: "/#" },
    { name: "Terms of Service", path: "#" },
    { name: "License", path: "#" },
    { name: "Contact", path: "/start-scaling" }
  ];

  // Default social icons with URLs
  const defaultSocialIcons: SocialIcon[] = [
  { 
    name: "X",
    icon: <FaXTwitter size={18} />,
    hoverColor: "group-hover:bg-black",
    url: "https://x.com/avalok2023"
  },
  { 
    name: "LinkedIn",
    icon: <FaLinkedinIn size={18} />,
    hoverColor: "group-hover:bg-[#0077b5]",
    url: "https://www.linkedin.com/in/avalok"
  },
  { 
    name: "Instagram",
    icon: <FaInstagram size={18} />,
    hoverColor: "group-hover:bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
    url: "https://www.instagram.com/0xavalok"
  },
  {
  name: "Telegram",
  icon: <FaTelegram size={18} />,
  hoverColor: "group-hover:bg-[#0088cc]",
  url: "https://t.me/avalok2024"
}, 
{
  name: "P2P.me",
  icon: (
    <img
      src="/p2p.ico"
      alt="icon"
      className="w-[18px] h-[18px] opacity-70 brightness-5 invert-0 group-hover:invert"
    />
  ),
  hoverColor: "group-hover:bg-primary",
  url: "https://app.p2p.lol/campaign?id=5&manage=lok"
}

];

  // Use custom items if provided, otherwise use defaults
  const navItems = customNavItems || defaultNavItems;
  const footerLinks = customFooterLinks || defaultFooterLinks;
  const socialIcons = customSocialIcons || defaultSocialIcons;

  const getNavbarOffset = () => {
    const nav = document.querySelector("nav");
    const navHeight = nav instanceof HTMLElement ? nav.offsetHeight : 0;
    return navHeight + 12;
  };

  const scrollToHashWithOffset = (hash: string) => {
    const id = hash.replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleInternalNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!path || path.startsWith("http")) return;
    e.preventDefault();

    const [rawPathname, rawHash] = path.split("#");
    const pathname = rawPathname || location.pathname;
    const hash = rawHash ? `#${rawHash}` : "";

    const performScroll = () => {
      if (hash) {
        scrollToHashWithOffset(hash);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    if (pathname !== location.pathname) {
      navigate(pathname);
      setTimeout(performScroll, 120);
      return;
    }

    performScroll();
  };

  return (
    <footer id="footer" className="relative border-t border-border/50 bg-gradient-to-b from-background to-background/95 px-4 sm:px-6 py-8 sm:py-10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl animate-pulse-slower" />
        {mounted && [...Array(3)].map((_, i) => {
          const randomTop = Math.random() * 100;
          const randomLeft = Math.random() * 100;
          return (
            <div
              key={i}
              className="absolute h-32 w-32 rounded-full bg-primary/10 blur-2xl"
              style={{
                top: `${randomTop}%`,
                left: `${randomLeft}%`,
                animation: `float-${i + 1} ${15 + i * 5}s infinite ease-in-out`,
              }}
            />
          );
        })}
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Mobile Navigation - Visible on mobile with animation */}
        <div className="mb-8 md:hidden">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary/10 to-primary/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                style={{
                  animation: mounted ? `fadeInUp 0.5s ease-out ${index * 0.1}s forwards` : 'none',
                  opacity: mounted ? 0 : 1,
                }}
                onClick={(e) => handleInternalNav(e, item.path)}
                onMouseEnter={() => setHoveredLink(item.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span className="relative z-10 bg-gradient-to-r from-foreground to-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary">
                  {item.name}
                </span>
                <span className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-primary/20 to-primary/30 transition-transform duration-300 group-hover:translate-y-0" />
                {hoveredLink === item.name && (
                  <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 animate-ping" />
                )}
              </Link>
            ))}
          </div>
          
          {/* Animated decorative line */}
          <div className="relative mt-6 h-px w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-slide" />
          </div>
        </div>

        {/* Main footer content */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand section with hover animation */}
          <div className="group relative text-center md:text-left">
            <Link to="/" className="relative inline-block">
              <span className="text-lg font-bold text-foreground transition-all duration-300 group-hover:tracking-wider">
                Av Alok
              </span>
              <span className="absolute -right-6 -top-1 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                ✦
              </span>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground transition-all duration-300 group-hover:text-foreground">
              © 2025 avalok - All rights reserved.
            </p>
            {/* Animated underline */}
            <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
          </div>

          {/* Footer links with staggered hover effect */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {footerLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.path}
                className="group relative text-xs text-muted-foreground transition-all duration-300 hover:text-foreground"
                style={{
                  animation: mounted ? `fadeIn 0.5s ease-out ${index * 0.1 + 0.5}s forwards` : 'none',
                  opacity: mounted ? 0 : 1,
                }}
                onClick={(e) => handleInternalNav(e, link.path)}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Social icons with unique hover effects */}
          <div className="flex items-center gap-3 sm:gap-4">
            {socialIcons.map((icon, index) => (
              <a
                key={icon.name}
                href={icon.url}
                target="_blank" rel="noopener noreferrer" className="group relative" >
                <span className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-transparent hover:text-white ${icon.hoverColor} group-hover:shadow-lg`}>
                  {icon.icon}
                </span>
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                  {icon.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile, visible on desktop with animation */}
        <div className="mt-8 hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground">
                Navigate
              </span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center gap-6">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className="group relative overflow-hidden text-sm font-medium"
                style={{
                  animation: mounted ? `fadeInUp 0.5s ease-out ${index * 0.1}s forwards` : 'none',
                  opacity: mounted ? 0 : 1,
                }}
                onClick={(e) => handleInternalNav(e, item.path)}
                onMouseEnter={() => setHoveredLink(item.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span className="relative z-10 block px-2 py-1 text-muted-foreground transition-all duration-300 group-hover:text-primary">
                  {item.name}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary/50 transition-transform duration-300 group-hover:scale-x-100" />
                {hoveredLink === item.name && (
                  <span className="absolute inset-0 -z-10 animate-pulse-slow bg-primary/5" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, -20px) rotate(-120deg); }
          66% { transform: translate(20px, 40px) rotate(-240deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, 40px) rotate(180deg); }
          66% { transform: translate(-30px, -10px) rotate(360deg); }
        }
        
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-slide {
          animation: slide 3s infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;