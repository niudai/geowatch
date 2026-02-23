import BrandIcon from "./BrandIcon";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <BrandIcon size={26} />
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
