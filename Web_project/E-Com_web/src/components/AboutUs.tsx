import React from "react";
import { Award, Compass, Heart, Activity, ShieldAlert, Sparkles, Smile } from "lucide-react";
import { WebContent } from "../types";

interface AboutUsProps {
  content: WebContent | null;
}

export default function AboutUs({ content }: AboutUsProps) {
  const defaultStory = "Founded in Tittakudi, Siso shopping began with a singular, clear ambition: to build exquisite, masterfully crafted daily jewelry, fashion appliances, and gifts that express luxury without imposing prohibitive costs. We focus on gorgeous geometric elegance, clean lines, tarnish-free, waterproof materials, and meticulously polished stones. Each gemstone is individually selected, and every piece undergoes rigid high-accuracy QA testing to match premium standards.";
  const defaultVision = "To become the most dependable and beloved online house for custom fashion jewelry and gift selections, recognized worldwide for outstanding clarity, impeccable human centered service, and ethical conflict-free procurement.";
  const defaultMission = "We strive to create magnificent, deeply moving statements of self-expression. By combining modern computer-aided luxury design with timeless handcrafting techniques, we craft jewelry suitable for both daily joy and lifetime memories.";
  const defaultValues = [
    "Ethical Integrity: 100% conflicts-free, responsibly sourced diamonds and metals.",
    "Impeccable Longevity: Anti-tarnish technology, tarnish-free, waterproof materials.",
    "Artisanal Excellence: Highly detailed, hand-polished finishes from Master Craftspersons.",
    "Absolute Inclusivity: Sizing and adjustments made accessible for all backgrounds.",
    "Customer Centered: Seamless checkout, direct WhatsApp advice, and prompt 48-hour shipment tracking."
  ];

  const story = content?.aboutUs || defaultStory;
  const vision = content?.vision || defaultVision;
  const mission = content?.mission || defaultMission;
  const values = content?.values || defaultValues;

  const valueIcons = [Award, Compass, Heart, Smile, Activity];

  return (
    <div className="bg-white py-12 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 block bg-rose-50 inline-block px-3.5 py-1 rounded-full">
            Our Heritage & Purpose
          </span>
          <h1 className="font-display font-semibold text-3xl md:text-5xl text-slate-900 tracking-tight mt-3">
            THE STORY OF SISO SHOPPING
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Timeless craft, modern longevity, and conflict-free fine selections
          </p>
        </div>

        {/* 1. BRAND STORY & HERO SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
              EST. IN TITTAKUDI
            </span>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-950 tracking-tight leading-tight">
              Bridging the Gap Between Excessive Pricing & Poor Durability
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light font-sans whitespace-pre-wrap">
              {story}
            </p>
          </div>

          <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-widest leading-none">
              Ethical Stone Procurement Certified
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              We reject conflict-sourced gems. Every solitaire diamond and sapphire crystal is ethically procured. Our gold plating uses clean PVD physical vapor vacuum deposition, which emits zero wastewater pollutants.
            </p>
          </div>

        </div>

        {/* 2. VISION & MISSION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4 shadow-2xs">
            <div className="px-3.5 py-1 text-[9px] font-bold text-rose-600 bg-rose-50 rounded-full inline-block uppercase tracking-wider font-mono">
              Company Vision
            </div>
            <h3 className="font-display font-semibold text-xl text-slate-900">
              Honesty, Clarity & Trust
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {vision}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-4 shadow-2xs">
            <div className="px-3.5 py-1 text-[9px] font-bold text-rose-600 bg-rose-50 rounded-full inline-block uppercase tracking-wider font-mono">
              Company Mission
            </div>
            <h3 className="font-display font-semibold text-xl text-slate-900">
              Modern Design & Master finish
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {mission}
            </p>
          </div>

        </div>

        {/* 3. BUSINESS CORE VALUES */}
        <div className="pt-12 border-t border-slate-100 space-y-8">
          <div className="text-center max-w-sm mx-auto">
            <h2 className="font-display font-semibold text-3xl text-slate-900">
              OUR PILLARS OF LUXURY
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-light">
              These principles guide every sketch, weld, polish, and delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const parts = v.split(":");
              const title = parts[0] || "Value Pillar";
              const body = parts[1] || "";
              const Icon = valueIcons[i % valueIcons.length]!;

              return (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs hover:shadow-xs transition flex gap-4 pr-8">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider block">
                      {title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                      {body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
