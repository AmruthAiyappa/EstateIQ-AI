"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Brain, Sliders, Clipboard, Check, Sparkles, Building2, 
  MapPin, HelpCircle, AlertTriangle, ArrowRight, ShieldCheck, Flame, RefreshCw, PlusCircle
} from "lucide-react";

interface Property {
  id: number;
  property_name: string;
  developer: string;
  community: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url: string;
  rental_yield: number;
  future_appreciation: number;
  developer_rating: number;
  metro_distance: number;
}

interface Alternative {
  property: Property;
  investment_score: number;
  match_reason: string;
}

interface RecommendationResponse {
  best_property: Property;
  investment_score: number;
  rental_yield: number;
  expected_appreciation: number;
  roi: number;
  risk: string;
  liquidity: number;
  ai_explanation: string;
  client_pitch: string;
  alternatives: Alternative[];
}

export default function AIAdvisorPage() {
  // Form State
  const [budget, setBudget] = useState("3.5"); // in Millions AED
  const [goal, setGoal] = useState("Yield"); // Yield, Appreciation, Balanced
  const [risk, setRisk] = useState("Low"); // Low, Medium, High
  const [community, setCommunity] = useState("All");
  const [propType, setPropType] = useState("All");
  const [beds, setBeds] = useState("All");
  const [holdPeriod, setHoldPeriod] = useState("5");

  // Options from database
  const [communities, setCommunities] = useState<string[]>([]);

  // Results State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);

  // Copy Clipboard feedback
  const [copied, setCopied] = useState(false);

  // Objection Handler State
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null);
  const [objectionResponse, setObjectionResponse] = useState<string>("");
  const [loadingObjection, setLoadingObjection] = useState(false);

  // Interactive Meeting Mode States
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [meetingStep, setMeetingStep] = useState(1);
  const [meetingLogs, setMeetingLogs] = useState<string[]>([]);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedFeedback, setNotesSavedFeedback] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  // Fallback lists in case API fails
  const fallbackCommunities = [
    "Palm Jumeirah", "Downtown Dubai", "Dubai Marina", 
    "JBR", "Business Bay", "JVC", "Dubai Hills Estate", "Arabian Ranches"
  ];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/properties");
      const data: Property[] = await res.json();
      const comms = Array.from(new Set(data.map(p => p.community)));
      setCommunities(comms);
    } catch {
      setCommunities(fallbackCommunities);
    }
  };

  const getClientName = (budgetValueStr: string) => {
    const budgetVal = parseFloat(budgetValueStr);
    if (Math.abs(budgetVal - 3.5) < 0.2) return "Sarah Jenkins";
    if (Math.abs(budgetVal - 25.0) < 1.0) return "Marcus Aurelius";
    if (Math.abs(budgetVal - 8.0) < 0.5) return "Tariq Al-Mansoor";
    if (Math.abs(budgetVal - 1.8) < 0.2) return "Yuki Tanaka";
    if (Math.abs(budgetVal - 5.0) < 0.2) return "Michael Chang";
    return "Mr. Ahmed";
  };

  const getClientId = (name: string) => {
    if (name === "Sarah Jenkins") return 1;
    if (name === "Marcus Aurelius") return 2;
    if (name === "Tariq Al-Mansoor") return 3;
    if (name === "Yuki Tanaka") return 4;
    if (name === "Michael Chang") return 5;
    return 1;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSelectedObjection(null);
    setObjectionResponse("");
    setIsMeetingMode(false);

    const payload = {
      budget: parseFloat(budget) * 1000000,
      investment_goal: goal,
      risk_level: risk,
      bedrooms: beds === "All" ? null : parseInt(beds),
      property_type: propType === "All" ? null : propType,
      preferred_community: community === "All" ? null : community,
      holding_period: parseInt(holdPeriod)
    };

    try {
      const res = await fetch("http://localhost:8000/api/advisor/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Recommendation failed");
      const data: RecommendationResponse = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error generating recommendation. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.client_pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleObjectionClick = async (objectionText: string) => {
    if (!result) return;
    setSelectedObjection(objectionText);
    setLoadingObjection(true);
    setObjectionResponse("");

    try {
      const res = await fetch("http://localhost:8000/api/advisor/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: result.best_property.id,
          objection_type: objectionText
        })
      });
      if (!res.ok) throw new Error("Objection handling failed");
      const data = await res.json();
      setObjectionResponse(data.rebuttal);
    } catch (error) {
      console.error(error);
      const fallback = getFallbackObjectionLocal(
        result.best_property.property_name,
        result.best_property.community,
        result.best_property.developer,
        result.best_property.rental_yield,
        result.best_property.future_appreciation,
        result.best_property.developer_rating,
        result.best_property.metro_distance,
        result.best_property.price,
        objectionText
      );
      setObjectionResponse(fallback);
    } finally {
      setLoadingObjection(false);
    }
  };

  // Simulated Consultation Mode Methods
  const startClientMeeting = () => {
    setIsMeetingMode(true);
    setMeetingStep(1);
    const client = getClientName(budget);
    setMeetingLogs([
      `SYSTEM: Consultation session started with Client: ${client} (Target budget: ${budget}M AED | Goal: ${goal})`,
      `MANAGER: Good afternoon, ${client.split(" ")[0]}. Based on your ${budget}M AED budget and preference for ${goal.toLowerCase()} investments, I've analyzed the listings and compiled a shortlist. My primary recommendation is ${result?.best_property.property_name} developed by ${result?.best_property.developer} in ${result?.best_property.community}.`,
      `CLIENT: That sounds interesting, and the ${result?.investment_score}/100 alignment score is impressive. Can you walk me through your investment thesis? Why did you select this specific asset?`
    ]);
  };

  const handleStep1Submit = () => {
    if (!result) return;
    setMeetingLogs(prev => [
      ...prev,
      `MANAGER: Certainly. My thesis for this asset is built on its excellent cash metrics. ${result.ai_explanation}`,
      `CLIENT: I see the financial logic. The projected yield of ${result.rental_yield}% and annual appreciation of ${result.expected_appreciation}% are compelling. However, before proceeding, I have a few specific queries I need clarified.`
    ]);
    setMeetingStep(2);
  };

  const getObjectionQuestion = (obj: string) => {
    if (obj === "Price too high") return "The asking price seems quite high compared to other communities. Can you justify this entry price?";
    if (obj === "Yield is low") return "The rental yield is slightly lower than some high-density JVC projects. Why should I accept a lower yield?";
    if (obj === "Not Emaar") return "This developer is not Emaar. Should I be concerned about structural quality or build delivery delay?";
    return "This property is not directly on the metro line. Won't that hurt its occupancy rate?";
  };

  const getFallbackObjectionLocal = (propName: string, community: string, developer: string, yieldVal: number, apprVal: number, rating: number, metro: number, price: number, objType: string) => {
    const priceFormatted = `${(price/1000000).toFixed(2)}M`;
    if (objType === "Price too high") {
      return `I understand your perspective on the ${priceFormatted} AED price point. However, looking at the fundamentals of ${community}, this asset trades at a premium due to its developer pedigree (${developer}) and exceptional infrastructure. With an expected annual capital appreciation of ${apprVal}%, the entry price is justified as historical data shows that prime properties in ${community} absorb market corrections far better than lower-tier properties.`;
    } else if (objType === "Yield is low") {
      return `It's true that a ${yieldVal}% yield is slightly lower than some high-density projects in outer areas. However, this property is situated in ${community}, which is a blue-chip community. The lower yield reflects the safety and liquidity of this location. Crucially, the tradeoff is a significantly higher capital appreciation rate of ${apprVal}% per year.`;
    } else if (objType === "Not Emaar") {
      return `Emaar is indeed the market benchmark, but ${developer} is a top-tier luxury developer rated at ${rating}/10. By investing in a project by ${developer}, you are securing a higher level of bespoke finishing and interior design. Furthermore, developments by ${developer} in ${community} have historically commanded a 12-15% rental premium on the secondary market.`;
    } else {
      return `While this property is ${metro} km from the nearest metro, this is actually a positive driver for this specific asset class. Luxury buyers and high-income family tenants in ${community} prefer the tranquility and privacy of residential enclaves, away from heavy foot-traffic areas near transit hubs. Proximity to schools and premium retail malls has a much higher correlation with rental retention here.`;
    }
  };

  const handleObjectionInMeeting = async (objectionText: string) => {
    if (!result) return;
    setLoadingObjection(true);
    
    setMeetingLogs(prev => [
      ...prev,
      `CLIENT: ${getObjectionQuestion(objectionText)}`
    ]);

    try {
      const res = await fetch("http://localhost:8000/api/advisor/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: result.best_property.id,
          objection_type: objectionText
        })
      });
      const data = await res.json();
      
      setMeetingLogs(prev => [
        ...prev,
        `MANAGER: ${data.rebuttal}`,
        `CLIENT: That's a highly logical explanation. It addresses my concern regarding ${objectionText.toLowerCase()}.`
      ]);
    } catch {
      const fallback = getFallbackObjectionLocal(
        result.best_property.property_name,
        result.best_property.community,
        result.best_property.developer,
        result.best_property.rental_yield,
        result.best_property.future_appreciation,
        result.best_property.developer_rating,
        result.best_property.metro_distance,
        result.best_property.price,
        objectionText
      );
      setMeetingLogs(prev => [
        ...prev,
        `MANAGER: ${fallback}`,
        `CLIENT: That makes perfect sense. Thank you for clarifying.`
      ]);
    } finally {
      setLoadingObjection(false);
    }
  };

  const proceedToStep3 = () => {
    setMeetingLogs(prev => [
      ...prev,
      `CLIENT: I'm comfortable with the fundamentals. What are our next steps?`,
      `MANAGER: Excellent. I recommend we draft the official advisory proposal. I will document this recommendation, set a follow-up action, and we can schedule a physical site viewing.`,
      `CLIENT: Perfect. Let's wrap this up. Please log this consultation summary under my client file.`
    ]);
    setMeetingStep(3);
  };

  const compileSummaryAndStep4 = () => {
    if (!result) return;
    const client = getClientName(budget);
    const date = new Date();
    date.setDate(date.getDate() + 4);
    const followUpDate = date.toISOString().split("T")[0];

    const summary = (
      `ACQUISITION ADVISORY CONSULTATION SUMMARY\n` +
      `-----------------------------------------\n` +
      `Client Profile: ${client} (${goal} Investor | Risk: ${risk})\n` +
      `Asset Recommended: ${result.best_property.property_name} (${result.best_property.community})\n` +
      `Acquisition Price: ${(result.best_property.price/1000000).toFixed(2)}M AED\n` +
      `Key Underwriting: Yield ${result.rental_yield}%, Appreciation ${result.expected_appreciation}%, Score ${result.investment_score}/100\n` +
      `Meeting Logs: Discussed client goals and resolved structural queries.\n` +
      `Next Action: Scheduled physical site viewing and unit selection review.\n` +
      `Target Follow-up: ${followUpDate}`
    );

    setConsultationNotes(summary);
    setMeetingStep(4);
  };

  const saveSummaryToCRM = async () => {
    if (!result) return;
    setIsSavingNotes(true);
    const client = getClientName(budget);
    const clientId = getClientId(client);
    
    const date = new Date();
    date.setDate(date.getDate() + 4);
    const followUpDate = date.toISOString().split("T")[0];

    try {
      const res = await fetch(`http://localhost:8000/api/crm/clients/${clientId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_notes: consultationNotes,
          follow_up_date: followUpDate
        })
      });
      if (res.ok) {
        setNotesSavedFeedback(true);
        setTimeout(() => setNotesSavedFeedback(false), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to sync summary with Client CRM database.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const copyWhatsApp = () => {
    if (!result) return;
    const client = getClientName(budget);
    const date = new Date();
    date.setDate(date.getDate() + 4);
    const followUpDate = date.toISOString().split("T")[0];

    const text = (
      `Hi ${client.split(" ")[0]},\n\n` +
      `Thank you for taking the time to meet today.\n\n` +
      `Based on our discussion, I recommend the *${result.best_property.property_name}* in ${result.best_property.community}.\n\n` +
      `Key Financials:\n` +
      `- Price: ${(result.best_property.price/1000000).toFixed(2)}M AED\n` +
      `- Rental Yield: ${result.rental_yield}%\n` +
      `- Capital Gain projection: ${result.expected_appreciation}% p.a.\n` +
      `- Investment Score: *${result.investment_score}/100*\n\n` +
      `I've logged this consultation summary under your profile. Let's connect on *${followUpDate}* to schedule a physical viewing.\n\n` +
      `Best regards,\n` +
      `EstateIQ AI Advisory`
    );

    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 2000);
  };

  const renderMeetingMode = () => {
    if (!result) return null;
    const client = getClientName(budget);
    
    return (
      <div className="space-y-6">
        {/* Meeting Header */}
        <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-purple-950/20 to-[#121215] border border-purple-900/40 shadow-lg">
          <div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-900 text-[10px] font-bold text-emerald-accent uppercase tracking-widest animate-pulse">
              Active Client Consultation
            </span>
            <h3 className="font-bold text-white text-base mt-1.5">Meeting with {client}</h3>
            <p className="text-[10px] text-zinc-500">
              Budget: {budget}M AED | Goal: {goal} | Risk: {risk} | Asset: {result.best_property.property_name}
            </p>
          </div>
          <button
            onClick={() => setIsMeetingMode(false)}
            className="px-3 py-1.5 rounded-lg border border-[#222227] bg-[#121215] hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            End Meeting
          </button>
        </div>

        {/* Dialogue Console Box */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main conversation logs panel */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#121215] border border-[#222227] flex flex-col h-[460px]">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Dialogue Log</h4>
            
            {/* Scrollable messages box */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4">
              {meetingLogs.map((log, idx) => {
                const isSystem = log.startsWith("SYSTEM:");
                const isManager = log.startsWith("MANAGER:");
                
                if (isSystem) {
                  return (
                    <div key={idx} className="text-center text-[10px] text-zinc-600 font-semibold italic py-1 border-y border-zinc-900/60 my-2">
                      {log.replace("SYSTEM:", "")}
                    </div>
                  );
                }
                
                const sender = isManager ? "You (Advisor)" : client;
                const text = isManager ? log.replace("MANAGER:", "") : log.replace("CLIENT:", "");
                
                return (
                  <div key={idx} className={`flex flex-col ${isManager ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] font-bold text-zinc-500 mb-1">{sender}</span>
                    <div className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                      isManager 
                        ? "bg-[#1f1f27] text-white rounded-tr-none border border-zinc-800" 
                        : "bg-purple-950/20 text-purple-accent border border-purple-900/30 rounded-tl-none"
                    }`}>
                      {text}
                    </div>
                  </div>
                );
              })}
              {loadingObjection && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 italic">
                  <span className="w-3 h-3 border-2 border-purple-accent border-t-transparent rounded-full animate-spin"></span>
                  Client is listening to your response...
                </div>
              )}
            </div>

            {/* Interactive choices at the bottom of dialogue */}
            <div className="border-t border-zinc-900 pt-4 shrink-0">
              {meetingStep === 1 && (
                <button
                  onClick={handleStep1Submit}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-extrabold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  Present Recommended Property Rationale
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {meetingStep === 2 && !loadingObjection && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                    Simulate Client Objections & Respond with AI:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleObjectionInMeeting("Price too high")}
                      className="py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                      "Price seems too high"
                    </button>
                    <button
                      onClick={() => handleObjectionInMeeting("Yield is low")}
                      className="py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                      "Yield seems low"
                    </button>
                    <button
                      onClick={() => handleObjectionInMeeting("Not Emaar")}
                      className="py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                      "Developer is not Emaar"
                    </button>
                    <button
                      onClick={() => handleObjectionInMeeting("Location far from Metro")}
                      className="py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                      "Not close to Metro"
                    </button>
                  </div>
                  <button
                    onClick={proceedToStep3}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    Proceed to Deal Closure
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {meetingStep === 3 && (
                <button
                  onClick={compileSummaryAndStep4}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-accent to-cyan-accent text-black font-extrabold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  Generate Consultation Summary & Wrap-up
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {meetingStep === 4 && (
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-500 italic">Consultation completed successfully.</p>
                  <button
                    onClick={() => setIsMeetingMode(false)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Return to Advisor Home
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Summary, WhatsApp, and CRM logs (Only visible in step 4) */}
          <div className="space-y-6">
            {meetingStep < 4 ? (
              <div className="p-6 rounded-xl bg-zinc-950 border border-[#222227] h-full flex flex-col justify-center items-center text-center text-zinc-500 min-h-[300px]">
                <Brain className="w-8 h-8 text-zinc-800 mb-3 animate-pulse" />
                <h4 className="font-bold text-zinc-400 text-xs mb-1">Consultation in Progress</h4>
                <p className="text-[10px] text-zinc-600 max-w-xs leading-relaxed">
                  Go through the dialogue stages on the left. Present rationale and resolve client concerns to compile the summary report.
                </p>
              </div>
            ) : (
              <>
                {/* Meeting Summary Card */}
                <div className="p-5 rounded-xl bg-[#121215] border border-[#222227] space-y-4 shadow-lg">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Advisory Meeting Summary
                  </h4>
                  <textarea
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    rows={8}
                    className="w-full p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-[11px] text-zinc-400 leading-relaxed font-mono focus:outline-none"
                  />
                  
                  <button
                    onClick={saveSummaryToCRM}
                    disabled={isSavingNotes}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-accent to-cyan-accent text-black font-extrabold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {isSavingNotes ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    ) : notesSavedFeedback ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-800" />
                        Saved to CRM database!
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Save Summary to Client CRM Profile
                      </>
                    )}
                  </button>
                </div>

                {/* Copy WhatsApp Card */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#121215] to-[#12121e] border border-zinc-800/40 text-center shadow-lg">
                  <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                    Generate a copy-ready WhatsApp message to send to the client following up on this meeting.
                  </p>
                  <button
                    onClick={copyWhatsApp}
                    className="w-full py-2 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-bold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                  >
                    {whatsappCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-950" />
                        WhatsApp Pitch Copied!
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        Generate WhatsApp Pitch
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    );
  };

  const renderResultsContent = () => {
    if (isMeetingMode) return renderMeetingMode();
    if (!result) return null;

    return (
      <div className="space-y-6">
        {/* Meeting Mode Trigger Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-950/20 to-[#121215] border border-purple-900/45 shadow-md">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-accent animate-pulse" />
              Advisory Consultation Simulation
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Simulate a live client sales presentation with automated objection handling responses.</p>
          </div>
          <button
            onClick={startClientMeeting}
            className="px-4 py-2 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-extrabold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Client Meeting
          </button>
        </div>

        {/* Primary Recommended Property Block */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/20 border border-cyan-900 rounded-full w-fit mb-4">
            <Flame className="w-3.5 h-3.5 text-cyan-accent animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-accent uppercase tracking-widest">
              Best Investment Alignment
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Property Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 md:col-span-2">
              <div className="h-44 rounded-lg bg-zinc-800 bg-cover bg-center mb-4 relative" style={{ backgroundImage: `url(${result.best_property.image_url})` }}>
                <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                  {result.best_property.property_type}
                </span>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-base text-white">{result.best_property.property_name}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {result.best_property.community} • Developed by {result.best_property.developer}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">{(result.best_property.price/1000000).toFixed(2)}M AED</span>
                  <span className="block text-[9px] text-zinc-500">{result.best_property.bedrooms} Bed / {result.best_property.bathrooms} Bath</span>
                </div>
              </div>
            </div>

            {/* Score gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl h-full text-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Alignment Rating</span>
              
              {/* Circle Score Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                <div className="absolute inset-1 rounded-full border border-dashed border-zinc-700"></div>
                <div className="text-center">
                  <span className="text-3xl font-black text-white">{result.investment_score}</span>
                  <span className="block text-[8px] text-zinc-500 font-bold uppercase tracking-wider">score</span>
                </div>
              </div>
              
              <div className="w-full flex justify-between gap-1 text-[10px] border-t border-zinc-800 pt-3 mt-1 text-zinc-500">
                <div>
                  <span>Yield: </span>
                  <span className="font-bold text-cyan-accent">{result.rental_yield}%</span>
                </div>
                <div>
                  <span>Appr: </span>
                  <span className="font-bold text-purple-accent">{result.expected_appreciation}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Explanation Box */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-950 border border-zinc-900">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-accent" />
              Advisory Investment Thesis
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{result.ai_explanation}</p>
          </div>
        </div>

        {/* Explain Like an Investment Manager Panel */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-accent" />
              Explain Like an Investment Manager (Pitch Generator)
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-semibold hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-accent" />
                  Pitch Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  Copy Pitch Code
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg max-h-56 overflow-y-auto">
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed">
              {result.client_pitch}
            </pre>
          </div>
        </div>

        {/* Objection Handling Simulator Card */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-accent" />
            Objection Handling Simulator
          </h3>
          <p className="text-[11px] text-zinc-500">
            Select a common client objection to generate a metrics-backed sales rebuttal for this property.
          </p>

          {/* Objection buttons grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["Price too high", "Yield is low", "Not Emaar", "Location far from Metro"].map(obj => {
              const isActive = selectedObjection === obj;
              return (
                <button
                  key={obj}
                  type="button"
                  onClick={() => handleObjectionClick(obj)}
                  className={`py-2 px-2.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isActive
                      ? "bg-amber-950/20 text-amber-accent border-amber-600"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  "{obj}"
                </button>
              );
            })}
          </div>

          {/* Objection Rebuttal Output */}
          {selectedObjection && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 mt-4 min-h-[80px] flex items-center">
              {loadingObjection ? (
                <div className="flex items-center gap-2 mx-auto text-xs text-zinc-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-accent" />
                  Generating expert objection rebuttal...
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/20 text-amber-accent border-amber-900 uppercase">
                    Objection Handler Rebuttal
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {objectionResponse}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alternative properties list */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-accent" />
            Secondary Alternative Options
          </h3>
          <div className="space-y-4">
            {result.alternatives.map((alt, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-xs text-white">{alt.property.property_name}</h4>
                  <p className="text-[10px] text-zinc-500">{alt.property.community} • developed by {alt.property.developer}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{alt.match_reason}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-accent block">Score: {alt.investment_score}/100</span>
                  <span className="text-xs font-bold text-white block">{(alt.property.price/1000000).toFixed(2)}M AED</span>
                  <Link 
                    href={`/dashboard/properties/${alt.property.id}`}
                    className="text-[10px] text-cyan-accent font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
                  >
                    View Details
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Investment Advisor</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Input client constraints to generate metrics-driven property recommendations, pitches, and handle objections.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side - Questionnaire Form */}
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-accent" />
            Client Criteria Questionnaire
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Budget */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Target Budget (AED)
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="1.8">1.8 Million (e.g. Yuki Tanaka)</option>
                <option value="3.5">3.5 Million (e.g. Sarah Jenkins)</option>
                <option value="5.0">5.0 Million (e.g. Michael Chang)</option>
                <option value="8.0">8.0 Million (e.g. Tariq Al-Mansoor)</option>
                <option value="25.0">25.0 Million (e.g. Marcus Aurelius)</option>
              </select>
            </div>

            {/* Investment Goal */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Primary Investment Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="Yield">High Rental Yield (Passive Income)</option>
                <option value="Appreciation">Capital Appreciation (Growth)</option>
                <option value="Balanced">Balanced Profile (Stable & Yield)</option>
              </select>
            </div>

            {/* Risk tolerance */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Risk Tolerance Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Low", "Medium", "High"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRisk(r)}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      risk === r 
                        ? "bg-[#1f1f27] border-zinc-700 text-white" 
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Hold period */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Holding Horizon (Years)
              </label>
              <select
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="3">3 Years (Short Term)</option>
                <option value="5">5 Years (Medium Term)</option>
                <option value="10">10 Years (Long Term)</option>
              </select>
            </div>

            {/* Preferred Community */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Preferred Community
              </label>
              <select
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="All">All Communities</option>
                {communities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Property type */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Asset Type
              </label>
              <select
                value={propType}
                onChange={(e) => setPropType(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>

            {/* Beds */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                Bedrooms
              </label>
              <select
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full py-2.5 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-medium focus:outline-none"
              >
                <option value="All">All Bedrooms</option>
                <option value="0">Studio</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Bed</option>
                <option value="3">3 Bed</option>
                <option value="4">4 Bed</option>
                <option value="5">5+ Bed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-extrabold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Recommendation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side - Recommendation Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="p-8 rounded-xl bg-[#121215]/50 border border-[#222227] h-64 flex flex-col justify-center items-center text-center">
              <div className="w-10 h-10 border-4 border-purple-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="font-bold text-white mb-1">EstateIQ AI Advisor Working</h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Filtering properties, adjusting scoring weights based on client goal, penalizing risk tolerances, and prompting OpenAI GPT for matching pitches...
              </p>
            </div>
          ) : !result ? (
            <div className="p-8 rounded-xl bg-[#121215]/30 border border-dashed border-[#222227] h-64 flex flex-col justify-center items-center text-center">
              <Sparkles className="w-10 h-10 text-zinc-700 mb-4 animate-pulse" />
              <h3 className="font-bold text-zinc-400 mb-1">Advisory Workspace Ready</h3>
              <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
                Submit the client questionnaire on the left to compute the optimal properties and sales pitches.
              </p>
            </div>
          ) : (
            renderResultsContent()
          )}
        </div>
      </div>
    </div>
  );
}
