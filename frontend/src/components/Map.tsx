"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Create custom SVG Leaflet Marker Icon to prevent missing bundler images issue
const customIcon = L.divIcon({
  className: "custom-marker-icon",
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-cyan-500/20 animate-ping"></div>
      <div class="w-5 h-5 rounded-full bg-cyan-accent border-2 border-black shadow-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-black"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3-3 3 3-3 3Z"/></svg>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapProps {
  lat: number;
  lng: number;
  propertyName: string;
  community: string;
  priceText: string;
}

export default function Map({ lat, lng, propertyName, community, priceText }: MapProps) {
  useEffect(() => {
    // Leaflet side-effects
    return () => {};
  }, []);

  return (
    <div className="w-full h-full relative min-h-[300px]">
      <MapContainer 
        center={[lat, lng]} 
        zoom={14} 
        scrollWheelZoom={false}
        className="w-full h-full min-h-[300px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-xs text-white">{propertyName}</h4>
              <p className="text-[10px] text-zinc-400 mb-1">{community}</p>
              <p className="text-xs font-extrabold text-cyan-accent">{priceText} AED</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
