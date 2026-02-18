import { Eye } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white">GeoWatch</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#features" className="hover:text-white/60 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white/60 transition-colors">Pricing</a>
            <a href="mailto:hello@geowatch.ai" className="hover:text-white/60 transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} GeoWatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
