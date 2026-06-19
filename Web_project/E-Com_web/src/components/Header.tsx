import React, { useState } from "react";
import { Search, Compass, MessageCircle, Lock, Menu, X, Gift, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  whatsappNumber: string;
}

export default function Header({
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  whatsappNumber
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "categories", label: "Categories" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact" },
    { id: "track", label: "Track Order" }
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Promotion bar */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 text-white text-xs py-2 px-4 text-center font-medium uppercase tracking-widest flex items-center justify-center gap-1.5">
        <Gift className="w-3.5 h-3.5 animate-pulse" />
        <span>Prestige Jewel Special: Complementary Solid Gift Case with Every Order</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand description */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick("home")}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl tracking-tight shadow-sm">
              S
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-wider text-slate-950 uppercase sm:block hidden">
                Siso shopping
              </span>
              <span className="text-[9px] text-slate-500 tracking-widest uppercase block -mt-1 font-montserrat">
                Tittakudi
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                    isActive ? "text-rose-600 font-semibold" : "text-slate-600 hover:text-rose-500"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Utilities (Search, Whatsapp, Admin Lock) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchExpanded ? (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Search exquisite jewelry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="border border-slate-200 rounded-full py-1.5 pl-4 pr-8 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 bg-slate-50 text-slate-900"
                    autoFocus
                  />
                ) : null}
              </AnimatePresence>
              <button
                onClick={() => {
                  if (isSearchExpanded && searchQuery.trim()) {
                    onSearchSubmit(searchQuery);
                  } else {
                    setIsSearchExpanded(!isSearchExpanded);
                  }
                }}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-full hover:bg-slate-50 transition"
                title="Search products"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Direct WhatsApp Contact Button */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer referrer"
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all shadow-xs border border-emerald-100"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-700" />
              <span>WhatsApp Us</span>
            </a>

            {/* Secret Administrator Key */}
            <button
              onClick={() => handleNavClick("admin")}
              className={`p-2.5 rounded-full border transition ${
                activePage === "admin"
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300"
              }`}
              title="Secret Administrator Management"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Utilities Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => {
                setActivePage("shop");
                setIsSearchExpanded(true);
              }}
              className="p-2 text-slate-500 hover:text-rose-500"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-rose-600 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 divide-y divide-slate-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-2.5 text-sm uppercase font-semibold tracking-wide ${
                    activePage === item.id ? "text-rose-600 bg-rose-50/50 rounded-lg" : "text-slate-600 hover:bg-slate-50 rounded-lg"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="px-4 py-4 space-y-3 bg-slate-50">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer referrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:bg-emerald-700"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Interact on WhatsApp</span>
              </a>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">Internal Administration Gate:</span>
                <button
                  onClick={() => handleNavClick("admin")}
                  className="flex items-center gap-1.5 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
