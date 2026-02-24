"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import BrandIcon from "./BrandIcon";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

function UserAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt={name || "User avatar"}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full ring-2 ring-white/10 hover:ring-cyan-500/50 transition-all duration-200"
        referrerPolicy="no-referrer"
      />
    );
  }

  const initial = name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 hover:ring-cyan-500/50 transition-all duration-200">
      {initial}
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.08]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group" aria-label="GeoWatch home">
            <BrandIcon size={30} />
            <span className="font-bold text-lg tracking-tight text-white">
              GeoWatch
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/65 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-emerald-500/20"
                >
                  Dashboard
                </a>

                {/* Avatar + Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="cursor-pointer"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    <UserAvatar src={session?.user?.image} name={session?.user?.name} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-700/60 shadow-2xl shadow-black/40 overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-zinc-700/40">
                          <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || "User"}
                          </p>
                          <p className="text-xs text-white/40 truncate">
                            {session?.user?.email}
                          </p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <a
                            href="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-white/40" />
                            Dashboard
                          </a>
                          <button
                            onClick={() => { setDropdownOpen(false); signOut(); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-white/40" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/signin"
                  className="text-sm px-4 py-2 text-white/65 hover:text-white transition-colors duration-200"
                >
                  Sign in
                </a>
                <a
                  href="/signin"
                  className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-all duration-200 shadow-lg shadow-emerald-500/20"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && (
              <UserAvatar src={session?.user?.image} name={session?.user?.name} />
            )}
            <button
              className="p-2 text-white/65 hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#050508]/95 backdrop-blur-xl border-b border-white/[0.08]"
          >
            <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-white/70 hover:text-white py-2.5 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/[0.08] space-y-2 mt-2">
                {isLoggedIn ? (
                  <>
                    {/* User info row */}
                    <div className="flex items-center gap-3 px-1 py-2">
                      <UserAvatar src={session?.user?.image} name={session?.user?.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                        <p className="text-xs text-white/40 truncate">{session?.user?.email}</p>
                      </div>
                    </div>
                    <a
                      href="/dashboard"
                      className="block text-center py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="block w-full text-center py-2.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/70 font-medium text-sm hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/signin"
                      className="block text-center py-2.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign in
                    </a>
                    <a
                      href="/signin"
                      className="block text-center py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      Get Started
                    </a>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
