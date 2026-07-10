'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type AgencyStatus = 'ok' | 'warn' | 'critical';

const agencies: {
  id: string; name: string; lat: number; lng: number;
  wait: number; guichets: number; topService: string; status: AgencyStatus;
}[] = [
  { id: 'AG-BUJ-01', name: 'Agence Centrale — Bujumbura', lat: -3.3822, lng: 29.3622, wait: 7,  guichets: 6, topService: 'Ouverture de compte', status: 'ok' },
  { id: 'AG-BUJ-02', name: 'Agence Rohero',               lat: -3.3701, lng: 29.3594, wait: 18, guichets: 4, topService: 'Retrait caisse',       status: 'warn' },
  { id: 'AG-BUJ-03', name: 'Agence Buyenzi',              lat: -3.3950, lng: 29.3550, wait: 34, guichets: 3, topService: 'Virement bancaire',    status: 'critical' },
  { id: 'AG-GOM-01', name: 'Agence Goma Nord',             lat: -1.6590, lng: 29.2200, wait: 12, guichets: 5, topService: 'Renseignements',       status: 'warn' },
  { id: 'AG-KGL-01', name: 'Agence Kigali Centre',         lat: -1.9441, lng: 30.0619, wait: 5,  guichets: 8, topService: 'Prêts',                status: 'ok' },
];

const mapStatusColor: Record<AgencyStatus, string> = {
  ok: '#10B981', warn: '#F59E0B', critical: '#F43F5E',
};

export default function AgencyMapClient() {
  return (
    <>
      <div style={{ height: '320px', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        <MapContainer center={[-2.5, 29.5]} zoom={6} style={{ height: '100%', width: '100%' }}
          zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO' />
          {agencies.map((ag) => (
            <CircleMarker key={ag.id} center={[ag.lat, ag.lng]}
              radius={ag.wait > 30 ? 14 : ag.wait > 10 ? 11 : 9}
              pathOptions={{ color: mapStatusColor[ag.status], fillColor: mapStatusColor[ag.status], fillOpacity: 0.85, weight: 2 }}>
              <LeafletTooltip permanent={false} direction="top">
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: 1.5 }}>
                  <p style={{ fontWeight: 700, marginBottom: '2px' }}>{ag.name}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#64748b' }}>{ag.id}</p>
                  <p>⏱ Attente : <strong>{ag.wait} min</strong></p>
                  <p>🪟 Guichets ouverts : <strong>{ag.guichets}</strong></p>
                  <p>🔥 Service surchargé : <strong>{ag.topService}</strong></p>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex items-center justify-center gap-6 py-3" style={{ borderTop: '1px solid #334155' }}>
        {[{ color: '#10B981', label: '< 10 min' }, { color: '#F59E0B', label: '10 – 30 min' }, { color: '#F43F5E', label: '> 30 min (alerte)' }].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: l.color, display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <style>{`.leaflet-container { background: #0A0E1A !important; }`}</style>
    </>
  );
}
