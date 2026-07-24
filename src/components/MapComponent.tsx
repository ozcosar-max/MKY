import React from 'react';
import { Visit } from '../types';
import { LeafletMap } from './LeafletMap';
import { Compass } from 'lucide-react';

interface MapComponentProps {
  visits: Visit[];
  onNavigateToTab: (tab: 'dashboard' | 'calendar' | 'map' | 'settings') => void;
  onInitNewVisitAtLocation?: (lat: number, lng: number) => void;
}

export function MapComponent({
  visits,
  onNavigateToTab,
  onInitNewVisitAtLocation
}: MapComponentProps) {
  return (
    <div id="map-page-section" className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 shadow-sm flex flex-col animate-in fade-in">
      <div className="flex-1 w-full h-full relative">
        <LeafletMap
          visits={visits}
          onInitNewVisit={onInitNewVisitAtLocation}
        />

        {/* Compass Header Action Overlay */}
        <div className="absolute top-4 left-4 z-[500] bg-white/95 dark:bg-zinc-900/95 shadow-lg border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 max-w-xs sm:max-w-md backdrop-blur">
          <Compass className="w-5 h-5 text-teal-600 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-display uppercase tracking-wider">
              İnteraktif Konum Haritası
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
              Görüşmelerinizin haritadaki konumları. Ziyaret planlamak ve yol tarifi almak için iğnelere tıklayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
