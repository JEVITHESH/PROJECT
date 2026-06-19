import React, { useState, useEffect } from "react";
import { Package, Search, Calendar, Landmark, CheckCircle, ShieldAlert, ArrowUpDown, Truck, Gift } from "lucide-react";
import { api } from "../api";
import { Order } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TrackOrderProps {
  initialTrackerId: string;
}

export default function TrackOrder({ initialTrackerId }: TrackOrderProps) {
  const [trackerInput, setTrackerInput] = useState(initialTrackerId || "");
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Track immediately if seeded with an initial ID (e.g. redirected from Success checkout)
  useEffect(() => {
    if (initialTrackerId) {
      handleSearchTracking(initialTrackerId);
    }
  }, [initialTrackerId]);

  const handleSearchTracking = async (tracker: string) => {
    const cleanTracker = tracker.trim();
    if (!cleanTracker) return;

    setIsSearching(true);
    setHasSearched(true);
    setErrorText("");
    try {
      const res = await api.trackOrder(cleanTracker);
      setSearchResults(res);
      if (res.length === 0) {
        setErrorText("No orders matching this tracker ID or mobile phone can be found.");
      }
    } catch (e: any) {
      setErrorText("Error searching for order logs: " + e.message);
    } finally {
      setIsSearching(false);
    }
  };

  const statusProgressSteps = [
    { label: "Ordered Placed", status: "Pending", desc: "Siso shopping designers are reviewing packaging notes and initials." },
    { label: "Confirmed", status: "Confirmed", desc: "Order details approved. Material matching from vault complete." },
    { label: "Processing", status: "Processing", desc: "Polished PVD vacuum plating sequence initiated." },
    { label: "Dispatched", status: "Shipped", desc: "Siso shopping gift wrapping complete. Handed to priority courier." },
    { label: "Delivered", status: "Delivered", desc: "Consignment safely signed at target destination." }
  ];

  const getActiveStepIndex = (status: string) => {
    if (status === "Cancelled") return -1;
    return statusProgressSteps.findIndex((s) => s.status === status);
  };

  return (
    <div className="bg-white py-12 min-h-[80vh] text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Title */}
        <div className="text-center max-w-xl mx-auto">
          <Package className="w-8 h-8 text-rose-605 mx-auto mb-2 text-rose-600" />
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 tracking-tight">
            TRACK COURIER PARCEL
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Enter your unique order tracking code (e.g. AUR-12345) or customer phone number
          </p>
        </div>

        {/* Search Search Box */}
        <div className="bg-slate-50 border border-slate-100 p-5 sm:p-8 rounded-3xl max-w-xl mx-auto shadow-2xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchTracking(trackerInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                required
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-mono tracking-widest uppercase font-bold"
                placeholder="e.g. AUR-59281 or 9876543210"
                value={trackerInput}
                onChange={(e) => setTrackerInput(e.target.value)}
              />
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 font-bold text-xs text-white uppercase px-6 rounded-xl transition"
            >
              {isSearching ? "Searching..." : "Track"}
            </button>
          </form>

          {errorText && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200 mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}
        </div>

        {/* RESULTS RENDERING */}
        <div className="pt-4">
          <AnimatePresence>
            {hasSearched && searchResults.length > 0 ? (
              <div className="space-y-10">
                {searchResults.map((order) => {
                  const activeIndex = getActiveStepIndex(order.status);
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-8"
                    >
                      {/* Inbound identifier segment */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 text-xs">Tracking Order ID</span>
                            <span className="text-rose-600 font-mono text-xl font-extrabold tracking-wider">
                              {order.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Secured on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest pl-1">
                            Consignment Ship To
                          </span>
                          <span className="font-semibold text-slate-900 text-sm block">
                            {order.fullName}
                          </span>
                        </div>
                      </div>

                      {/* Items block */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            📦
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{order.productName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Quantity: {order.quantity} units</span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="hidden md:block text-[11px] text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg max-w-xs font-light truncate">
                            🎁 Included packaging notes: &ldquo;{order.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* CANCELLED HANDLE */}
                      {order.status === "Cancelled" ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-xs text-red-800 space-y-1">
                          <span className="font-extrabold text-red-700 block uppercase tracking-widest">
                            Order Voided / Cancelled
                          </span>
                          <p className="font-light">
                            This specific priority shipment has been flagged as voided or cancelled. For recovery, please chat on WhatsApp directly.
                          </p>
                        </div>
                      ) : (
                        /* DYNAMIC CHECKPOINT STATUS TIMELINE */
                        <div className="space-y-8 pt-4">
                          <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">
                            Consignment Checkpoint workflow
                          </h3>

                          <div className="relative">
                            {/* Running Line under check points */}
                            <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-100 md:left-6" />

                            <div className="space-y-6">
                              {statusProgressSteps.map((step, idx) => {
                                const isChecked = activeIndex >= idx;
                                const isCurrent = activeIndex === idx;

                                return (
                                  <div key={idx} className="flex gap-4 items-start relative group">
                                    {/* Indicator Check point ball */}
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition md:w-12 md:h-12 z-10 ${
                                        isCurrent
                                          ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-4 ring-rose-50 font-black animate-pulse"
                                          : isChecked
                                          ? "bg-slate-900 text-white"
                                          : "bg-slate-100 text-slate-400"
                                      }`}
                                    >
                                      {isChecked ? "✓" : idx + 1}
                                    </div>

                                    <div className="space-y-0.5 pt-1.5 md:pt-3">
                                      <h4
                                        className={`text-xs uppercase tracking-wider font-bold ${
                                          isCurrent
                                            ? "text-rose-600 font-extrabold"
                                            : isChecked
                                            ? "text-slate-950 font-bold"
                                            : "text-slate-400 font-semibold"
                                        }`}
                                      >
                                        {step.label}
                                      </h4>
                                      <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                                        {step.desc}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : null}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
