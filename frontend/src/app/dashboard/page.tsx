"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Flame, Percent, Landmark, 
  ArrowUpRight, RefreshCw, BarChart2, TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

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

interface Client {
  id: number;
  name: string;
  budget: number;
  status: string;
}

export default function HomeDashboard() {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats variables
  const [totalProps, setTotalProps] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [avgROI, setAvgROI] = useState(0);
  const [avgYield, setAvgYield] = useState(0);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch properties
      const propRes = await fetch("http://localhost:8000/api/properties");
      const propData: Property[] = await propRes.json();
      setProperties(propData);
      setTotalProps(propData.length);

      // 2. Fetch clients
      const clientRes = await fetch("http://localhost:8000/api/crm/clients");
      const clientData: Client[] = await clientRes.json();
      setClients(clientData);
      setTotalClients(clientData.length);

      // 3. Compute stats
      if (propData.length > 0) {
        const sumROI = propData.reduce((acc, p) => acc + Number(p.roi), 0);
        const sumYield = propData.reduce((acc, p) => acc + Number(p.rental_yield), 0);
        setAvgROI(Number((sumROI / propData.length).toFixed(2)));
        setAvgYield(Number((sumYield / propData.length).toFixed(2)));

        // 4. Community aggregations for charts
        const communityMap: { [key: string]: { count: number; sumYield: number; sumAppr: number; sumPrice: number } } = {};
        propData.forEach(p => {
          if (!communityMap[p.community]) {
            communityMap[p.community] = { count: 0, sumYield: 0, sumAppr: 0, sumPrice: 0 };
          }
          communityMap[p.community].count += 1;
          communityMap[p.community].sumYield += Number(p.rental_yield);
          communityMap[p.community].sumAppr += Number(p.future_appreciation);
          communityMap[p.community].sumPrice += Number(p.price);
        });

        // Chart Data for Community Averages
        const commData = Object.keys(communityMap).map(comm => ({
          name: comm,
          Yield: Number((communityMap[comm].sumYield / communityMap[comm].count).toFixed(1)),
          Appreciation: Number((communityMap[comm].sumAppr / communityMap[comm].count).toFixed(1)),
          AvgPriceM: Number((communityMap[comm].sumPrice / communityMap[comm].count / 1000000).toFixed(2)),
          count: communityMap[comm].count
        }));
        setChartData(commData);

        // Pie Chart Data for Community Distribution
        const distData = Object.keys(communityMap).map(comm => ({
          name: comm,
          value: communityMap[comm].count
        }));
        setDistributionData(distData);

        // Hotspots (Sort communities by sum of Yield + Appreciation)
        const sortedHotspots = commData.map(c => {
          const score = Number((c.Yield + c.Appreciation).toFixed(1));
          let index = "High";
          if (score > 15) index = "Critical Growth";
          else if (score > 13) index = "High Demand";
          return {
            community: c.name,
            avgYield: c.Yield,
            avgAppr: c.Appreciation,
            avgPrice: c.AvgPriceM,
            demandIndex: index
          };
        }).sort((a, b) => (b.avgYield + b.avgAppr) - (a.avgYield + a.avgAppr));
        setHotspots(sortedHotspots);
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Investment Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time Dubai real estate KPIs, yields, and comparative analytics.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#222227] bg-[#121215] text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Active Properties
            </p>
            <h3 className="text-3xl font-extrabold text-white">
              {loading ? "..." : totalProps}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <span className="text-cyan-accent font-semibold">100% curated</span> for luxury yields
            </p>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-cyan-accent shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Clients */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Managed Clients
            </p>
            <h3 className="text-3xl font-extrabold text-white">
              {loading ? "..." : totalClients}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <span className="text-purple-accent font-semibold">5 Active</span> CRM profiles
            </p>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-purple-accent shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average ROI */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Average ROI
            </p>
            <h3 className="text-3xl font-extrabold text-white">
              {loading ? "..." : `${avgROI}%`}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <span className="text-emerald-accent font-semibold">Combined returns</span> (appr + yield)
            </p>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-accent shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Average Yield */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Avg Rental Yield
            </p>
            <h3 className="text-3xl font-extrabold text-white">
              {loading ? "..." : `${avgYield}%`}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1">
              <span className="text-amber-accent font-semibold">Dubai market lead</span> vs global averages
            </p>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-amber-accent shrink-0">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart: Community Averages */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#121215] border border-[#222227]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-accent" />
            Average Yield & Appreciation by Community
          </h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#121215", borderColor: "#222227", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "11px" }}
                    labelStyle={{ fontSize: "12px", color: "white", fontWeight: "bold" }}
                  />
                  <Bar dataKey="Yield" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Rental Yield %" />
                  <Bar dataKey="Appreciation" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Capital Appr %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Community Property Distribution */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-purple-accent" />
            Asset Allocation by Community
          </h3>
          <div className="h-72 w-full flex flex-col justify-center items-center">
            {loading ? (
              <div className="text-xs text-zinc-500">Loading...</div>
            ) : (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#121215", borderColor: "#222227", borderRadius: "8px" }}
                        itemStyle={{ fontSize: "11px", color: "white" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legends */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-[10px] text-zinc-500">
                  {distributionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span>{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hotspots / Comm Table */}
      <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-accent animate-pulse" />
          Dubai Investment Hotspots Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3">Community</th>
                <th className="pb-3 text-center">Avg Price (AED)</th>
                <th className="pb-3 text-center">Avg Yield</th>
                <th className="pb-3 text-center">Avg Appreciation</th>
                <th className="pb-3 text-center">Total Return</th>
                <th className="pb-3 text-right">Demand Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222227] text-xs text-zinc-400">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-zinc-600">Loading hotspot data...</td>
                </tr>
              ) : (
                hotspots.map((h) => (
                  <tr key={h.community} className="hover:bg-[#18181f]/45 transition-colors">
                    <td className="py-3 font-semibold text-white">{h.community}</td>
                    <td className="py-3 text-center">{h.avgPrice.toFixed(2)}M</td>
                    <td className="py-3 text-center text-cyan-accent font-medium">{h.avgYield}%</td>
                    <td className="py-3 text-center text-purple-accent font-medium">{h.avgAppr}%</td>
                    <td className="py-3 text-center text-emerald-accent font-bold">{(h.avgYield + h.avgAppr).toFixed(1)}%</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        h.demandIndex === "Critical Growth" 
                          ? "bg-emerald-950/40 text-emerald-accent border-emerald-800" 
                          : "bg-cyan-950/40 text-cyan-accent border-cyan-800"
                      }`}>
                        {h.demandIndex}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
