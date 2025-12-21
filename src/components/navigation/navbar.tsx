"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";
import { cn } from "@/utils/utils";

const navLinks = [
  { name: "Services", href: "#services" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dashed border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 w-full items-center">
        {/* Left Wing - Visible on large screens */}
        <div className="hidden 2xl:flex flex-1 items-center justify-center px-4">
          <Logo />
        </div>

        {/* Central Container - Matches Landing Page Width */}
        <div className="mx-auto flex h-full w-[calc(100%-2rem)] max-w-7xl shrink-0 items-center justify-between border-x border-dashed border-border/40 px-4 2xl:justify-center 2xl:px-0">
          
          {/* Mobile/Tablet/Laptop: Logo on Left inside container */}
          <div className="flex items-center 2xl:hidden">
            <Logo />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex h-full items-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex h-full items-center justify-center px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-primary hover:bg-muted/50",
                  "border-l border-dashed border-border/40", // Separator between links
                  index === navLinks.length - 1 && "border-r" // Closing border
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile/Tablet/Laptop: Auth on Right inside container */}
          <div className="flex items-center gap-4 2xl:hidden">
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Sign up
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Right Wing - Visible on large screens */}
        <div className="hidden 2xl:flex flex-1 items-center justify-center gap-4 px-4">
          <div className="flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Sign up
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
