import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Loader2, Sparkles, Navigation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RetroContainer } from './RetroContainer'; // Using the modern version
import { searchPlaces } from '../services/geminiService';
import { Message, GroundingChunk, SearchParams, VibeType, CategoryType, Place } from '../types';
import { VIBES, CATEGORIES, SUGGESTED_SEARCHES } from '../constants';

interface ChatInterfaceProps {
  onPlacesFound: (places: Place[]) => void;
  onLocationFound: (loc: { lat: number; lng: number }) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onPlacesFound, onLocationFound }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I'm your GTA UniSpots guide. Looking for a study spot, a networking event, or just somewhere to hang out?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<VibeType>(VibeType.ANY);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CategoryType.ANY);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [locLoading, setLocLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLocationRequest = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
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

  const handleSearch = async (overrideQuery?: string) => {
    const queryToUse = overrideQuery || input;
    if (!queryToUse.trim()) return;

    const userMsg: Message = { role: 'user', content: queryToUse };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const params: SearchParams = {
      query: queryToUse,
      vibe: selectedVibe,
      category: selectedCategory,
      radius: '5km' // Default radius for chat interactions
    };

    const result = await searchPlaces(params, location);

    let displayText = result.text;
    const jsonBlockRegex = /```json([\s\S]*?)```/;
    const match = result.text.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        const places: Place[] = JSON.parse(match[1]);
        onPlacesFound(places);
        displayText = result.text.replace(jsonBlockRegex, '').trim();
      } catch (e) {
        console.error("Failed to parse places JSON", e);
      }
    }

    const modelMsg: Message = {
      role: 'model',
      content: displayText,
      groundingChunks: result.groundingChunks
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <RetroContainer className="h-[600px] shadow-md border-0" title="Chat Assistant">
      <div className="flex flex-col h-full bg-slate-50">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'}
              `}>
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-400 prose-a:underline">
                  <ReactMarkdown 
                    components={{
                      p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Render Grounding (Maps) Data */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {msg.groundingChunks.map((chunk: GroundingChunk, cIdx: number) => {
                      if (chunk.maps?.uri) {
                        return (
                          <a 
                            key={cIdx} 
                            href={chunk.maps.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`
                              block p-3 rounded-xl border transition-all duration-200 group no-underline
                              ${msg.role === 'user' 
                                ? 'bg-blue-700 border-blue-500 hover:bg-blue-800' 
                                : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:shadow-sm'}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white shadow-sm'}`}>
                                <MapPin size={16} className={msg.role === 'user' ? 'text-blue-200' : 'text-red-500'} />
                              </div>
                              <div className="flex-1">
                                <div className={`font-semibold ${msg.role === 'user' ? 'text-white' : 'text-slate-900'}`}>
                                  {chunk.maps.title}
                                </div>
                                {chunk.maps.placeAnswerSources?.reviewSnippets?.[0] && (
                                  <div className={`text-xs mt-1 line-clamp-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                                    "{chunk.maps.placeAnswerSources.reviewSnippets[0].content}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-2">
                 <Loader2 className="animate-spin text-blue-600" size={16} />
                 <span className="text-xs text-slate-500 font-medium">Thinking...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          
          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
            {SUGGESTED_SEARCHES.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSearch(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Filters & Location */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select 
              value={selectedVibe} 
              onChange={(e) => setSelectedVibe(e.target.value as VibeType)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            
            <div className="flex-1"></div>

            <button 
              onClick={handleLocationRequest}
              disabled={locLoading}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors
                ${location 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}
              `}
            >
              {locLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
              {location ? 'Located' : 'Use Location'}
            </button>
          </div>

          {/* Main Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe what you're looking for..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-400"
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 flex items-center justify-center transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </RetroContainer>
  );
};