import React, { useState } from 'react';
import { DiscoveryInterface } from './components/DiscoveryInterface';
import { MapInterface } from './components/MapInterface';
import { GraduationCap, Map as MapIcon, List } from 'lucide-react';
import { Place } from './types';

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              GTA <span className="text-blue-600">UniSpots</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">Login</button>
             <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
               Student Pass
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Search & List */}
        <div className={`
          w-full lg:w-[450px] xl:w-[500px] flex flex-col border-r border-slate-200 bg-slate-50 p-4 z-10
          ${mobileView === 'list' ? 'absolute inset-0 lg:static' : 'hidden lg:flex'}
        `}>
          <DiscoveryInterface 
            onPlacesFound={setPlaces} 
            onLocationFound={setUserLocation}
            places={places}
            userLocation={userLocation}
          />
        </div>

        {/* Right Panel: Map */}
        <div className={`
          flex-1 bg-slate-100 relative
          ${mobileView === 'map' ? 'absolute inset-0 lg:static' : 'hidden lg:block'}
        `}>
          <div className="absolute inset-0">
             <MapInterface 
                places={places} 
                center={userLocation}
             />
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex bg-white rounded-full shadow-lg border border-slate-200 p-1">
          <button 
            onClick={() => setMobileView('list')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mobileView === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            List
          </button>
          <button 
            onClick={() => setMobileView('map')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mobileView === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Map
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
