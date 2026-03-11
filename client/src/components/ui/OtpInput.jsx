import { useRef, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

// Six individual character boxes for OTP entry.
// Auto-advances focus on input, handles paste, backspace navigation.
// onChange(value) receives the full 6-char string as it builds.
const OtpInput = ({ value = "", onChange, disabled, error }) => {
  const inputRefs = useRef([]);
  const [focused, setFocused] = useState(null);

  // Build array of 6 characters from controlled value string
  const chars = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = useCallback(
    (index, e) => {
      const input = e.target.value.replace(/\D/g, ""); // digits only
      if (!input) return;

      const char = input[input.length - 1]; // take last digit if multiple pasted into one box
      const newChars = [...chars];
      newChars[index] = char;
      onChange(newChars.join(""));

      // Advance focus
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [chars, onChange],
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace") {
        if (chars[index]) {
          // Clear current box
          const newChars = [...chars];
          newChars[index] = "";
          onChange(newChars.join(""));
        } else if (index > 0) {
          // Move back and clear
          inputRefs.current[index - 1]?.focus();
          const newChars = [...chars];
          newChars[index - 1] = "";
          onChange(newChars.join(""));
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [chars, onChange],
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (!pasted) return;
      const newChars = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
      onChange(newChars.join(""));
      // Focus last filled box or box after last fill
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 sm:gap-3">
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            className={cn(
              "w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-lg border",
              "bg-white text-stone-900 transition-all duration-150",
              "focus:outline-none caret-transparent",
              error
                ? "border-red-400 bg-red-50"
                : focused === index
                  ? "border-teal-600 ring-2 ring-teal-600/20 bg-teal-50/30"
                  : char
                    ? "border-stone-400 bg-white"
                    : "border-stone-200",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default OtpInput;
