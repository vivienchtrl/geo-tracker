"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { LandingContainer } from "@/components/landing-page/container";

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Analytics", href: "#analytics" },
      { name: "AI Strategy", href: "#ai-strategy" },
      { name: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Community", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Partners", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-dashed border-border/40 bg-background">
      <div className="flex w-full">
        {/* Left Wing - Visible on large screens */}
        <div className="hidden 2xl:flex flex-1 border-r border-dashed border-border/40" />

        {/* Central Container */}
        <LandingContainer className="border-b-0 py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-y md:divide-y-0 lg:divide-x divide-dashed divide-border/40">
            {/* Logo and Tagline */}
            <div className="p-8 md:p-12 lg:col-span-1">
              <Logo />
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                Empowering brands with AI-driven traffic insights and indexability tracking.
              </p>
            </div>

            {/* Link Groups */}
            {footerLinks.map((group) => (
              <div key={group.title} className="p-8 md:p-12">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">
                  {group.title}
                </h3>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-dashed border-border/40 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-muted-foreground order-2 md:order-1">
                © {new Date().getFullYear()} GeoTracker. All rights reserved.
              </p>
              <div className="flex items-center gap-8 order-1 md:order-2">
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Twitter
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </LandingContainer>

        {/* Right Wing - Visible on large screens */}
        <div className="hidden 2xl:flex flex-1 border-l border-dashed border-border/40" />
      </div>
    </footer>
  );
}

