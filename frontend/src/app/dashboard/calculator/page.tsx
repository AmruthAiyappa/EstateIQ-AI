"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, Percent, DollarSign, Calendar, TrendingUp, 
  ArrowUpRight, RefreshCw, BarChart2, BookOpen
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function CalculatorPage() {
  const [mounted, setMounted] = useState(false);

  // 1. ROI Calculator State
  const [roiPrice, setRoiPrice] = useState("2000000"); // 2M AED
  const [roiDownPercent, setRoiDownPercent] = useState("25"); // 25% down
  const [roiRent, setRoiRent] = useState("140000"); // 140k annual rent
  const [roiMaint, setRoiMaint] = useState("15000"); // 15k maintenance
  const [roiApprRate, setRoiApprRate] = useState("6.5"); // 6.5% annual growth
  const [roiTerm, setRoiTerm] = useState("5"); // 5 year hold

  // ROI Outputs
  const [roiNetCashFlow, setRoiNetCashFlow] = useState(0);
  const [roiNetYield, setRoiNetYield] = useState(0);
  const [roiCapitalGain, setRoiCapitalGain] = useState(0);
  const [roiTotalProfit, setRoiTotalProfit] = useState(0);
  const [roiPercentage, setRoiPercentage] = useState(0);

  // 2. Mortgage Calculator State
  const [mortPrice, setMortPrice] = useState("2000000");
  const [mortDownPercent, setMortDownPercent] = useState("25");
  const [mortTerm, setMortTerm] = useState("25"); // 25 years
  const [mortRate, setMortRate] = useState("4.5"); // 4.5% interest

  // Mortgage Outputs
  const [mortMonthly, setMortMonthly] = useState(0);
  const [mortTotalInterest, setMortTotalInterest] = useState(0);
  const [mortTotalCost, setMortTotalCost] = useState(0);
  const [amortData, setAmortData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate ROI outputs when inputs change
  useEffect(() => {
    const price = parseFloat(roiPrice) || 0;
    const downPercent = parseFloat(roiDownPercent) || 0;
    const rent = parseFloat(roiRent) || 0;
    const maint = parseFloat(roiMaint) || 0;
    const apprRate = parseFloat(roiApprRate) / 100 || 0;
    const term = parseInt(roiTerm) || 1;

    // Calculation
    const downPayment = price * (downPercent / 100);
    const netCashFlowAnnual = rent - maint;
    const netYield = price > 0 ? (netCashFlowAnnual / price) * 100 : 0;

    // Capital gains: compound interest formula
    const futurePrice = price * Math.pow(1 + apprRate, term);
    const capitalGain = futurePrice - price;

    // Total Profit = Cumulative Net Cash Flow + Capital Gain
    const totalCashFlow = netCashFlowAnnual * term;
    const totalProfit = totalCashFlow + capitalGain;

    // ROI on Cash Invested (Downpayment)
    const totalROI = downPayment > 0 ? (totalProfit / downPayment) * 100 : 0;

    setRoiNetCashFlow(netCashFlowAnnual);
    setRoiNetYield(Number(netYield.toFixed(2)));
    setRoiCapitalGain(Math.round(capitalGain));
    setRoiTotalProfit(Math.round(totalProfit));
    setRoiPercentage(Number(totalROI.toFixed(1)));
  }, [roiPrice, roiDownPercent, roiRent, roiMaint, roiApprRate, roiTerm]);

  // Recalculate Mortgage outputs when inputs change
  useEffect(() => {
    const price = parseFloat(mortPrice) || 0;
    const downPercent = parseFloat(mortDownPercent) || 0;
    const term = parseInt(mortTerm) || 1;
    const rate = parseFloat(mortRate) || 0;

    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;

    if (loanAmount <= 0) {
      setMortMonthly(0);
      setMortTotalInterest(0);
      setMortTotalCost(0);
      setAmortData([]);
      return;
    }

    // Monthly interest rate
    const r = rate / 100 / 12;
    // Total monthly payments
    const n = term * 12;

    let monthlyPayment = 0;
    if (r > 0) {
      monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyPayment = loanAmount / n;
    }

    const totalCost = monthlyPayment * n;
    const totalInterest = totalCost - loanAmount;

    setMortMonthly(Math.round(monthlyPayment));
    setMortTotalInterest(Math.round(totalInterest));
    setMortTotalCost(Math.round(totalCost));

    // Generate amortization chart data (by Year)
    const data = [];
    let balance = loanAmount;
    let cumInterest = 0;

    for (let year = 1; year <= term; year++) {
      let interestPaidThisYear = 0;
      let principalPaidThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        const monthlyInterest = balance * r;
        const monthlyPrincipal = monthlyPayment - monthlyInterest;
        interestPaidThisYear += monthlyInterest;
        principalPaidThisYear += monthlyPrincipal;
        balance -= monthlyPrincipal;
      }

      cumInterest += interestPaidThisYear;
      data.push({
        year: `Yr ${year}`,
        Balance: Math.round(Math.max(0, balance)),
        Interest: Math.round(cumInterest)
      });
    }
    setAmortData(data);
  }, [mortPrice, mortDownPercent, mortTerm, mortRate]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Advisory Calculators</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Perform underwriting checkups on client deals including ROI cash flows and amortization profiles.
          </p>
        </div>
      </div>

      {/* ROI & Mortgage Grids */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* ROI Calculator Card */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-accent" />
            Property ROI Analysis Underwriter
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {/* Purchase Price */}
            <div>
              <label className="block text-zinc-500 mb-1">Purchase Price (AED)</label>
              <input
                type="number"
                value={roiPrice}
                onChange={(e) => setRoiPrice(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Down Payment % */}
            <div>
              <label className="block text-zinc-500 mb-1">Down Payment (%)</label>
              <input
                type="number"
                value={roiDownPercent}
                onChange={(e) => setRoiDownPercent(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Rent */}
            <div>
              <label className="block text-zinc-500 mb-1">Annual Rental Income (AED)</label>
              <input
                type="number"
                value={roiRent}
                onChange={(e) => setRoiRent(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Maintenance */}
            <div>
              <label className="block text-zinc-500 mb-1">Annual Maintenance Cost (AED)</label>
              <input
                type="number"
                value={roiMaint}
                onChange={(e) => setRoiMaint(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Appreciation */}
            <div>
              <label className="block text-zinc-500 mb-1">Annual Appreciation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={roiApprRate}
                onChange={(e) => setRoiApprRate(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Term */}
            <div>
              <label className="block text-zinc-500 mb-1">Holding Period (Years)</label>
              <select
                value={roiTerm}
                onChange={(e) => setRoiTerm(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
                <option value="7">7 Years</option>
                <option value="10">10 Years</option>
              </select>
            </div>
          </div>

          {/* Underwriting Outcomes */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3.5 text-xs">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Calculated Outcomes</h4>
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Net Annual Cash Flow:</span>
              <span className="font-bold text-white">{roiNetCashFlow.toLocaleString()} AED / year</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Net Rental Yield:</span>
              <span className="font-bold text-cyan-accent">{roiNetYield}% p.a.</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Term Capital Appreciation:</span>
              <span className="font-bold text-purple-accent">+{roiCapitalGain.toLocaleString()} AED</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Term Total Net Profit:</span>
              <span className="font-bold text-white">{roiTotalProfit.toLocaleString()} AED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Cash-on-Cash Return (ROI):</span>
              <span className="text-lg font-black text-emerald-accent">{roiPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Mortgage Calculator Card */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Percent className="w-4 h-4 text-cyan-accent" />
            Mortgage Debt Service Calculator
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {/* Purchase Price */}
            <div>
              <label className="block text-zinc-500 mb-1">Property Value (AED)</label>
              <input
                type="number"
                value={mortPrice}
                onChange={(e) => setMortPrice(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Down Payment % */}
            <div>
              <label className="block text-zinc-500 mb-1">Down Payment (%)</label>
              <input
                type="number"
                value={mortDownPercent}
                onChange={(e) => setMortDownPercent(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
            {/* Term */}
            <div>
              <label className="block text-zinc-500 mb-1">Loan Tenure (Years)</label>
              <select
                value={mortTerm}
                onChange={(e) => setMortTerm(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="15">15 Years</option>
                <option value="20">20 Years</option>
                <option value="25">25 Years</option>
                <option value="30">30 Years</option>
              </select>
            </div>
            {/* Rate */}
            <div>
              <label className="block text-zinc-500 mb-1">Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={mortRate}
                onChange={(e) => setMortRate(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Debt Service Outcomes */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3.5 text-xs">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Calculated Payments</h4>

            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Loan Principal Amount:</span>
              <span className="font-bold text-white">{(parseFloat(mortPrice) * (1 - parseFloat(mortDownPercent)/100)).toLocaleString()} AED</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Total Interest Payable:</span>
              <span className="font-bold text-purple-accent">{mortTotalInterest.toLocaleString()} AED</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Total Cost of Debt (Principal + Interest):</span>
              <span className="font-bold text-white">{mortTotalCost.toLocaleString()} AED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Monthly Mortgage Payment (P+I):</span>
              <span className="text-lg font-black text-cyan-accent">{mortMonthly.toLocaleString()} AED / month</span>
            </div>
          </div>
        </div>

      </div>

      {/* Amortization Chart visualizer */}
      <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wider">
          <BarChart2 className="w-4 h-4 text-cyan-accent" />
          Mortgage Amortization Schedule (Remaining Principal vs. Cumulative Interest)
        </h3>
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={amortData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222227" />
              <XAxis dataKey="year" stroke="#52525b" fontSize={10} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#121215", borderColor: "#222227", borderRadius: "8px" }}
                itemStyle={{ fontSize: "11px", color: "white" }}
                labelStyle={{ fontSize: "12px", color: "white", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="Balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" name="Remaining Principal" />
              <Area type="monotone" dataKey="Interest" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorInterest)" name="Cumulative Interest Paid" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
