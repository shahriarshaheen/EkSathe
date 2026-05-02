import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get("tran_id");
  const type = searchParams.get("type"); // "parking" or "carpool"

  const isCarpool = type === "carpool";

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">
          Payment Successful
        </h1>
        <p className="text-sm text-stone-500 mb-1">
          {isCarpool
            ? "Your seat has been confirmed and paid."
            : "Your booking has been confirmed."}
        </p>
        {tranId && (
          <p className="text-xs text-stone-400 font-mono mt-2">Ref: {tranId}</p>
        )}
        <div className="mt-8 space-y-3">
          <Button
            onClick={() =>
              navigate(
                isCarpool
                  ? "/dashboard/carpool/my-rides"
                  : "/dashboard/bookings",
              )
            }
          >
            {isCarpool ? "View My Rides" : "View My Bookings"}
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
