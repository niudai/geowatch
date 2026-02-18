import { Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Eye className="w-3.5 h-3.5 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <span className="font-bold text-white">GeoWatch</span>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#features" className="hover:text-white/80 transition-colors duration-200">Features</a>
              <a href="#pricing" className="hover:text-white/80 transition-colors duration-200">Pricing</a>
              <a href="mailto:hello@geowatch.ai" className="hover:text-white/80 transition-colors duration-200">Contact</a>
              <a href="/privacy" className="hover:text-white/80 transition-colors duration-200">Privacy</a>
            </div>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} GeoWatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
