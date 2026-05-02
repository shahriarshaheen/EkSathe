import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type");
  const isCarpool = type === "carpool";

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-sm text-stone-500">
          {isCarpool
            ? "You cancelled the payment. Your seat is still reserved — you can pay later from My Rides."
            : "You cancelled the payment. Your booking has been removed."}
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
