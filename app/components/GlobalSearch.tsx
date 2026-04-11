"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Car, Loader2 } from "lucide-react";

interface SearchResult {
  airports: {
    iata: string;
    name: string;
    city: string;
    url: string;
  }[];
  parkings: {
    id: string;
    name: string;
    slug: string;
    airport: {
      iata: string;
      city: string;
    };
    dailyRate: number;
    url: string;
  }[];
  suggestions: string[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      const totalItems =
        (results?.airports?.length || 0) +
        (results?.parkings?.length || 0) +
        (results?.suggestions?.length || 0);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < totalItems - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0) {
            handleSelect(selectedIndex);
          } else {
            handleSearchSubmit();
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  async function performSearch(searchQuery: string) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(index: number) {
    const airports = results?.airports || [];
    const parkings = results?.parkings || [];
    const suggestions = results?.suggestions || [];

    if (index < airports.length) {
      router.push(airports[index].url);
    } else if (index < airports.length + parkings.length) {
      router.push(parkings[index - airports.length].url);
    } else {
      const suggestionIndex = index - airports.length - parkings.length;
      const suggestion = suggestions[suggestionIndex];
      if (suggestion) {
        router.push(`/search/${suggestion.replace(/\s+/g, "-")}`);
      }
    }

    setIsOpen(false);
    setQuery("");
  }

  function handleSearchSubmit() {
    if (query.trim()) {
      const searchSlug = query.trim().toLowerCase().replace(/\s+/g, "-");
      router.push(`/search/${searchSlug}`);
      setIsOpen(false);
      setQuery("");
    }
  }

  function getItemAtIndex(index: number) {
    const airports = results?.airports || [];
    const parkings = results?.parkings || [];
    const suggestions = results?.suggestions || [];

    if (index < airports.length) {
      return { type: "airport", item: airports[index] };
    } else if (index < airports.length + parkings.length) {
      return { type: "parking", item: parkings[index - airports.length] };
    } else {
      return {
        type: "suggestion",
        item: suggestions[index - airports.length - parkings.length],
      };
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search airports, parking..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full md:w-64 pl-10 pr-10 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
        {!isLoading && query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 min-w-[320px] md:min-w-[400px]">
          {/* Airports */}
          {results.airports?.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Airports
              </div>
              {results.airports.map((airport, index) => (
                <Link
                  key={airport.iata}
                  href={airport.url}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selectedIndex === index ? "bg-blue-50" : ""
                  }`}
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">
                      {airport.iata} - {airport.name}
                    </div>
                    <div className="text-sm text-slate-500">{airport.city}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Parking Lots */}
          {results.parkings?.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Parking Lots
              </div>
              {results.parkings.map((parking, index) => {
                const globalIndex = (results.airports?.length || 0) + index;
                return (
                  <Link
                    key={parking.id}
                    href={parking.url}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors ${
                      selectedIndex === globalIndex ? "bg-emerald-50" : ""
                    }`}
                  >
                    <Car className="w-4 h-4 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">
                        {parking.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {parking.airport.iata} - {parking.airport.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        ${parking.dailyRate.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400">per day</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {results.suggestions?.length > 0 && (
            <div className="border-b border-slate-100 last:border-0">
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Suggestions
              </div>
              {results.suggestions.map((suggestion, index) => {
                const globalIndex =
                  (results.airports?.length || 0) +
                  (results.parkings?.length || 0) +
                  index;
                return (
                  <Link
                    key={suggestion}
                    href={`/search/${suggestion.replace(/\s+/g, "-")}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      selectedIndex === globalIndex ? "bg-slate-100" : ""
                    }`}
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{suggestion}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* View All Results */}
          <button
            onClick={handleSearchSubmit}
            className="w-full px-4 py-3 bg-blue-600 text-white font-bold text-center hover:bg-blue-700 transition-colors"
          >
            View all results for &quot;{query}&quot;
          </button>

          {/* No Results */}
          {results.airports?.length === 0 &&
            results.parkings?.length === 0 &&
            results.suggestions?.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-sm mt-1">
                  Try searching for an airport code (e.g., JFK) or city name
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
