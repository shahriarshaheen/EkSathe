import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { getRewardQuote } from "../services/rewardService";

const CoinDiscountPanel = ({
  amount,
  selectedTierId,
  onSelectTier,
  disabled = false,
}) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchQuote = async () => {
      if (!amount || amount <= 0) {
        setQuote(null);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await getRewardQuote({
          serviceType: "carpool",
          amount,
        });

        if (!ignore) {
          setQuote(res.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Could not load coin discounts");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      ignore = true;
    };
  }, [amount]);

  if (!amount || amount <= 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <Coins className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-900">
            Use Ride Coins
          </h3>
          <p className="text-xs text-stone-500">
            Redeem coins for a carpool discount
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading coin discounts...
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-rose-600">{error}</p>
      )}

      {!loading && quote && (
        <>
          <div className="mb-3 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-700">
            Your balance:{" "}
            <span className="font-semibold text-stone-900">
              {quote.coinBalance || 0} coins
            </span>
          </div>

          <div className="space-y-2">
            {quote.tiers?.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const isDisabled = disabled || !tier.canRedeem;

              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectTier(isSelected ? null : tier)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50"
                      : "border-stone-200 bg-white hover:border-teal-300"
                  } ${
                    isDisabled
                      ? "cursor-not-allowed opacity-60 hover:border-stone-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {tier.coinsRequired} coins
                      </p>
                      <p className="text-xs text-stone-500">
                        {tier.canRedeem
                          ? `Save ৳${tier.discountAmount}`
                          : tier.reason}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-teal-700">
                        -৳{tier.discountAmount}
                      </p>
                      <p className="text-xs text-stone-500">
                        Pay ৳{tier.finalAmount}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CoinDiscountPanel;