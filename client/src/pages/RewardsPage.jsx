import { useEffect, useState } from "react";
import { Coins, Gift, Loader2 } from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { getMyRewards } from "../services/rewardService";

export default function RewardsPage() {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRewards = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyRewards();
        setRewards(res.data);
      } catch (err) {
        setError(err.message || "Could not load rewards.");
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">
            Ride Rewards
          </p>
          <h1 className="text-2xl font-black text-stone-900 mt-1">
            My Coins
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Earn coins by checking in on time for carpool rides.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-center gap-2 text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading rewards...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-bold">
                    Current Balance
                  </p>
                  <p className="text-3xl font-black text-stone-900">
                    {rewards?.coinBalance || 0} coins
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-black text-stone-900">
                  Discount Tiers
                </h2>
              </div>

              <div className="space-y-2">
                {rewards?.tiers?.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        {tier.coinsRequired} coins
                      </p>
                      <p className="text-xs text-stone-500">
                        Redeem during online carpool payment
                      </p>
                    </div>
                    <p className="text-sm font-black text-teal-700">
                      ৳{tier.discountAmount} off
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-base font-black text-stone-900 mb-3">
                Recent Activity
              </h2>

              {rewards?.recentTransactions?.length ? (
                <div className="space-y-2">
                  {rewards.recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-bold text-stone-800 capitalize">
                          {tx.type}
                        </p>
                        <p className="text-xs text-stone-400">
                          {new Date(tx.createdAt).toLocaleString("en-BD")}
                        </p>
                      </div>
                      <p
                        className={`font-black ${
                          tx.coins > 0 ? "text-teal-700" : "text-red-500"
                        }`}
                      >
                        {tx.coins > 0 ? "+" : ""}
                        {tx.coins}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  No coin activity yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}