import React from "react";
import { Lock, Heart, Mail, Phone, MapPin, Sparkles, MessageCircle } from "lucide-react";

interface FooterProps {
  setActivePage: (page: string) => void;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
}

export default function Footer({
  setActivePage,
  contactAddress,
  contactPhone,
  contactEmail,
  whatsappNumber
}: FooterProps) {
  const years = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Presentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage("home")}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm tracking-tight">
                S
              </div>
              <span className="font-display font-semibold text-xl tracking-wider text-white uppercase">
                Siso shopping
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Crafting sparkling moments of timeless beauty. Luxury waterproof, hypoallergenic tarnish-free jewelry, customizable accessories, and premium premium gifts built for everyday splendor.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Luxury Velvet Jewelry Boxes Included</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Our Collections</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setActivePage("shop")} className="hover:text-rose-400 hover:underline transition">
                  Shop All Jewelry
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("categories")} className="hover:text-rose-400 hover:underline transition">
                  Browse by Category
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("track")} className="hover:text-rose-400 hover:underline transition font-medium text-rose-300">
                  Track Your Order
                </button>
              </li>
            </ul>
          </div>

          {/* Store Info */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Siso shopping</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setActivePage("about")} className="hover:text-rose-400 hover:underline transition">
                  About Our Founders
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage("contact")} className="hover:text-rose-400 hover:underline transition">
                  Contact Studio
                </button>
              </li>
              <li>
                <span className="text-slate-400 font-light block">Business values:</span>
                <span className="text-[10px] bg-slate-800 text-rose-300 px-2 py-1 rounded inline-block mt-1 font-mono uppercase tracking-wider">
                  Conflict-Free Cert.
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Address */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Corporate Office</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-light">{contactAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="font-light">{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="font-light">{contactEmail}</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Interactive Chat</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div>
            &copy; {years} Siso shopping, Tittakudi. All Premium Designs Reserved internationally.
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-light">
            Made with <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 mx-0.5" /> for premium styling.
            <button
              onClick={() => setActivePage("admin")}
              className="ml-4 p-1.5 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-slate-800/50 transition duration-300 flex items-center justify-center"
              title="Administrator Sign-In"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
