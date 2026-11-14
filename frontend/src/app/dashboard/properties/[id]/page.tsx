"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, MapPin, Landmark, ShieldAlert,
  Train, School, Plus, CheckCircle, Percent, Compass, Navigation
} from "lucide-react";

// Import Map dynamically to prevent SSR / window reference issues in Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-zinc-500">
      Loading interactive map canvas...
    </div>
  )
});

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

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/properties/${id}`);
      if (!res.ok) {
        throw new Error("Property not found");
      }
      const data: Property = await res.json();
      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
      router.push("/dashboard/properties");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 border-4 border-cyan-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Analyzing asset metrics...</p>
      </div>
    );
  }

  if (!property) return null;

  const formattedPrice = (property.price / 1000000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1f]">
        <div>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-cyan-accent uppercase tracking-wider">
            {property.property_type}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5">{property.property_name}</h1>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {property.community}, Dubai • Developed by {property.developer}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asking Price</p>
          <p className="text-2xl font-black text-white">{formattedPrice}M AED</p>
          <p className="text-[10px] text-zinc-400">~ {Math.round(property.price / property.sqft)} AED / sqft</p>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left main area (Showcase Image, description, location) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main asset image */}
          <div 
            className="h-[350px] w-full rounded-2xl bg-zinc-900 bg-cover bg-center border border-[#222227] shadow-lg relative"
            style={{ backgroundImage: `url(${property.image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl"></div>
            <div className="absolute bottom-6 left-6">
              <span className="text-2xl font-black text-white">{property.bedrooms} Bed / {property.bathrooms} Bath</span>
              <span className="block text-xs text-zinc-300 mt-1">{property.sqft} Square Feet Built-up Area</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
            <h3 className="text-sm font-bold text-white mb-3">Investment Synopsis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{property.description}</p>
          </div>

          {/* Infrastructure metrics */}
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#121215] border border-[#222227] flex items-center gap-3">
              <Train className="w-5 h-5 text-cyan-accent" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Metro Link</p>
                <p className="text-xs font-bold text-white">{property.metro_distance} km</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#121215] border border-[#222227] flex items-center gap-3">
              <School className="w-5 h-5 text-purple-accent" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Academy</p>
                <p className="text-xs font-bold text-white">{property.school_distance} km</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#121215] border border-[#222227] flex items-center gap-3">
              <Landmark className="w-5 h-5 text-emerald-accent" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Clinics</p>
                <p className="text-xs font-bold text-white">{property.hospital_distance} km</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#121215] border border-[#222227] flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-accent" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Malls</p>
                <p className="text-xs font-bold text-white">{property.mall_distance} km</p>
              </div>
            </div>
          </div>

          {/* Interactive Map card */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-cyan-accent animate-pulse" />
              Geographic Proximity Map
            </h3>
            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-[#222227]">
              <Map 
                lat={Number(property.latitude)} 
                lng={Number(property.longitude)} 
                propertyName={property.property_name}
                community={property.community}
                priceText={`${formattedPrice}M`}
              />
            </div>
          </div>
        </div>

        {/* Right column (Investment score, pricing, and advisor quick details) */}
        <div className="space-y-6">
          {/* Investment Score Card */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] text-center flex flex-col items-center shadow-lg relative">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Overall Investment Rating
            </h3>
            
            {/* Custom Circular Gauge styling */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
              {/* Inner score dial */}
              <div className="absolute inset-2 rounded-full border border-dashed border-zinc-700"></div>
              <div className="text-center">
                <span className="text-4xl font-black text-white">{property.investment_score}</span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-0.5">out of 100</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 mt-2 text-xs">
              <div className="text-center border-r border-zinc-800">
                <p className="text-zinc-500">Rental Yield</p>
                <p className="font-bold text-cyan-accent text-sm mt-0.5">{property.rental_yield}%</p>
              </div>
              <div className="text-center">
                <p className="text-zinc-500">Appreciation</p>
                <p className="font-bold text-purple-accent text-sm mt-0.5">{property.future_appreciation}%</p>
              </div>
            </div>
          </div>

          {/* Investment indicators list */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Financial Underwriting
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-500">Total ROI Projection:</span>
                <span className="font-extrabold text-white">{property.roi}% p.a.</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-500">Risk Profile:</span>
                <span className={`font-bold ${property.risk === "Low" ? "text-emerald-accent" : property.risk === "Medium" ? "text-amber-accent" : "text-rose-500"}`}>
                  {property.risk}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-500">Exit Liquidity Index:</span>
                <span className="font-extrabold text-white">{property.liquidity} / 100</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
                <span className="text-zinc-500">Developer Rating:</span>
                <span className="font-extrabold text-white">{property.developer_rating} / 10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Market Demand Velocity:</span>
                <span className="font-extrabold text-cyan-accent">{property.demand} / 100</span>
              </div>
            </div>
          </div>

          {/* Back button shortcut */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#121215] to-[#12121e] border border-zinc-800/40 text-center">
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Want to see how this property fits a client portfolio? Run a questionnaire simulation in the AI Advisor workspace.
            </p>
            <Link 
              href="/dashboard/advisor"
              className="w-full py-2 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-bold text-xs rounded-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1"
            >
              Analyze with AI Advisor
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
