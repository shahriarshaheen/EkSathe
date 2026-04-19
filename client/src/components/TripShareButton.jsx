import { useState, useEffect, useRef } from 'react';
import { MapPin, Share2, X, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export default function TripShareButton({ rideId }) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const getLocation = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error('Location access denied'))
      )
    );

  const startSharing = async () => {
    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const res = await api.post('/tripshare', { lat, lng, carpoolRouteId: rideId });
      const { token: newToken, shareUrl: url } = res.data.data;

      setToken(newToken);
      setShareUrl(url);
      setSharing(true);

      // Push location every 30 seconds
      intervalRef.current = setInterval(async () => {
        try {
          const loc = await getLocation();
          await api.patch(`/tripshare/${newToken}`, loc);
        } catch {
          // Silent — don't spam toasts on every failed update
        }
      }, 30_000);

      toast.success('Location sharing started');
    } catch (err) {
      toast.error(err.message || 'Could not start sharing');
    } finally {
      setLoading(false);
    }
  };

  const stopSharing = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      if (token) await api.delete(`/tripshare/${token}`);
    } catch {
      // best-effort
    }
    setSharing(false);
    setShareUrl(null);
    setToken(null);
    toast('Location sharing stopped');
  };

  // Clean up on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sharing) {
    return (
      <button
        onClick={startSharing}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors disabled:opacity-50"
      >
        <Share2 size={13} />
        {loading ? 'Starting…' : 'Share Location'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Share URL pill */}
      <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
        <MapPin size={13} className="text-teal-600 shrink-0 animate-pulse" />
        <span className="text-xs text-teal-700 font-medium truncate max-w-[160px]">{shareUrl}</span>
        <button onClick={copyLink} className="ml-1 text-teal-600 hover:text-teal-800 transition-colors">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {/* Stop button */}
      <button
        onClick={stopSharing}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <X size={13} />
        Stop
      </button>
    </div>
  );
}