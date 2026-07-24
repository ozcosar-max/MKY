import React, { useEffect, useRef, useState } from 'react';
import { Visit } from '../types';
import { MapPin, Navigation, CalendarPlus, FileText, Clock, Phone, Mail, Home } from 'lucide-react';

// Dynamically load Leaflet assets to ensure clean installation without build complications
const loadLeaflet = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      resolve((window as any).L);
    };
    script.onerror = () => {
      reject(new Error('Leaflet script failed to load'));
    };
    document.body.appendChild(script);
  });
};

interface LeafletMapProps {
  visits: Visit[];
  onInitNewVisit?: (lat: number, lng: number) => void;
  // If in picker mode
  isPicker?: boolean;
  pickerLat?: number;
  pickerLng?: number;
  onPickerPositionChange?: (lat: number, lng: number) => void;
}

export function LeafletMap({
  visits,
  onInitNewVisit,
  isPicker = false,
  pickerLat = 41.0805,
  pickerLng = 29.0112,
  onPickerPositionChange
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    loadLeaflet()
      .then((L) => {
        if (!active) return;
        setIsLoaded(true);

        if (!containerRef.current) return;

        // Clean up previous map instance if exists
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Initialize map
        const centerLat = isPicker ? pickerLat : (visits.length > 0 ? (visits.reduce((sum, v) => sum + (v.lat || 41.0805), 0) / visits.length) : 41.0805);
        const centerLng = isPicker ? pickerLng : (visits.length > 0 ? (visits.reduce((sum, v) => sum + (v.lng || 29.0112), 0) / visits.length) : 29.0112);

        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true
        }).setView([centerLat, centerLng], isPicker ? 13 : 11);

        mapRef.current = map;

        // Add OpenStreetMap tiles (free, no API key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        if (isPicker) {
          // Draggable marker for choosing location
          const marker = L.marker([pickerLat, pickerLng], {
            draggable: true
          }).addTo(map);

          markerRef.current = marker;

          // Update position on drag end
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            if (onPickerPositionChange) {
              onPickerPositionChange(pos.lat, pos.lng);
            }
          });

          // Update position on map click
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            if (onPickerPositionChange) {
              onPickerPositionChange(lat, lng);
            }
          });
        } else {
          // Plot all visits
          const uniqueVisitsMap = new Map<string, Visit>();
          visits.forEach(v => {
            if (v.lat && v.lng) {
              // Keep latest or just display
              uniqueVisitsMap.set(`${v.lat.toFixed(4)},${v.lng.toFixed(4)}`, v);
            }
          });

          uniqueVisitsMap.forEach((visit) => {
            if (!visit.lat || !visit.lng) return;

            // Green if completed, blue if planned/otherwise
            const markerColor = visit.status === 'Completed' ? 'green' : 'blue';
            
            // Standard Leaflet Icon custom coloring
            const customIcon = L.icon({
              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            const marker = L.marker([visit.lat, visit.lng], { icon: customIcon }).addTo(map);

            marker.on('click', () => {
              setSelectedVisit(visit);
            });
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
        setLoadError(true);
      });

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [visits, isPicker]);

  // Handle outside changes of coordinates for picker mode
  useEffect(() => {
    if (isPicker && markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([pickerLat, pickerLng]);
      mapRef.current.setView([pickerLat, pickerLng], mapRef.current.getZoom());
    }
  }, [pickerLat, pickerLng, isPicker]);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/30 rounded-xl">
        <p className="text-xs font-bold text-red-600 dark:text-red-400">Harita yüklenemedi. İnternet bağlantınızı kontrol edin.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-zinc-950/40 rounded-xl">
        <div className="w-8 h-8 border-3 border-teal-500/30 border-t-teal-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Harita Modülü Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <div ref={containerRef} className="w-full h-full rounded-xl z-10" />

      {/* Selected Visit Details Overlay */}
      {!isPicker && selectedVisit && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-sm z-[20] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                selectedVisit.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-teal-400'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
              }`}>
                {selectedVisit.status === 'Completed' ? 'Tamamlandı' : 'Planlandı'}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-display mt-1">
                {selectedVisit.customerName}
              </h3>
            </div>
            <button
              onClick={() => setSelectedVisit(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-300">
            {selectedVisit.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium font-mono">{selectedVisit.customerPhone}</span>
              </div>
            )}
            {selectedVisit.customerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedVisit.customerEmail}</span>
              </div>
            )}
            {selectedVisit.customerAddress && (
              <div className="flex items-start gap-2">
                <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">{selectedVisit.customerAddress}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{selectedVisit.date} • {selectedVisit.time}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-zinc-950/40 rounded-lg border border-slate-100 dark:border-zinc-850">
              <p className="font-bold text-[10px] uppercase text-slate-400 mb-0.5">Ziyaret Amacı</p>
              <p className="italic text-slate-700 dark:text-zinc-350">{selectedVisit.purpose}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVisit.lat},${selectedVisit.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-center font-bold text-[10px] shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              Yol Tarifi Al
            </a>
            <button
              onClick={() => {
                if (onInitNewVisit && selectedVisit.lat && selectedVisit.lng) {
                  onInitNewVisit(selectedVisit.lat, selectedVisit.lng);
                  setSelectedVisit(null);
                }
              }}
              className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 text-center font-bold text-[10px] cursor-pointer flex items-center justify-center gap-1 transition-colors"
            >
              <CalendarPlus className="w-3 h-3" />
              Ziyaret Planla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
