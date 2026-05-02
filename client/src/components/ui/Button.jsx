import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-stone-900 text-white hover:bg-stone-800 focus:ring-stone-900/20 disabled:bg-stone-300",
  outline:
    "bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 focus:ring-stone-900/10",
  ghost:
    "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-900/10",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "w-full flex items-center justify-center gap-2",
        "px-4 py-2.5 rounded-lg text-sm font-semibold",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
};

export default Button;
