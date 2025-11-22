import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { RetroContainer } from './RetroContainer';
import { MapPin } from 'lucide-react';

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface MapInterfaceProps {
  places: Place[];
  center?: { lat: number; lng: number };
}

export const MapInterface: React.FC<MapInterfaceProps> = ({ places, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    fixLeafletIcons();

    if (mapRef.current && !mapInstanceRef.current) {
      // Toronto default
      const defaultCenter: [number, number] = center 
        ? [center.lat, center.lng] 
        : [43.6532, -79.3832];

      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(defaultCenter, 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }
  }, []); 

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 14);
    }
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng])
        .addTo(map)
        .bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-slate-800 text-sm mb-1">${place.name}</h3>
            <p class="text-xs text-slate-500 mb-2">${place.address}</p>
            <p class="text-xs text-slate-700 leading-relaxed">${place.description}</p>
          </div>
        `);
      
      markersRef.current.push(marker);
      bounds.extend([place.lat, place.lng]);
    });

    if (places.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places]);

  return (
    <RetroContainer className="h-[600px] shadow-md border-0" title="Interactive Map">
      <div className="h-full w-full relative">
         <div ref={mapRef} className="absolute inset-0 z-0 bg-slate-100" />
         
         {/* Overlay Stats */}
         <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
           <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
             <MapPin size={12} className="text-blue-500" />
             <span>{places.length} Locations Found</span>
           </div>
         </div>
      </div>
    </RetroContainer>
  );
};
