import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Layers, 
  Filter, 
  EyeOff, 
  Info,
  Building2,
  Users,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { db } from '../lib/db';
import { DistrictMetric, BarrierType } from '../types';
import L from 'leaflet';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface GapMapViewProps {
  onNavigate?: (route: string) => void;
  onGoBack?: () => void;
}

export const GapMapView: React.FC<GapMapViewProps> = ({ onNavigate, onGoBack }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [metrics, setMetrics] = useState<DistrictMetric[]>([]);
  const [selectedBarrier, setSelectedBarrier] = useState<string>('all');
  const [activeDistrict, setActiveDistrict] = useState<DistrictMetric | null>(null);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const list = db.getDistrictMetrics();
    setMetrics(list);
    return subscribeAppLanguage(setAppLang);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [11.1271, 78.6569],
        zoom: 7,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • CareBridge AI',
        maxZoom: 18
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when metrics or barrier filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    metrics.forEach(d => {
      let caseCount = d.totalCases;
      if (selectedBarrier !== 'all') {
        caseCount = d.barriers[selectedBarrier as BarrierType] || 0;
      }

      if (d.isSuppressed) {
        const marker = L.circleMarker([d.lat, d.lng], {
          radius: 10,
          fillColor: '#94a3b8',
          color: '#64748b',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.5
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 160px;">
            <div style="font-weight: 800; color: #334155;">${d.district}</div>
            <div style="color: #64748b; font-size: 10px; margin-bottom: 6px;">${d.state}</div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; color: #475569; font-size: 11px;">
              <strong>Notice:</strong> Group &lt; 5 cases suppressed for anonymity.
            </div>
          </div>
        `);

        marker.on('click', () => setActiveDistrict(d));
        marker.addTo(markersLayerRef.current!);
        return;
      }

      const radius = Math.min(30, Math.max(12, Math.sqrt(caseCount) * 5));
      const color = caseCount > 25 ? '#dc2626' : caseCount > 15 ? '#ea580c' : '#0d9488';

      const circle = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.85
      });

      circle.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${d.district}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 8px;">${d.state} • Aggregate District</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Total Access Barriers:</span>
            <strong>${d.totalCases}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Unresolved Cases:</span>
            <strong style="color: #e11d48;">${d.unresolvedCases}</strong>
          </div>
        </div>
      `);

      circle.on('click', () => setActiveDistrict(d));
      circle.addTo(markersLayerRef.current!);
    });
  }, [metrics, selectedBarrier]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate?.('/admin/dashboard'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {t('navGapMap', appLang)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('mapTitle', appLang)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('mapSub', appLang)}
          </p>
        </div>

        {/* Clean Filter without verbose descriptions */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBarrier}
            onChange={(e) => setSelectedBarrier(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium cursor-pointer"
          >
            <option value="all">{t('allBarriers', appLang)}</option>
            <option value="Transportation">Transportation</option>
            <option value="Financial">Financial</option>
            <option value="Mobility">Mobility</option>
            <option value="Accessibility">Accessibility</option>
            <option value="Language">Language</option>
            <option value="Caregiver Support">Caregiver Support</option>
          </select>
        </div>
      </div>

      {/* Privacy Notice Pill */}
      <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        <span>{t('privacyNote', appLang)}</span>
      </div>

      {/* Map View & District Stats Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet Map Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[480px] rounded-2xl overflow-hidden z-10"
          />
        </div>

        {/* District Detail Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            {activeDistrict ? activeDistrict.district : 'District Overview'}
          </h3>

          {activeDistrict ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">{t('casesReported', appLang)}:</span>
                  <span className="font-bold text-slate-900">{activeDistrict.totalCases}</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Unresolved / In-Flight:</span>
                  <span className="font-bold text-rose-600">{activeDistrict.unresolvedCases}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                  {t('topBarriers', appLang)}:
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(activeDistrict.barriers).map(([b, cnt]) => (
                    <div key={b} className="flex justify-between text-xs">
                      <span className="text-slate-700">{b}</span>
                      <span className="font-mono font-bold text-teal-800">{cnt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Click any district circle on the map to inspect aggregate barriers.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
