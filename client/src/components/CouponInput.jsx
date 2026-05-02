import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, Tag, X } from "lucide-react";
import api from "../lib/api";

const TAKA = "\u09F3";

const formatDiscount = (coupon) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}% off${coupon.maxDiscountAmount ? ` up to ${TAKA}${coupon.maxDiscountAmount}` : ""}`
    : `${TAKA}${coupon.discountValue} off`;

/**
 * CouponInput - reusable coupon panel for parking and carpool payments.
 *
 * Props:
 *   amount:      number - base price before discount
 *   serviceType: "parking" | "carpool"
 *   onApply:     fn({ couponCode, discountAmount, finalAmount })
 *   onRemove:    fn()
 */
export default function CouponInput({
  amount,
  serviceType,
  onApply,
  onRemove,
  showAvailable = true,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [applied, setApplied] = useState(null);

  useEffect(() => {
    if (!showAvailable || !amount || amount <= 0) {
      setAvailableCoupons([]);
      return;
    }

    let mounted = true;
    setAvailableLoading(true);
    api
      .get("/coupons/available", {
        params: { serviceType, amount },
      })
      .then((res) => {
        if (mounted) setAvailableCoupons(res.data.data || []);
      })
      .catch(() => {
        if (mounted) setAvailableCoupons([]);
      })
      .finally(() => {
        if (mounted) setAvailableLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [amount, serviceType, showAvailable]);

  const handleApply = async (selectedCode = input) => {
    const code = selectedCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Booking amount must be set before applying a coupon.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/coupons/validate", {
        couponCode: code,
        serviceType,
        amount,
      });
      const { discountAmount, finalAmount, message, coupon } = res.data;
      setApplied({ code, discountAmount, finalAmount, message, coupon });
      onApply?.({ couponCode: code, discountAmount, finalAmount });
      toast.success(message);
      setInput("");
    } catch (err) {
      toast.error(err?.message || "Invalid coupon code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setInput("");
    onRemove?.();
    toast.info("Coupon removed.");
  };

  if (applied) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-teal-700 tracking-widest font-mono">
                  {applied.code}
                </span>
                <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                  Applied
                </span>
              </div>
              <p className="text-xs text-teal-600 mt-0.5">
                {applied.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-teal-400 hover:text-teal-600 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Remove coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-teal-200 space-y-1.5">
          <div className="flex justify-between text-xs text-stone-500">
            <span>Subtotal</span>
            <span>
              {TAKA}
              {amount}
            </span>
          </div>
          <div className="flex justify-between text-xs text-teal-600 font-semibold">
            <span>Discount</span>
            <span>
              -{TAKA}
              {applied.discountAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-stone-900 pt-1 border-t border-teal-200">
            <span>You pay</span>
            <span className="text-teal-700">
              {TAKA}
              {applied.finalAmount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          Coupon Code
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter code e.g. WELCOME10"
            disabled={loading}
            className="flex-1 px-3 py-2.5 text-sm font-mono border border-stone-200 rounded-xl bg-white
              placeholder:text-stone-300 placeholder:font-sans text-stone-900 uppercase
              focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600
              hover:border-stone-300 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => handleApply()}
            disabled={loading || !input.trim()}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white
              text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        </div>
      </div>

      {showAvailable && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              Available coupons
            </p>
            {availableLoading && (
              <Loader2 className="w-3.5 h-3.5 text-stone-400 animate-spin" />
            )}
          </div>

          {!availableLoading && availableCoupons.length === 0 ? (
            <p className="text-xs text-stone-400">
              No active coupons for this payment.
            </p>
          ) : (
            <div className="space-y-2">
              {availableCoupons.map((coupon) => (
                <button
                  type="button"
                  key={coupon.code}
                  onClick={() => coupon.canApply && handleApply(coupon.code)}
                  disabled={!coupon.canApply || loading}
                  className={`w-full text-left rounded-xl border px-3 py-2 transition-all ${
                    coupon.canApply
                      ? "bg-white border-stone-200 hover:border-teal-300 hover:bg-teal-50"
                      : "bg-white/60 border-stone-100 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black font-mono text-stone-900 tracking-widest">
                        {coupon.code}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        {coupon.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded-full flex-shrink-0">
                      {formatDiscount(coupon)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-xs text-stone-400">
                      {coupon.canApply
                        ? `Saves ${TAKA}${coupon.discountAmount}`
                        : coupon.reason}
                    </p>
                    {coupon.canApply && (
                      <span className="text-xs font-bold text-teal-600">
                        Tap to apply
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
