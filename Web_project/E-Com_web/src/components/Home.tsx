import React, { useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Heart, Award, HelpCircle, Mail, MapPin } from "lucide-react";
import { Product, Banner, WebContent, Category } from "../types";
import { motion } from "motion/react";

interface HomeProps {
  products: Product[];
  banners: Banner[];
  content: WebContent | null;
  categories: Category[];
  setActivePage: (page: string) => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

export default function Home({
  products,
  banners,
  content,
  categories,
  setActivePage,
  setSelectedProduct,
  setSelectedCategory
}: HomeProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscriptionOk, setSubscriptionOk] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Active Banners
  const activeBanners = banners.filter((b) => b.isActive);
  const mainBanner = activeBanners[0] || {
    title: "Timeless Fine Accessories For Grace & Style",
    subtitle: "Anti-Tarnish Daily Wear Fine Jewelry & Custom Gifts",
    offerText: "Complementary Premium Gift Case & Velvet Wrap On Every Purchase",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=80"
  };

  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  const stats = [
    { label: "Design Portfolios", value: content?.designPortfolios || "850+", icon: Sparkles },
    { label: "Ethical conflict certification", value: "100%", icon: ShieldCheck },
    { label: "Client reviews", value: content?.clientReviews || "15k+", icon: Heart },
    { label: "Artisanal awards", value: content?.artisanalAwards || "12", icon: Award }
  ];

  const categoriesList = categories.slice(0, 4).map((c) => ({
    name: c.name,
    desc: c.tagline || c.description,
    img: c.image
  }));

  const handleCategoryClick = (catName: string) => {
    const found = categories.find(m => m.name.toLowerCase() === catName.toLowerCase())?.name || "All";
    setSelectedCategory(found);
    setActivePage("shop");
  };

  const handleProductClick = (prod: Product) => {
    setSelectedProduct(prod);
    setActivePage("product-details");
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscriptionOk(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscriptionOk(false), 5000);
    }
  };

  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* 1. HERO SLIDER HEADER BANNER */}
      <section className="relative min-h-[75vh] flex items-center bg-slate-900 overflow-hidden">
        {/* Underlay Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={mainBanner.imageUrl}
            alt="Jewelry main"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transform animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 z-10 relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl text-white space-y-6"
          >
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
              {mainBanner.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-light max-w-lg leading-relaxed">
              {mainBanner.subtitle}
            </p>

            {mainBanner.offerText && !mainBanner.offerText.includes("Summer Prestige") && (
              <div className="text-xs text-amber-300 font-mono tracking-wide bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md">
                ⭐ {mainBanner.offerText}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setActivePage("shop")}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm"
              >
                <span>Explore Shop Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </button>
              <button
                onClick={() => setActivePage("categories")}
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-full transition-all duration-300 text-center"
              >
                Category Highlights
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS VALUES */}
      <section className="bg-slate-50 py-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="flex items-center gap-3 justify-center text-center sm:text-left">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-montserrat font-bold text-base sm:text-xl text-slate-900 block leading-none">
                      {s.value}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block mt-1">
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES INDEX GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display font-semibold text-3xl text-slate-900 tracking-tight">SHOP BY LUXURY CATEGORIES</h2>
            <p className="text-xs text-slate-400 mt-2 font-sans font-light">
              Meticulously engineered, anti-tarnish fine jewelry designed to match every occasion and self-expression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesList.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cat.name)}
                className="group cursor-pointer bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-md transition duration-300"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/20 transition duration-300" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 group-hover:text-rose-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-light">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-rose-600 block pl-1">
                ⭐⭐⭐⭐⭐ Verified Purchases
              </span>
              <h2 className="font-display font-semibold text-3xl text-slate-900 tracking-tight mt-1">
                OUR BEST-SELLING DESIGNS
              </h2>
            </div>
            <button
              onClick={() => setActivePage("shop")}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider flex items-center gap-1.5 self-start group"
            >
              <span>Explore full shop</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <div
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-lg transition duration-350"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-bold uppercase py-1 px-2.5 rounded-full tracking-wider">
                    Best Seller
                  </div>
                  {p.stock <= 5 && (
                    <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-[9px] font-bold uppercase py-0.5 px-2 rounded">
                      Only {p.stock} left
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {p.category}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-rose-600 transition truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-montserrat font-bold text-slate-950 text-sm">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Tarnish-Free
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS & COLLATERALS */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-widest block bg-rose-50 inline-block px-3 py-1 rounded-full">
              Freshly Cast Jewelry
            </span>
            <h2 className="font-display font-semibold text-3xl text-slate-900 tracking-tight mt-3">
              RECENT RELEASES & AUTUMN DROPS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => (
              <div
                key={p.id}
                onClick={() => handleProductClick(p)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-lg transition duration-350"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-bold uppercase py-1 px-2.5 rounded-full tracking-wider">
                    New Release
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {p.category}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-rose-600 transition truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-montserrat font-bold text-slate-950 text-sm">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      Hypoallergenic
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 7. DYNAMIC FAQ */}
      {content && content.faqs && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <HelpcirclesIcon className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <h2 className="font-display font-semibold text-3xl text-slate-900 tracking-tight">STORE FAQs & ASSURANCES</h2>
              <p className="text-xs text-slate-400 mt-2 font-mono">Everything you need to know about materials and shipping</p>
            </div>

            <div className="space-y-4">
              {content.faqs.map((faq, i) => {
                const isOpen = faqOpenIndex === i;
                return (
                  <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                      className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100/75 flex items-center justify-between text-xs font-semibold text-slate-800 tracking-wide transition"
                    >
                      <span>{faq.question}</span>
                      <span className="text-slate-400 text-sm font-bold">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 py-4 bg-white text-xs text-slate-500 font-light leading-relaxed border-t border-slate-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. NEWSLETTER */}
      <section className="bg-slate-950 text-white py-16 text-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-xl mx-auto px-4 z-10 relative space-y-4">
          <Mail className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h2 className="font-display font-semibold text-2xl tracking-wide uppercase">Join Siso shopping Club</h2>
          <p className="text-xs text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
            Register your email to receive private collections release discounts, birthday drops, and early custom access invitations.
          </p>

          {subscriptionOk ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/30 text-xs px-4 py-3.5 rounded-xl max-w-xs mx-auto"
            >
              🎉 Welcome to the Circle! Check your inbox shortly.
            </motion.div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                required
                className="bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3.5 text-xs flex-1 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                placeholder="Submit your email coordinate..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase px-5 rounded-xl transition"
              >
                Join Now
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}

// Quick tiny wrapper to keep Lucide consistent
function HelpcirclesIcon(props: React.SVGProps<SVGSVGElement>) {
  return <HelpCircle {...(props as any)} />;
}
