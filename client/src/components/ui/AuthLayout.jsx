import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* ── Branding panel — visible on lg+ ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-shrink-0 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Teal glow top-right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0d9488 0%, transparent 70%)",
          }}
        />

        {/* Teal glow bottom-left */}
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #0d9488 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-stone-900" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            EkSathe
          </span>
        </Link>

        {/* Animation + tagline — center of panel */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-full max-w-sm">
            <DotLottieReact
              src="/carpool.lottie"
              loop
              autoplay
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Smart Campus Mobility
            </p>
            <h2 className="text-white text-2xl xl:text-3xl font-bold leading-tight tracking-tight">
              Move smarter
              <br />
              Park better
              <br />
              <span className="text-teal-400">Together</span>
            </h2>
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-stone-600 text-xs z-10">
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
