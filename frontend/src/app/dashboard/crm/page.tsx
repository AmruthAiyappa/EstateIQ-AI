"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, PlusCircle, Trash, RefreshCw, ChevronRight, 
  MapPin, DollarSign, Calendar, MessageSquare, Phone, Mail, FolderHeart
} from "lucide-react";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  budget: number;
  requirements: string;
  interested_properties: string;
  meeting_notes: string;
  follow_up_date: string;
  status: string;
}

interface Lead {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  budget: number;
  property_id: number;
  value: number;
  stage: string;
  last_contact: string;
  next_action: string;
  property_name: string;
}

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  // Add Client Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientBudget, setClientBudget] = useState("");
  const [clientReqs, setClientReqs] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [clientFollowUp, setClientFollowUp] = useState("");

  const pipelineStages = [
    "New Lead", "Contacted", "Meeting Scheduled", "Negotiation", "Closed", "Lost"
  ];

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const clientRes = await fetch("http://localhost:8000/api/crm/clients");
      const clientData = await clientRes.json();
      setClients(clientData);

      const leadRes = await fetch("http://localhost:8000/api/crm/leads");
      const leadData = await leadRes.json();
      setLeads(leadData);
    } catch (error) {
      console.error("Error loading CRM databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      budget: parseFloat(clientBudget) * 1000000,
      requirements: clientReqs,
      meeting_notes: clientNotes,
      follow_up_date: clientFollowUp,
      interested_properties: ""
    };

    try {
      const res = await fetch("http://localhost:8000/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Client registration failed");
      
      // Auto-create a matching lead in the Kanban board
      const clientData = await res.json();
      await fetch("http://localhost:8000/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          budget: clientData.budget,
          value: clientData.budget * 0.02, // Estimated 2% agency commission value
          stage: "New Lead",
          last_contact: new Date().toISOString().split("T")[0],
          next_action: "Introductory Call"
        })
      });

      // Reset Form
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setClientBudget("");
      setClientReqs("");
      setClientNotes("");
      setClientFollowUp("");
      setShowAddClientForm(false);
      
      fetchCRMData();
    } catch (error) {
      console.error(error);
      alert("Error adding client profile.");
    }
  };

  // Drag and Drop implementation
  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, stageName: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData("text/plain"));
    
    // Optimistic UI update
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, stage: stageName } : l);
    setLeads(updatedLeads);

    try {
      const res = await fetch(`http://localhost:8000/api/crm/leads/${leadId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageName })
      });
      if (!res.ok) throw new Error("Failed to update stage");
    } catch (error) {
      console.error(error);
      alert("Database sync failed. Reverting.");
      fetchCRMData(); // revert on fail
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1f]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Client Management & pipelines</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Drag and drop deals across pipeline stages and manage advisor-client profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddClientForm(!showAddClientForm)}
            className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-800 text-white transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-cyan-accent" />
            Add Client Profile
          </button>
          <button 
            onClick={fetchCRMData}
            className="p-1.5 rounded-lg border border-[#222227] bg-[#121215] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Client Form Expansion */}
      {showAddClientForm && (
        <div className="p-6 rounded-xl bg-[#121215] border border-[#222227]">
          <h3 className="text-sm font-bold text-white mb-4">Register Client Profile</h3>
          <form onSubmit={handleAddClient} className="grid md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Investment Budget (M AED)</label>
              <input
                type="number"
                step="0.1"
                required
                value={clientBudget}
                onChange={(e) => setClientBudget(e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={clientFollowUp}
                onChange={(e) => setClientFollowUp(e.target.value)}
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-zinc-500 mb-1">Requirements Description</label>
              <input
                type="text"
                value={clientReqs}
                onChange={(e) => setClientReqs(e.target.value)}
                placeholder="High yields in Downtown Emaar builds"
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-zinc-500 mb-1">Meeting Notes Summary</label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Enter client concerns, timelines, payment structures..."
                rows={3}
                className="w-full py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddClientForm(false)}
                className="py-2 px-4 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-6 rounded bg-gradient-to-r from-cyan-accent to-purple-accent text-black font-bold hover:opacity-90"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pipeline Board Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <FolderHeart className="w-4 h-4 text-cyan-accent" />
          Deal Pipeline Board (Kanban)
        </h3>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-zinc-600 text-xs">Loading Kanban workspace...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => {
              const stageLeads = leads.filter(l => l.stage === stage);
              const totalValue = stageLeads.reduce((acc, curr) => acc + Number(curr.budget), 0) / 1000000;
              return (
                <div
                  key={stage}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, stage)}
                  className="p-3 bg-[#0d0d0f] border border-[#1a1a1f] rounded-xl flex flex-col min-h-[300px] shrink-0 w-full min-w-[200px]"
                >
                  {/* Stage Header */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-900">
                    <div>
                      <h4 className="text-[11px] font-bold text-white truncate max-w-[120px]">{stage}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{stageLeads.length} deals</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-cyan-accent bg-cyan-950/20 px-1.5 py-0.5 rounded">
                      {totalValue.toFixed(1)}M
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px]">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead.id)}
                        className="p-3 bg-[#121215] border border-[#222227] hover:border-zinc-700 rounded-lg cursor-grab active:cursor-grabbing shadow transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h5 className="font-bold text-xs text-white truncate max-w-[120px]">
                            {lead.client_name}
                          </h5>
                          <span className="text-[9px] font-bold text-emerald-accent">
                            {(lead.budget/1000000).toFixed(1)}M
                          </span>
                        </div>
                        {lead.property_name ? (
                          <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                            {lead.property_name}
                          </p>
                        ) : (
                          <p className="text-[10px] text-zinc-600 italic mb-2">General Search</p>
                        )}
                        <div className="border-t border-zinc-900 pt-2 mt-1.5 text-[9px] text-zinc-500 flex justify-between items-center">
                          <span>Next: {lead.next_action || "Follow-up"}</span>
                          <span className="font-semibold">{lead.last_contact}</span>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="h-24 flex items-center justify-center border border-dashed border-zinc-900 rounded-lg text-[10px] text-zinc-700 italic">
                        Empty Stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CRM Client Profiles List */}
      <div className="p-6 rounded-xl bg-[#121215] border border-[#222227] shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider mb-4">
          <Users className="w-4 h-4 text-purple-accent" />
          Active Advisory Clients ({clients.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 pl-2">Client Details</th>
                <th className="pb-3 text-center">Investment Budget</th>
                <th className="pb-3">Advisory Requirements</th>
                <th className="pb-3">Logged Meeting Notes</th>
                <th className="pb-3 text-center">Next Action Date</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222227] text-xs text-zinc-400">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-zinc-600">Syncing CRM databases...</td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#18181f]/45 transition-colors align-top">
                  {/* Name and contacts */}
                  <td className="py-3.5 pl-2">
                    <span className="font-bold text-white block text-sm">{client.name}</span>
                    <span className="text-[10px] text-zinc-500 block flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 text-zinc-600" /> {client.phone || "No phone"}
                    </span>
                    <span className="text-[10px] text-zinc-500 block flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-zinc-600" /> {client.email}
                    </span>
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 text-center font-extrabold text-white">
                    {(client.budget/1000000).toFixed(2)}M AED
                  </td>

                  {/* Requirements */}
                  <td className="py-3.5 text-zinc-400 max-w-[200px] leading-relaxed break-words">
                    {client.requirements || "Not configured"}
                  </td>

                  {/* Meeting Notes */}
                  <td className="py-3.5 text-zinc-500 max-w-[250px] leading-relaxed break-words">
                    {client.meeting_notes || "No historical logs"}
                  </td>

                  {/* Follow-up date */}
                  <td className="py-3.5 text-center font-medium text-white flex justify-center items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-accent" />
                    {client.follow_up_date || "TBD"}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 text-right pr-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      client.status === "Active" 
                        ? "bg-emerald-950/20 text-emerald-accent border-emerald-800" 
                        : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    }`}>
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
