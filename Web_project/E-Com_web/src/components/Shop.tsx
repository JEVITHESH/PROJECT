import React, { useState, useMemo } from "react";
import { SlidersHorizontal, Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Product, Category } from "../types";

interface ShopProps {
  products: Product[];
  categories: Category[];
  activePage: string;
  setActivePage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

export default function Shop({
  products,
  categories: dbCategories,
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
  selectedProduct,
  setSelectedProduct,
  selectedCategory,
  setSelectedCategory
}: ShopProps) {
  // Filter states
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const categoriesList = ["All", ...dbCategories.map((c) => c.name)];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, maxPrice, sortBy]);

  // Paginated items
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const handleProductCardClick = (p: Product) => {
    setSelectedProduct(p);
    setActivePage("product-details");
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Banner introduction card */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl" />
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 tracking-tight">THE PREMIUM ACCESSORIES</h1>
          <p className="text-xs text-slate-500 mt-2 font-sans font-light max-w-lg mx-auto">
            Browse through tarnish-free luxury bands, sparkling gemstones, customizable medallions, and exquisite gift arrays built for beautiful moments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* A. SIDEBAR FILTER TOOLS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-6 sticky top-24">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">Sidebar Filters</span>
              </div>

              {/* 1. Category Selecting */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Select Category
                </label>
                <div className="space-y-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition duration-150 ${
                        selectedCategory === cat
                          ? "bg-rose-600 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Price Ceiling Slide Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Price Ceiling
                  </label>
                  <span className="text-xs text-slate-900 font-bold font-montserrat">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="50"
                  className="w-full accent-rose-600"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                  <span>Min: ₹50</span>
                  <span>Max: ₹1500</span>
                </div>
              </div>

              {/* 3. Sorting list */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Order sequence
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:outline-hidden"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="alphabetical">Name: A-Z</option>
                </select>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg transition"
                >
                  Clear Search Query
                </button>
              )}
            </div>
          </div>

          {/* B. MAIN PRODUCTS LIST GRID */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header controls count and query indicators */}
            <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> jewelry results
                {searchQuery && (
                  <span>
                    {" "}
                    for &ldquo;<strong className="text-rose-600 font-semibold">{searchQuery}</strong>&rdquo;
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span>
                    {" "}
                    in <strong className="text-rose-600 font-semibold">{selectedCategory}</strong>
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] uppercase">
                Siso certified Waterproof
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-slate-400 text-sm font-light">No accessories matched your specific filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setMaxPrice(1500);
                    setSearchQuery("");
                  }}
                  className="bg-rose-600 text-white px-5 py-2.5 text-xs rounded-full font-bold uppercase"
                >
                  Reset Shop Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((p) => {
                    const discountRate = 12; // visual highlight
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductCardClick(p)}
                        className="group bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition duration-350 cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative h-64 overflow-hidden bg-slate-100 rounded-t-2xl">
                          <img
                            src={p.images[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600"}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                            loading="lazy"
                          />
                          
                          {p.stock <= 5 && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase py-0.5 px-2 rounded-full font-mono tracking-widest animate-pulse">
                              Only {p.stock} units left
                            </div>
                          )}

                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-900 font-semibold flex items-center gap-1 border border-slate-100">
                            <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-50" />
                            <span>Hypoallergenic</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                              {p.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </div>

                          <h3 className="text-xs font-semibold text-slate-900 group-hover:text-rose-600 transition clamp-2 leading-relaxed">
                            {p.name}
                          </h3>

                          <div className="flex items-end justify-between pt-1 border-t border-slate-50 mt-2">
                            <div>
                              <span className="text-[10px] text-slate-400 line-through font-montserrat">
                                ₹{(p.price + Math.floor(p.price * 1.2 * 0.1)).toLocaleString()}
                              </span>
                              <span className="font-montserrat font-extrabold text-slate-950 text-base block -mt-1">
                                ₹{p.price.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[10px] text-white bg-slate-900 px-2 py-0.5 rounded font-bold font-mono">
                              24h Shipping
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* C. PAGINATION NODES */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-10 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-45 hover:bg-slate-50 transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition duration-150 ${
                            currentPage === pageNum
                              ? "bg-rose-600 text-white"
                              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-45 hover:bg-slate-50 transition"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
