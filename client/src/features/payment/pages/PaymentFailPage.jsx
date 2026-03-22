import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type");
  const isCarpool = type === "carpool";

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">
          Payment Failed
        </h1>
        <p className="text-sm text-stone-500 mb-1">
          Something went wrong with your payment.
        </p>
        <p className="text-xs text-stone-400">
          {isCarpool
            ? "Your seat is still reserved. You can retry payment from My Rides."
            : "Your booking has been cancelled. Please try again."}
        </p>
        <div className="mt-8 space-y-3">
          {/* FIX: was navigating to /dashboard/book-spot which doesn't exist */}
          <Button
            onClick={() =>
              navigate(
                isCarpool
                  ? "/dashboard/carpool/my-rides"
                  : "/dashboard/parking",
              )
            }
          >
            {isCarpool ? "View My Rides" : "Find Parking"}
          </Button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors py-1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
