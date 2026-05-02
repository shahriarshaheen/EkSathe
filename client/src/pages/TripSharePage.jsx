import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix Leaflet default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const dotIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    background:#0F6E56;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

function MapPanner({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function TripSharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);
  const intervalRef = useRef(null);
  const tickRef = useRef(null);

  const fetchShare = async () => {
    try {
      const res = await fetch(`${API_URL}/tripshare/${token}`);

      // Check if response is actually JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response');
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'This share is no longer active');
    }
  };

  useEffect(() => {
    fetchShare();
    intervalRef.current = setInterval(fetchShare, 30_000);
    tickRef.current = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(tickRef.current);
    };
  }, [token]);

  const position = data ? [data.lat, data.lng] : null;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0c1412' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: '#0c1412',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1000,
        flexShrink: 0,
      }}>
        {/* EkSathe wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
              <path d="M5 8h6M8 5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15, letterSpacing: '-0.3px' }}>
            EkSathe
          </span>
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

        {data ? (
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            Live location shared by{' '}
            <span style={{ color: '#5DCAA5', fontWeight: 600 }}>{data.userName}</span>
          </span>
        ) : error ? (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Share unavailable</span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading…</span>
        )}

        {/* Live indicator */}
        {data && !error && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#1D9E75',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ color: '#5DCAA5', fontSize: 12, fontWeight: 500 }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {error ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="9" r="2.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', maxWidth: 240 }}>
              {error}
            </p>
          </div>
        ) : !position ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2.5px solid rgba(29,158,117,0.3)',
              borderTopColor: '#1D9E75',
              animation: 'spin 0.9s linear infinite',
            }} />
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            <MapPanner position={position} />
            <Marker position={position} icon={dotIcon}>
              <Popup closeButton={false} offset={[0, -6]}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{data.userName}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Updated {timeAgo(data.lastUpdated)}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      {/* Bottom bar */}
      {data && (
        <div style={{
          padding: '8px 16px',
          background: '#0c1412',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            Last updated {timeAgo(data.lastUpdated)}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
            Powered by EkSathe
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}