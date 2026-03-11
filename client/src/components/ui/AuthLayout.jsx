import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Shared layout for all auth pages.
// Left: branding panel (hidden on mobile). Right: form content.
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* ── Branding panel — visible on lg+ ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2 group">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-stone-900" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            EkSathe
          </span>
        </Link>

        {/* Tagline block */}
        <div className="relative">
          <p className="text-stone-400 text-sm uppercase tracking-[0.2em] font-medium mb-4">
            Smart Campus Mobility
          </p>
          <h2 className="text-white text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            Move smarter.
            <br />
            Park better.
            <br />
            <span className="text-teal-400">Together.</span>
          </h2>
          <p className="mt-6 text-stone-400 text-sm leading-relaxed max-w-[280px]">
            EkSathe connects students and homeowners to solve campus parking and
            carpooling — safely and simply.
          </p>
        </div>

        {/* Footer note */}
        <p className="relative text-stone-600 text-xs">
          © {new Date().getFullYear()} EkSathe. All rights reserved.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10">
        {/* Mobile logo */}
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 mb-10 self-start"
        >
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-stone-900 font-bold text-base tracking-tight">
            EkSathe
          </span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Page title */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-stone-500 text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
