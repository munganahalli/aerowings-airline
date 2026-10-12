import React, { useState, useEffect, useRef } from 'react';
import { Plane, Globe, Compass, CloudSun, Sparkles, Radio, Zap, Play, Pause, RotateCcw } from 'lucide-react';

interface CorridorRoute {
  id: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  country: string;
  flightNumber: string;
  aircraft: string;
  duration: string;
  fareINR: number;
  altitudeFt: number;
  speedKmh: number;
  weather: 'Clear VFR' | 'Jetstream Tailwind' | 'Tropical Breeze' | 'Storm Alert';
  // Projected 2D coordinates on the 3D globe canvas (normalized -1 to 1)
  origX: number;
  origY: number;
  destX: number;
  destY: number;
}

const LIVE_4D_CORRIDORS: CorridorRoute[] = [
  {
    id: 'c-del-lhr',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'LHR',
    destCity: 'London Heathrow',
    country: 'United Kingdom',
    flightNumber: 'AW-901',
    aircraft: 'Airbus A350-900',
    duration: '8h 50m',
    fareINR: 42500,
    altitudeFt: 38000,
    speedKmh: 912,
    weather: 'Clear VFR',
    origX: 0.22,
    origY: -0.12,
    destX: -0.35,
    destY: -0.45
  },
  {
    id: 'c-bom-dxb',
    originCode: 'BOM',
    originCity: 'Mumbai',
    destCode: 'DXB',
    destCity: 'Dubai',
    country: 'UAE',
    flightNumber: 'AW-702',
    aircraft: 'Boeing 787-9 Dreamliner',
    duration: '3h 10m',
    fareINR: 13900,
    altitudeFt: 35000,
    speedKmh: 875,
    weather: 'Clear VFR',
    origX: 0.18,
    origY: 0.04,
    destX: -0.02,
    destY: -0.08
  },
  {
    id: 'c-blr-sin',
    originCode: 'BLR',
    originCity: 'Bengaluru',
    destCode: 'SIN',
    destCity: 'Singapore',
    country: 'Singapore',
    flightNumber: 'AW-814',
    aircraft: 'Airbus A350-900',
    duration: '4h 20m',
    fareINR: 15200,
    altitudeFt: 37000,
    speedKmh: 890,
    weather: 'Tropical Breeze',
    origX: 0.23,
    origY: 0.16,
    destX: 0.52,
    destY: 0.32
  },
  {
    id: 'c-del-jfk',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'JFK',
    destCity: 'New York JFK',
    country: 'United States',
    flightNumber: 'AW-101',
    aircraft: 'Boeing 777-300ER',
    duration: '14h 45m',
    fareINR: 68900,
    altitudeFt: 39000,
    speedKmh: 935,
    weather: 'Jetstream Tailwind',
    origX: 0.22,
    origY: -0.12,
    destX: -0.72,
    destY: -0.32
  },
  {
    id: 'c-maa-hnd',
    originCode: 'MAA',
    originCity: 'Chennai',
    destCode: 'HND',
    destCity: 'Tokyo Haneda',
    country: 'Japan',
    flightNumber: 'AW-880',
    aircraft: 'Boeing 787-9 Dreamliner',
    duration: '7h 35m',
    fareINR: 46800,
    altitudeFt: 38000,
    speedKmh: 905,
    weather: 'Clear VFR',
    origX: 0.26,
    origY: 0.17,
    destX: 0.78,
    destY: -0.22
  },
  {
    id: 'c-hyd-doh',
    originCode: 'HYD',
    originCity: 'Hyderabad',
    destCode: 'DOH',
    destCity: 'Doha',
    country: 'Qatar',
    flightNumber: 'AW-755',
    aircraft: 'Airbus A321neo XLR',
    duration: '4h 05m',
    fareINR: 16400,
    altitudeFt: 36000,
    speedKmh: 860,
    weather: 'Clear VFR',
    origX: 0.23,
    origY: 0.08,
    destX: -0.06,
    destY: -0.09
  },
  {
    id: 'c-bom-cdg',
    originCode: 'BOM',
    originCity: 'Mumbai',
    destCode: 'CDG',
    destCity: 'Paris CDG',
    country: 'France',
    flightNumber: 'AW-918',
    aircraft: 'Airbus A350-900',
    duration: '9h 15m',
    fareINR: 44900,
    altitudeFt: 38000,
    speedKmh: 902,
    weather: 'Clear VFR',
    origX: 0.18,
    origY: 0.04,
    destX: -0.31,
    destY: -0.38
  },
  {
    id: 'c-del-syd',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'SYD',
    destCity: 'Sydney',
    country: 'Australia',
    flightNumber: 'AW-960',
    aircraft: 'Boeing 787-9 Dreamliner',
    duration: '12h 20m',
    fareINR: 58500,
    altitudeFt: 39000,
    speedKmh: 920,
    weather: 'Jetstream Tailwind',
    origX: 0.22,
    origY: -0.12,
    destX: 0.76,
    destY: 0.65
  }
];

interface Spatial4DFlightGlobeProps {
  onSelectRoute?: (originCode: string, destCode: string) => void;
  onTrackFlight?: (flightNumber: string) => void;
}

export const Spatial4DFlightGlobe: React.FC<Spatial4DFlightGlobeProps> = ({
  onSelectRoute,
  onTrackFlight
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorRoute>(LIVE_4D_CORRIDORS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeDimensionHour, setTimeDimensionHour] = useState<number>(14); // 4D Time Slider (0 - 23h UTC)
  const [weatherLayerActive, setWeatherLayerActive] = useState<boolean>(true);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const rotRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        rotRef.current += 0.0045;
      }
      const t = rotRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.41;

      ctx.clearRect(0, 0, w, h);

      // 4D Time-of-Day Ambient Halo
      const isNight = timeDimensionHour < 6 || timeDimensionHour >= 19;
      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.32);
      if (isNight) {
        haloGrad.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
        haloGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.16)');
        haloGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      } else {
        haloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.20)');
        haloGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.16)');
        haloGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      }
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, w, h);

      // 3D Sphere Body
      const sphereGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      sphereGrad.addColorStop(0, '#0f2942');
      sphereGrad.addColorStop(0.55, '#071526');
      sphereGrad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.stroke();

      // 3D Latitude & Longitude Wireframe Grid
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.13)';
      ctx.lineWidth = 1;

      // Latitude rings
      for (let lat = -60; lat <= 60; lat += 30) {
        const yOff = (lat / 90) * radius;
        const rLat = Math.sqrt(Math.max(0, radius * radius - yOff * yOff));
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, rLat, rLat * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Longitude meridians
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 8 + (t % (Math.PI / 4));
        const rx = Math.abs(Math.sin(angle)) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(2, rx), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4D Atmospheric Doppler Weather Cells
      if (weatherLayerActive) {
        const stormX = cx + Math.sin(t * 0.7) * radius * 0.35;
        const stormY = cy + Math.cos(t * 0.5) * radius * 0.22;
        const weatherGrad = ctx.createRadialGradient(stormX, stormY, 4, stormX, stormY, 55);
        weatherGrad.addColorStop(0, 'rgba(16, 185, 129, 0.26)');
        weatherGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
        weatherGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = weatherGrad;
        ctx.beginPath();
        ctx.arc(stormX, stormY, 55, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw 3D Flight Arcs & Moving Aircraft
      LIVE_4D_CORRIDORS.forEach((route, idx) => {
        const isSel = route.id === selectedCorridor.id;
        const x1 = cx + route.origX * radius * 0.85;
        const y1 = cy + route.origY * radius * 0.85;
        const x2 = cx + route.destX * radius * 0.85;
        const y2 = cy + route.destY * radius * 0.85;

        // Elevated 3D control point for arc altitude
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - (isSel ? 58 : 38);

        // Flight Arc
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.strokeStyle = isSel ? '#fbbf24' : 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = isSel ? 2.6 : 1.3;
        ctx.stroke();

        // Origin Hub Pulse (India)
        ctx.beginPath();
        ctx.arc(x1, y1, isSel ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();

        // Destination Hub Pulse
        ctx.beginPath();
        ctx.arc(x2, y2, isSel ? 5 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? '#fbbf24' : '#38bdf8';
        ctx.fill();

        // Animated 4D Aircraft position along quadratic Bezier
        const progress = ((t * 0.9 + idx * 0.17) % 1 + 1) % 1;
        const inv = 1 - progress;
        const px = inv * inv * x1 + 2 * inv * progress * midX + progress * progress * x2;
        const py = inv * inv * y1 + 2 * inv * progress * midY + progress * progress * y2;

        ctx.beginPath();
        ctx.arc(px, py, isSel ? 4.5 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? '#fde047' : '#ffffff';
        ctx.fill();

        if (isSel) {
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#fde047';
          ctx.fillText(`${route.flightNumber} (${route.originCode}→${route.destCode})`, px + 7, py - 6);
        }
      });

      ctx.restore();

      // Outer Orbital Telemetry Ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.12, radius * 0.32, -0.22, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, selectedCorridor, timeDimensionHour, weatherLayerActive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ rx: ny, ry: nx });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `perspective(1400px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-blue-950/80 border border-amber-500/35 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/25 relative overflow-hidden"
    >
      {/* Top 4D Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>4D Spatial Flight Globe • India to Global Corridors</span>
          </div>
          <h2 className="font-prestige text-2xl sm:text-3xl font-bold text-white mt-1">
            Interactive 3D/4D Live International & Domestic Flight Sphere
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect live aircraft trajectories, 4D time-of-day jetstreams, and book any route from India instantaneously.
          </p>
        </div>

        {/* 4D Dimension Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 text-[11px]">4D Time (UTC):</span>
            <input
              type="range"
              min={0}
              max={23}
              value={timeDimensionHour}
              onChange={(e) => setTimeDimensionHour(Number(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer"
            />
            <span className="font-mono font-bold text-amber-300 w-12">
              {String(timeDimensionHour).padStart(2, '0')}:00
            </span>
          </div>

          <button
            type="button"
            onClick={() => setWeatherLayerActive(!weatherLayerActive)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              weatherLayerActive
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>Doppler 4D Layer</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 cursor-pointer"
            title={isPlaying ? 'Pause 3D Rotation' : 'Resume 3D Rotation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3D Globe + Corridor Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left: 3D Holographic Canvas */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3">
          <canvas
            ref={canvasRef}
            width={420}
            height={340}
            className="w-full max-w-[420px] h-auto"
          />
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-3 pt-2 border-t border-slate-900">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ADS-B 4D Spatial Telemetry Active</span>
            </span>
            <span className="font-mono text-amber-300">
              Alt: {selectedCorridor.altitudeFt.toLocaleString()} ft · {selectedCorridor.speedKmh} km/h
            </span>
          </div>
        </div>

        {/* Right: Interactive India-to-World Live Corridors */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {LIVE_4D_CORRIDORS.map((corridor) => {
              const isSelected = corridor.id === selectedCorridor.id;
              return (
                <button
                  key={corridor.id}
                  type="button"
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-amber-300">
                      {corridor.originCode} ➔ {corridor.destCode}
                    </span>
                    <span className="font-mono text-[10px] text-sky-400">{corridor.flightNumber}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {corridor.originCity} to {corridor.destCity}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>{corridor.duration}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{corridor.fareINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected 4D Corridor Command Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedCorridor.flightNumber} • {selectedCorridor.aircraft}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  · {selectedCorridor.weather}
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {selectedCorridor.originCity} ({selectedCorridor.originCode}) ➔ {selectedCorridor.destCity} ({selectedCorridor.destCode}, {selectedCorridor.country})
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Direct Non-Stop • {selectedCorridor.duration} • Starting ₹{selectedCorridor.fareINR.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onTrackFlight && (
                <button
                  type="button"
                  onClick={() => onTrackFlight(selectedCorridor.flightNumber)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-xs font-bold cursor-pointer"
                >
                  Live Radar
                </button>
              )}
              {onSelectRoute && (
                <button
                  type="button"
                  onClick={() => onSelectRoute(selectedCorridor.originCode, selectedCorridor.destCode)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Book 4D Route</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
