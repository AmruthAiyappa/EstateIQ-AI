"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Search, SlidersHorizontal, CheckSquare, Square, 
  ArrowUpDown, Eye, CheckCircle2, ChevronRight, X, AlertTriangle
} from "lucide-react";

interface Property {
  id: number;
  property_name: string;
  developer: string;
  community: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: string;
  roi: number;
  rental_yield: number;
  future_appreciation: number;
  developer_rating: number;
  liquidity: number;
  risk: string;
  demand: number;
  metro_distance: number;
  school_distance: number;
  hospital_distance: number;
  mall_distance: number;
  latitude: number;
  longitude: number;
  description: string;
  image_url: string;
  investment_score: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBeds, setSelectedBeds] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [priceMax, setPriceMax] = useState("");
  const [minYield, setMinYield] = useState("");

  // Communities and developers lists for filters
  const [communities, setCommunities] = useState<string[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<keyof Property>("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Comparison State
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, searchQuery, selectedCommunity, selectedType, selectedBeds, selectedRisk, priceMax, minYield, sortBy, sortOrder]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/properties");
      const data: Property[] = await res.json();
      setProperties(data);
      setFilteredProperties(data);

      // Extract unique communities
      const comms = Array.from(new Set(data.map(p => p.community)));
      setCommunities(comms);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...properties];

    // Search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(p => 
        p.property_name.toLowerCase().includes(query) || 
        p.developer.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Community filter
    if (selectedCommunity !== "All") {
      temp = temp.filter(p => p.community === selectedCommunity);
    }

    // Property Type
    if (selectedType !== "All") {
      temp = temp.filter(p => p.property_type === selectedType);
    }

    // Bedrooms
    if (selectedBeds !== "All") {
      temp = temp.filter(p => p.bedrooms === parseInt(selectedBeds));
    }

    // Risk
    if (selectedRisk !== "All") {
      temp = temp.filter(p => p.risk === selectedRisk);
    }

    // Max Price
    if (priceMax !== "") {
      temp = temp.filter(p => p.price <= parseFloat(priceMax) * 1000000);
    }

    // Min Yield
    if (minYield !== "") {
      temp = temp.filter(p => p.rental_yield >= parseFloat(minYield));
    }

    // Sorting
    temp.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProperties(temp);
  };

  const toggleSort = (field: keyof Property) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const toggleCompare = (id: number) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else {
      if (compareIds.length >= 3) {
        alert("You can compare a maximum of 3 properties at a time.");
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const clearComparison = () => {
    setCompareIds([]);
    setShowComparison(false);
  };

  // Compare helpers
  const selectedCompareProps = properties.filter(p => compareIds.includes(p.id));

  const getWinnerValue = (field: keyof Property, type: "min" | "max" = "max") => {
    if (selectedCompareProps.length === 0) return null;
    const values = selectedCompareProps.map(p => Number(p[field]));
    return type === "max" ? Math.max(...values) : Math.min(...values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Property Directory</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Search, sort, filter, and compare 45 luxury properties across key Dubai communities.
          </p>
        </div>
        {compareIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400">
              {compareIds.length} Asset{compareIds.length > 1 ? "s" : ""} Selected
            </span>
            <button
              onClick={() => setShowComparison(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={clearComparison}
              className="p-2 rounded-lg border border-[#222227] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Comparison Panel Overlay */}
      {showComparison && selectedCompareProps.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-6xl bg-[#121215] border border-[#222227] rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowComparison(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-accent" />
              Side-by-Side Asset Comparison
            </h2>

            {/* Comparison Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {selectedCompareProps.map(prop => {
                return (
                  <div key={prop.id} className="p-5 rounded-xl bg-zinc-950 border border-[#222227]">
                    <div className="h-32 rounded-lg bg-zinc-800 bg-cover bg-center mb-4 relative" style={{ backgroundImage: `url(${prop.image_url})` }}>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase">
                        {prop.property_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1 truncate">{prop.property_name}</h3>
                    <p className="text-[11px] text-zinc-500 mb-3">{prop.developer} • {prop.community}</p>
                    <p className="text-lg font-black text-white mb-4">{(prop.price/1000000).toFixed(2)}M AED</p>

                    {/* Quick Stats list */}
                    <div className="space-y-2 text-xs border-t border-zinc-900 pt-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Investment Score:</span>
                        <span className="font-bold text-emerald-accent">{prop.investment_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Rental Yield:</span>
                        <span className="font-bold text-cyan-accent">{prop.rental_yield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Capital Appreciation:</span>
                        <span className="font-bold text-purple-accent">{prop.future_appreciation}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Risk Profile:</span>
                        <span className={`font-semibold ${prop.risk === "Low" ? "text-emerald-accent" : prop.risk === "Medium" ? "text-amber-accent" : "text-rose-500"}`}>{prop.risk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Exit Liquidity:</span>
                        <span className="font-semibold text-white">{prop.liquidity}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Closest Metro:</span>
                        <span className="font-semibold text-white">{prop.metro_distance} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Highlighted winner metrics table */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-accent" />
                Performance Comparison
              </h3>
              <div className="space-y-2.5 text-xs">
                {/* Yield winner */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-500">Yield Winner:</span>
                  <span className="font-semibold text-white">
                    {selectedCompareProps.reduce((prev, current) => (prev.rental_yield > current.rental_yield) ? prev : current).property_name} 
                    <span className="text-cyan-accent ml-1.5 font-bold">
                      ({getWinnerValue("rental_yield")?.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                {/* Appreciation winner */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-500">Appreciation Winner:</span>
                  <span className="font-semibold text-white">
                    {selectedCompareProps.reduce((prev, current) => (prev.future_appreciation > current.future_appreciation) ? prev : current).property_name}
                    <span className="text-purple-accent ml-1.5 font-bold">
                      ({getWinnerValue("future_appreciation")?.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                {/* Price (min is winner) */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-500">Lowest Entry Price:</span>
                  <span className="font-semibold text-white">
                    {selectedCompareProps.reduce((prev, current) => (prev.price < current.price) ? prev : current).property_name}
                    <span className="text-emerald-accent ml-1.5 font-bold">
                      ({((getWinnerValue("price", "min") ?? 0) / 1000000).toFixed(2)}M AED)
                    </span>
                  </span>
                </div>
                {/* Score winner */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Highest Investment Score:</span>
                  <span className="font-semibold text-white">
                    {selectedCompareProps.reduce((prev, current) => (prev.investment_score > current.investment_score) ? prev : current).property_name}
                    <span className="text-amber-accent ml-1.5 font-bold">
                      ({getWinnerValue("investment_score")?.toFixed(1)}/100)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Options Card */}
      <div className="p-5 rounded-xl bg-[#121215] border border-[#222227]">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Keyword Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property or developer..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-700 placeholder-zinc-750 transition-colors"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full lg:w-auto">
            {/* Community filter */}
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 focus:outline-none"
            >
              <option value="All">All Communities</option>
              {communities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Property type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Townhouse">Townhouse</option>
            </select>

            {/* Beds filter */}
            <select
              value={selectedBeds}
              onChange={(e) => setSelectedBeds(e.target.value)}
              className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 focus:outline-none"
            >
              <option value="All">All Bedrooms</option>
              <option value="0">Studio</option>
              <option value="1">1 Bed</option>
              <option value="2">2 Bed</option>
              <option value="3">3 Bed</option>
              <option value="4">4 Bed</option>
              <option value="5">5+ Bed</option>
            </select>

            {/* Risk filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 focus:outline-none"
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {/* Max budget */}
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max Price (M AED)"
              className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-white focus:outline-none placeholder-zinc-700 w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Properties Directory List */}
      <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 text-center">Compare</th>
                <th className="pb-3 pl-2">
                  <button onClick={() => toggleSort("property_name")} className="flex items-center gap-1 hover:text-white">
                    Property Name
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="pb-3">Developer</th>
                <th className="pb-3">Community</th>
                <th className="pb-3 text-right">
                  <button onClick={() => toggleSort("price")} className="flex items-center gap-1 hover:text-white justify-end w-full">
                    Price (AED)
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="pb-3 text-center">Bed/Bath</th>
                <th className="pb-3 text-center">
                  <button onClick={() => toggleSort("rental_yield")} className="flex items-center gap-1 hover:text-white justify-center w-full">
                    Yield
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="pb-3 text-center">Apprec.</th>
                <th className="pb-3 text-center">Risk</th>
                <th className="pb-3 text-center">
                  <button onClick={() => toggleSort("investment_score")} className="flex items-center gap-1 hover:text-white justify-center w-full">
                    Score
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222227] text-xs text-zinc-400">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-600">Loading Dubai property database...</td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-600">No properties matches the filter constraints.</td>
                </tr>
              ) : (
                filteredProperties.map(p => {
                  const isCompared = compareIds.includes(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-[#18181f]/45 transition-colors align-middle">
                      {/* Compare Checkbox */}
                      <td className="py-3 text-center">
                        <button onClick={() => toggleCompare(p.id)} className="text-zinc-600 hover:text-white mx-auto block">
                          {isCompared ? (
                            <CheckSquare className="w-4 h-4 text-cyan-accent" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      
                      {/* Property Name */}
                      <td className="py-3 pl-2 font-bold text-white max-w-[200px] truncate">
                        {p.property_name}
                        <span className="block text-[10px] text-zinc-500 font-normal uppercase tracking-wide">
                          {p.property_type}
                        </span>
                      </td>

                      {/* Developer */}
                      <td className="py-3 text-zinc-300 font-medium">{p.developer}</td>

                      {/* Community */}
                      <td className="py-3 text-zinc-400">{p.community}</td>

                      {/* Price */}
                      <td className="py-3 text-right font-extrabold text-white">
                        {(p.price/1000000).toFixed(2)}M
                      </td>

                      {/* Bed/Bath */}
                      <td className="py-3 text-center">
                        {p.bedrooms}B / {p.bathrooms}B
                        <span className="block text-[9px] text-zinc-600">{p.sqft} sqft</span>
                      </td>

                      {/* Yield */}
                      <td className="py-3 text-center text-cyan-accent font-semibold">
                        {p.rental_yield}%
                      </td>

                      {/* Appreciation */}
                      <td className="py-3 text-center text-purple-accent font-semibold">
                        {p.future_appreciation}%
                      </td>

                      {/* Risk */}
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                          p.risk === "Low" 
                            ? "bg-emerald-950/20 text-emerald-accent border-emerald-800/40" 
                            : p.risk === "Medium"
                            ? "bg-amber-950/20 text-amber-accent border-amber-800/40"
                            : "bg-rose-950/20 text-rose-500 border-rose-800/40"
                        }`}>
                          {p.risk}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3 text-center font-bold text-white text-sm">
                        {p.investment_score}
                      </td>

                      {/* Details button */}
                      <td className="py-3 text-right pr-2">
                        <Link
                          href={`/dashboard/properties/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
