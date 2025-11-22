import React from 'react';
import { Place } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
          {place.name}
        </h3>
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">
          GTA
        </span>
      </div>
      
      <div className="flex items-start gap-1.5 text-slate-500 text-sm mb-3">
        <MapPin size={16} className="mt-0.5 shrink-0" />
        <span className="line-clamp-1">{place.address}</span>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        {place.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {place.tags?.map((tag, idx) => (
          <span key={idx} className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
