"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Car, MapPin, Loader2, Star, DollarSign } from "lucide-react";

interface AirportResult {
  iata: string;
  name: string;
  city: string;
  url: string;
  parkingCount: number;
}

interface ParkingResult {
  id: string;
  name: string;
  slug: string;
  airport: {
    iata: string;
    name: string;
    city: string;
  };
  dailyRate: number;
  rating: number | null;
  isIndoor: boolean;
  hasValet: boolean;
  url: string;
}

interface SearchResponse {
  airports: AirportResult[];
  parkings: ParkingResult[];
  suggestions: string[];
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const router = useRouter();

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        signal: abortControllerRef.current.signal,
      });
      const data = await response.json();
      setResults(data);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error: any) {
      if (error.name === "AbortError") return; 
      console.error("Search failed:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || !results) return;
    
    const totalItems = 
      (results.airports?.length || 0) + 
      (results.parkings?.length || 0) +
      (results.suggestions?.length || 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(selectedIndex);
        } else if (query.trim()) {
          router.push(`/search/${query.trim().toLowerCase().replace(/\s+/g, "-")}`);
          setShowResults(false);
          setQuery("");
        }
        break;
      case "Escape":
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (index: number) => {
    if (!results) return;
    
    const airportCount = results.airports?.length || 0;
    const parkingCount = results.parkings?.length || 0;
    
    if (index < airportCount) {
      // Selected airport
      router.push(results.airports[index].url);
    } else if (index < airportCount + parkingCount) {
      // Selected parking
      router.push(results.parkings[index - airportCount].url);
    } else {
      // Selected suggestion
      const suggestion = results.suggestions[index - airportCount - parkingCount];
      router.push(`/search/${suggestion.replace(/\s+/g, "-")}`);
    }
    
    setShowResults(false);
    setQuery("");
  };

  const hasResults = results && (
    (results.airports?.length || 0) > 0 || 
    (results.parkings?.length || 0) > 0 ||
    (results.suggestions?.length || 0) > 0
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={resultsRef}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* 输入框外壳 */}
        <div className="flex-1 flex items-center gap-3 md:gap-4 px-4 md:px-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm focus-within:shadow-md focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
          <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Search airports (JFK), parking lots..."
            className="flex-1 py-4 md:py-5 text-base md:text-lg text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium min-w-0"
            aria-expanded={showResults}
          />
          {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />}
        </div>
        
        {/* 搜索按钮 */}
        <button
          onClick={() => {
            if (query.trim()) {
              router.push(`/search/${query.trim().toLowerCase().replace(/\s+/g, "-")}`);
              setShowResults(false);
              setQuery("");
            }
          }}
          className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 bg-blue-600 text-white font-bold text-base md:text-lg rounded-2xl shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          Search
        </button>
      </div>

      {/* 下拉结果面板 */}
      {showResults && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] md:max-h-[600px] overflow-y-auto">
          
          {/* 机场结果 */}
          {results?.airports && results.airports.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Airports ({results.airports.length})
              </div>
              {results.airports.map((airport, index) => (
                <div
                  key={airport.iata}
                  onClick={() => handleSelect(index)}
                  className={`flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-blue-50/80 transition-colors border-b border-slate-50 last:border-0 ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
                    <span className="w-12 h-10 sm:w-14 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm tracking-wider flex-shrink-0">
                      {airport.iata}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg truncate">{airport.name}</h4>
                      <div className="flex items-center text-sm text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{airport.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="px-2 py-1 sm:px-2.5 sm:py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg whitespace-nowrap">
                      {airport.parkingCount} option{airport.parkingCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 停车场结果 */}
          {results?.parkings && results.parkings.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Parking Lots ({results.parkings.length})
              </div>
              {results.parkings.map((parking, index) => {
                const globalIndex = (results.airports?.length || 0) + index;
                return (
                  <div
                    key={parking.id}
                    onClick={() => handleSelect(globalIndex)}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-emerald-50/80 transition-colors border-b border-slate-50 last:border-0 ${
                      globalIndex === selectedIndex ? "bg-emerald-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      <span className="w-12 h-10 sm:w-14 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm tracking-wider flex-shrink-0">
                        <Car className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-base sm:text-lg truncate">{parking.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{parking.airport.iata}</span>
                          <span className="truncate">{parking.airport.city}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {parking.isIndoor && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">Indoor</span>
                          )}
                          {parking.hasValet && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded">Valet</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 mt-2 sm:mt-0">
                      <div className="flex items-center gap-1 text-base sm:text-lg font-black text-slate-900">
                        <DollarSign className="w-4 h-4" />
                        {Number(parking.dailyRate).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">per day</div>
                      {parking.rating && (
                        <div className="flex items-center gap-1 text-amber-500 text-sm sm:mt-1">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span className="font-bold">{parking.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 搜索建议 */}
          {results?.suggestions && results.suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Suggestions
              </div>
              {results.suggestions.map((suggestion, index) => {
                const globalIndex = (results.airports?.length || 0) + (results.parkings?.length || 0) + index;
                return (
                  <div
                    key={suggestion}
                    onClick={() => handleSelect(globalIndex)}
                    className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                      globalIndex === selectedIndex ? "bg-slate-100" : ""
                    }`}
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{suggestion}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 无结果状态 */}
      {showResults && query.length >= 2 && !isLoading && !hasResults && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 px-4 sm:px-6 py-8 sm:py-10 text-center">
          <p className="font-bold text-slate-800 text-base sm:text-lg">No results for &quot;{query}&quot;</p>
          <p className="text-sm text-slate-500 mt-2">
            Try airport code (JFK, LAX), city name, or features (valet, indoor)
          </p>
          <button
            onClick={() => {
              router.push(`/search/${query.trim().toLowerCase().replace(/\s+/g, "-")}`);
              setShowResults(false);
            }}
            className="mt-4 px-4 sm:px-6 py-2 bg-blue-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            View search page
          </button>
        </div>
      )}
    </div>
  );
}
