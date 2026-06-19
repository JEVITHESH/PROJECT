import React, { useState, useMemo } from "react";
import { ArrowLeft, Check, Sparkles, MessageCircle, Truck, RefreshCw, Layers } from "lucide-react";
import { Product } from "../types";

interface ProductDetailsProps {
  product: Product | null;
  products: Product[];
  setActivePage: (page: string) => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  onOrderProduct: (product: Product) => void;
  whatsappNumber: string;
}

export default function ProductDetails({
  product,
  products,
  setActivePage,
  setSelectedProduct,
  onOrderProduct,
  whatsappNumber
}: ProductDetailsProps) {
  if (!product) {
    return (
      <div className="py-24 text-center space-y-4 font-sans bg-white text-slate-800">
        <p className="text-slate-500 font-light text-sm">Please select a jewelry piece to view details.</p>
        <button
          onClick={() => setActivePage("shop")}
          className="bg-rose-600 text-white rounded-full text-xs font-bold px-6 py-2.5 uppercase"
        >
          View Entire Shop Catalog
        </button>
      </div>
    );
  }

  // Gallery main image state
  const [activeImage, setActiveImage] = useState<string>(product.images[0] || "");
  const [selectedMetal, setSelectedMetal] = useState<string>(product.colors[0] || "Custom metal");

  // Keep active image updated when selected product switches
  React.useEffect(() => {
    setActiveImage(product.images[0] || "");
    setSelectedMetal(product.colors[0] || "Custom metal");
  }, [product]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const handleRelatedClick = (p: Product) => {
    setSelectedProduct(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderInitiation = () => {
    onOrderProduct(product);
    setActivePage("order-form");
  };

  return (
    <div className="bg-white text-slate-800 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Back navigation */}
        <button
          onClick={() => setActivePage("shop")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 text-xs font-semibold uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to entire shop</span>
        </button>

        {/* 1. PRODUCT SPECIFICATION SHEETS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* A. Left image carousel display */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 h-[50vh] sm:h-[60vh] relative group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300 transform group-hover:scale-102"
              />
              <div className="absolute top-4 left-4 bg-slate-900/80 text-white text-[9px] font-bold uppercase py-1 px-3 rounded-full tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                <span>Waterproof Anti-Tarnish</span>
              </div>
            </div>

            {/* Thumbnail array */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, i) => {
                  const isSelected = activeImage === imgUrl;
                  return (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImage(imgUrl)}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border-2 shrink-0 transition ${
                        isSelected ? "border-rose-600 shadow-xs" : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Right metadata configuration panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-rose-50 text-rose-600 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SKU reference: {product.sku}</span>
              </div>
              <h1 className="font-display font-semibold text-2xl sm:text-3xl text-slate-950 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-montserrat font-extrabold text-2xl text-slate-900">
                ${product.price.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through font-montserrat">
                ${(product.price + Math.floor(product.price * 1.25 * 0.08)).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono">
                Complementary Velvet box
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-light mt-4">
              {product.description}
            </p>

            {/* Metals picker custom details */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Finish / Metal Option:
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelect = selectedMetal === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedMetal(color)}
                      className={`text-xs px-4 py-2.5 rounded-xl border font-medium transition flex items-center gap-1.5 ${
                        isSelect
                          ? "border-slate-950 bg-slate-950 text-white font-semibold"
                          : "border-slate-200 text-slate-600 hover:border-slate-350 bg-white"
                      }`}
                    >
                      {isSelect && <Check className="w-3.5 h-3.5" />}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality credentials */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 text-xs font-light text-slate-500">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Complementary Courier Packaging</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Anti-Tarnish Lifetime wear</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Premium PVD Vacuum coating</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-rose-500 font-bold">100%</span>
                <span>Nickel and Lead-Free steel</span>
              </div>
            </div>

            {/* Purchase CTA controls */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Stock Availability state:</span>
                {product.stock > 0 ? (
                  <span className="text-emerald-600">In Stock ({product.stock} units)</span>
                ) : (
                  <span className="text-red-500">Temporarily Back-ordered</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleOrderInitiation}
                  disabled={product.stock === 0}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white py-4 px-6 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 text-center shadow-xs"
                >
                  Place Delivery Order
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hello%20Siso%20shopping,%20I%20am%20interested%20in%20ordering%20the%20${encodeURIComponent(
                    product.name
                  )}%20(SKU:%20${product.sku})`}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="inline-flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-6 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-700" />
                  <span>direct WhatsApp inquiry</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 2. RELATED COMPANIONS DESIGN GRID */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-100">
            <h2 className="font-display font-semibold text-2xl text-slate-900 tracking-tight mb-8">
              COMPANION HARMONY ITEMS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => handleRelatedClick(rp)}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs hover:shadow-md transition duration-350 cursor-pointer"
                >
                  <div className="h-48 overflow-hidden bg-slate-50">
                    <img src={rp.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                      {rp.category}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-rose-600 transition truncate">
                      {rp.name}
                    </h3>
                    <span className="font-montserrat font-bold text-slate-950 text-xs block">
                      ${rp.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
