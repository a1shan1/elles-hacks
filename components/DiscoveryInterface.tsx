import React, { useState } from 'react';
import { Search, Loader2, Navigation, Filter } from 'lucide-react';
import { PlaceCard } from './PlaceCard';
import { searchPlaces } from '../services/geminiService';
import { Place, SearchParams, VibeType, CategoryType } from '../types';
import { VIBES, CATEGORIES } from '../constants';

interface DiscoveryInterfaceProps {
  onPlacesFound: (places: Place[]) => void;
  onLocationFound: (loc: { lat: number; lng: number }) => void;
  places: Place[];
  userLocation?: { lat: number; lng: number };
}

export const DiscoveryInterface: React.FC<DiscoveryInterfaceProps> = ({ 
  onPlacesFound, 
  onLocationFound,
  places,
  userLocation
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<VibeType>(VibeType.ANY);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CategoryType.ANY);
  const [radius, setRadius] = useState<string>('5km');
  const [locLoading, setLocLoading] = useState(false);

  const handleLocationRequest = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationFound(loc);
          setLocLoading(false);
        },
        (error) => {
          console.error(error);
          setLocLoading(false);
        }
      );
    } else {
      setLocLoading(false);
    }
  };

  const handleSearch = async () => {
    // Allow empty query if filters are selected, but default to something if completely empty
    const effectiveQuery = query.trim() || "popular spots";
    
    setLoading(true);
    onPlacesFound([]); // Clear previous results while loading

    const params: SearchParams = {
      query: effectiveQuery,
      vibe: selectedVibe,
      category: selectedCategory,
      radius: radius
    };

    const result = await searchPlaces(params, userLocation);

    const jsonBlockRegex = /```json([\s\S]*?)```/;
    const match = result.text.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        const parsedPlaces: Place[] = JSON.parse(match[1]);
        onPlacesFound(parsedPlaces);
      } catch (e) {
        console.error("Failed to parse places JSON", e);
      }
    } else {
       // Fallback logic if needed, or error handling
       console.log("No structured data found");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Find Your Spot</h2>
        
        {/* Main Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Quiet cafe with good matcha..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value as VibeType)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
          >
            {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <select 
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
          >
            <option value="1km">1 km</option>
            <option value="5km">5 km</option>
            <option value="10km">10 km</option>
            <option value="25km">25 km</option>
          </select>

          <button 
            onClick={handleLocationRequest}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${userLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {locLoading ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
            {userLocation ? 'Located' : 'Near Me'}
          </button>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Searching...
            </>
          ) : (
            'Find Places'
          )}
        </button>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <Loader2 className="animate-spin mb-4" size={40} />
             <p>Scanning the GTA...</p>
           </div>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pb-10">
            <h3 className="font-semibold text-slate-700 pl-1">Top Results ({places.length})</h3>
            {places.map((place, idx) => (
              <PlaceCard key={idx} place={place} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Filter size={40} className="mb-4 opacity-50" />
            <p className="text-center max-w-xs">Adjust your filters and hit search to find the best spots in the 6ix.</p>
          </div>
        )}
      </div>
    </div>
  );
};
