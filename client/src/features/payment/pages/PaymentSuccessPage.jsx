import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get("tran_id");

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">Payment Successful</h1>
        <p className="text-sm text-stone-500 mb-1">Your booking has been confirmed.</p>
        {tranId && (
          <p className="text-xs text-stone-400 font-mono mt-2">Ref: {tranId}</p>
        )}
        <div className="mt-8">
          <Button onClick={() => navigate("/dashboard/bookings")}>
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}