import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Heart, ShieldCheck } from "lucide-react";
import { WebContent } from "../types";

interface ContactProps {
  content: WebContent | null;
}

export default function Contact({ content }: ContactProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const phone = content?.contactPhone || "+91 8015449688";
  const email = content?.contactEmail || "contact@sisoshopping.com";
  const address = content?.contactAddress || "Siso shopping, Tittakudi";
  const whatsapp = content?.whatsappNumber || "8015449688";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSendSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="bg-white py-12 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto">
          <Mail className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 tracking-tight">
            CONCIERGE DESK
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Get in touch for customized bridal rings or anniversary engraving notes
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* A. Left Contact channels */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
              <h3 className="text-slate-900 font-display font-semibold text-lg border-b border-slate-200 pb-2">
                Siso shopping Head Office
              </h3>

              <div className="space-y-4 text-xs font-light">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">
                      Corporate Address
                    </span>
                    <span className="text-slate-700 font-light leading-relaxed">{address}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">
                      Store Hotline & Concierge
                    </span>
                    <span className="text-slate-700 font-bold">{phone}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">
                      Electronic Mail
                    </span>
                    <span className="text-slate-700 font-mono font-medium">{email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Messaging channels:
                </span>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-3.5 rounded-xl transition shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Start WhatsApp Consultation</span>
                </a>
              </div>
            </div>
          </div>

          {/* B. Center Mail Form dispatch */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h2 className="font-display font-semibold text-2xl text-slate-900 uppercase">Dispatch Mailbox</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-light">
                Submit an inquiry, and our jewelry specialists will follow up in under 12 hours.
              </p>
            </div>

            {sendSuccess && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                <span>🎉 Message delivered successfully. Our concierge will contact you shortly!</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    placeholder="e.g. Elena"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Email Coordinate
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    placeholder="e.g. elena@example.com"
                    value={form.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Message inquiry details (engravings, sizing)
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  placeholder="e.g. Writing to check if you can craft the Classic Diamond Solitaire Ring in size 5.5 in Platinum finish?"
                  value={form.message}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition flex justify-center items-center gap-2"
              >
                {isSending ? (
                  <span>Dispatching digital envelope...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* 3. PREMIUM GOOGLE MAP PLACEHOLDER */}
        <div className="pt-4">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
            <h3 className="font-display font-semibold text-xl text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Siso shopping Showroom</span>
            </h3>

            {/* Simulated map element that looks modern, clean & artistic */}
            <div className="relative h-72 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex flex-col justify-center items-center text-center px-4">
              {/* background grid decoration */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />
              <div className="z-10 space-y-2">
                <MapPin className="w-10 h-10 text-rose-550 mx-auto animate-bounce mt-4" />
                <span className="font-bold text-xs uppercase tracking-widest text-slate-900 block font-mono">
                  Siso Maps Integration Anchor
                </span>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Located premiumly within Tittakudi. Open daily: Mon-Sun 9am to 9pm.
                </p>
                <div className="inline-block bg-slate-900 text-white text-[9px] font-mono font-bold uppercase tracking-widest py-1 px-3 rounded-full mt-4">
                  Coordinates: 11.4116° N, 79.1171° E
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
