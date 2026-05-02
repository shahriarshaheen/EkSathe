import { forwardRef } from "react";
import { cn } from "../../lib/utils";

// Reusable form field: label + input + error message.
// Accepts all standard input props via forwardRef.
const FormField = forwardRef(
  ({ label, error, id, className, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-stone-700 select-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-stone-900",
            "placeholder:text-stone-400",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
            error
              ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
              : "border-stone-200 hover:border-stone-300",
            props.disabled && "opacity-50 cursor-not-allowed bg-stone-50",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
export default FormField;
