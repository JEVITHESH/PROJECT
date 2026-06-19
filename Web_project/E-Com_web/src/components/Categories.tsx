import { Sparkles, ArrowRight } from "lucide-react";
import { Category } from "../types";

interface CategoriesProps {
  categories: Category[];
  setActivePage: (page: string) => void;
  setSelectedCategory: (category: string) => void;
}

export default function Categories({ categories, setActivePage, setSelectedCategory }: CategoriesProps) {
  const categoryCatalog = categories.map((c) => ({
    id: c.name, // Use category name to align with the product filter
    title: c.name,
    tagline: c.tagline,
    description: c.description,
    image: c.image,
    stats: c.stats || ""
  }));

  const handleCategorySelection = (catId: string) => {
    setSelectedCategory(catId);
    setActivePage("shop");
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 block pl-1">
            Premium Handcrafted Directory
          </span>
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 tracking-tight mt-2">
            EXPLORE ACCENT DIRECTORY
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-sans font-light">
            Each sub-collection is handcrafted with extreme precision, utilizing anti-tarnish waterproof steel and ethically sourced gems.
          </p>
        </div>

        {/* Catalog layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryCatalog.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleCategorySelection(cat.id)}
              className="group cursor-pointer bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-350 flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-bold uppercase py-1 px-2.5 rounded-full tracking-widest flex items-center gap-1 leading-none">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Siso Design</span>
                </div>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">
                    {cat.tagline}
                  </span>
                  <h3 className="font-display font-semibold text-xl text-slate-900 group-hover:text-rose-600 transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-250/20 mt-4 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400 font-light">{cat.stats}</span>
                  <span className="text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:translate-x-1.5 transition duration-200">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
