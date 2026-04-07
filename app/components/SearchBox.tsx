"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AirportResult {
  code: string;
  name: string;
  location: string;
  slug: string;
  services: {
    showers: boolean;
    storage: boolean;
    sleeping: boolean;
  };
}

// 1. 本地意图字典：负责拦截纯功能词搜索
const CATEGORY_INTENTS = [
  { keywords: ['shower', 'bath', 'freshen', 'wash'], title: 'Global Showers Directory', url: '/airport-showers', icon: '🚿', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { keywords: ['luggage', 'baggage', 'storage', 'locker'], title: 'Luggage Storage Directory', url: '/airport-storage', icon: '🧳', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
  { keywords: ['sleep', 'pod', 'nap', 'rest', 'hotel'], title: 'Sleeping Pods & Hotels', url: '/airport-sleeping', icon: '😴', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  { keywords: ['transport', 'train', 'bus', 'taxi', 'transfer'], title: 'City Transport Guide', url: '/airport-transport', icon: '🚇', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
];

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AirportResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [targetService, setTargetService] = useState('showers'); // 记录后端识别的服务
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const router = useRouter();

  // 2. 实时匹配意图
  const matchedIntents = CATEGORY_INTENTS.filter(intent => 
    intent.keywords.some(kw => query.toLowerCase().includes(kw))
  );

  const searchAirports = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
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
      setResults(data.results || []);
      setTargetService(data.targetService || 'showers'); // 存下后端切出的服务
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error: any) {
      if (error.name === "AbortError") return; 
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchAirports(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchAirports]);

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
    if (!showResults) return;
    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={resultsRef}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-4 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm focus-within:shadow-md focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Search airport or facility (e.g. SIN, London, Showers...)" // 更新 Placeholder 引导用户
            className="flex-1 py-5 text-lg text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
            aria-expanded={showResults}
            aria-autocomplete="list"
          />
          {isLoading && (
            <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
        
        <button
          onClick={() => {
            // 回车或点击搜索按钮时：优先跑意图字典，如果没命中意图，再跳转第一个搜索结果
            if (matchedIntents.length > 0) router.push(matchedIntents[0].url);
            else if (results.length > 0) router.push(`/airport/${results[0].slug}/${targetService}`); 
          }}
          className="px-10 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          Search
        </button>
      </div>

      {showResults && (matchedIntents.length > 0 || results.length > 0 || (query.length >= 2 && !isLoading)) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50">
          
          {/* 渲染：快捷意图通道 */}
          {matchedIntents.length > 0 && (
            <div className="p-2 bg-slate-50/50 border-b border-slate-100">
              {matchedIntents.map((intent) => (
                <div
                  key={intent.url}
                  onClick={() => {
                    setShowResults(false);
                    router.push(intent.url);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white rounded-xl transition-all border border-transparent hover:${intent.border} hover:shadow-sm`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${intent.bg} ${intent.color}`}>
                    {intent.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${intent.color}`}>Go to {intent.title} →</h4>
                    <p className="text-xs text-slate-500 font-medium">Browse all airports with this facility</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 渲染：机场搜索结果 */}
          {results.map((airport, index) => (
            <div
              key={airport.code}
              onClick={() => {
                setShowResults(false);
                router.push(`/airport/${airport.slug}/${targetService}`); // 动态跳转
              }}
              className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0 ${index === selectedIndex ? "bg-blue-50/50" : ""}`}
            >
              <div className="flex items-center gap-5">
                <span className="w-14 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm tracking-wider">
                  {airport.code}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{airport.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{airport.location}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {airport.services.showers && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">Showers</span>}
                {airport.services.storage && <span className="px-2.5 py-1 bg-sky-50 text-sky-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">Storage</span>}
                {airport.services.sleeping && <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">Sleeping</span>}
              </div>
            </div>
          ))}

          {/* 渲染：无结果兜底 */}
          {results.length === 0 && matchedIntents.length === 0 && query.length >= 2 && !isLoading && (
            <div className="px-6 py-8 text-center text-slate-500 font-medium">
              No airports or facilities found for &quot;{query}&quot;. Try searching for a major city or IATA code.
            </div>
          )}

        </div>
      )}
    </div>
  );
}
