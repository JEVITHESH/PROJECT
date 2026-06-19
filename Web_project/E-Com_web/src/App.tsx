import React, { useState, useEffect } from "react";
import { Product, Banner, WebContent, Category } from "./types";
import { api } from "./api";

// Component Layouts
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page Views
import Home from "./components/Home";
import Shop from "./components/Shop";
import Categories from "./components/Categories";
import ProductDetails from "./components/ProductDetails";
import OrderForm from "./components/OrderForm";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import TrackOrder from "./components/TrackOrder";
import AdminPanel from "./components/AdminPanel";

// Animations
import { motion, AnimatePresence } from "motion/react";
import { Loader2, MessageSquare } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState<string>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [content, setContent] = useState<WebContent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Synchronization selectors
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trackerId, setTrackerId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const WHATSAPP_NUMBER = "8015449688"; // Siso shopping

  // Fetch initial e-commerce catalogs
  const loadStorefrontData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Fire statistical traffic logging
      api.incrementHit().catch((err) => console.warn("Analytics hit skipped:", err));

      const [prodsData, bannersData, contentData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getBanners(),
        api.getContent(),
        api.getCategories()
      ]);
      
      setProducts(prodsData);
      setBanners(bannersData);
      setContent(contentData);
      setCategories(categoriesData);
    } catch (err: any) {
      setErrorMessage("Unable to connect with the Siso shopping Server: " + (err.message || "Unknown communication failure."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStorefrontData();
  }, []);

  // Sync state transitions when an order finishes
  const handleOrderCompleted = () => {
    // Reload items to update stock indicators
    loadStorefrontData();
  };

  const handleOrderProductDispatch = (prod: Product) => {
    setSelectedProduct(prod);
  };

  const handleSearchCommit = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory("All");
    setActivePage("shop");
  };

  // Renders pages with smooth entering animation transitions
  const renderActivePageContent = () => {
    switch (activePage) {
      case "home":
        return (
          <Home
            products={products}
            banners={banners}
            content={content}
            categories={categories}
            setActivePage={setActivePage}
            setSelectedProduct={setSelectedProduct}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "shop":
        return (
          <Shop
            products={products}
            categories={categories}
            activePage={activePage}
            setActivePage={setActivePage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "categories":
        return (
          <Categories
            categories={categories}
            setActivePage={setActivePage}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case "product-details":
        return (
          <ProductDetails
            product={selectedProduct}
            products={products}
            setActivePage={setActivePage}
            setSelectedProduct={setSelectedProduct}
            onOrderProduct={handleOrderProductDispatch}
            whatsappNumber={WHATSAPP_NUMBER}
          />
        );
      case "order-form":
        return (
          <OrderForm
            selectedProduct={selectedProduct}
            setActivePage={setActivePage}
            onOrderCompleted={handleOrderCompleted}
            setTrackerId={setTrackerId}
          />
        );
      case "about":
        return <AboutUs content={content} />;
      case "contact":
        return <Contact content={content} />;
      case "track":
        return <TrackOrder initialTrackerId={trackerId} />;
      case "admin":
        return (
          <AdminPanel
            onContentUpdated={loadStorefrontData}
            products={products}
            setProducts={setProducts}
            banners={banners}
            setBanners={setBanners}
            categories={categories}
            setCategories={setCategories}
            content={content}
            setContent={setContent}
            setActivePage={setActivePage}
          />
        );
      default:
        return (
          <Home
            products={products}
            banners={banners}
            content={content}
            categories={categories}
            setActivePage={setActivePage}
            setSelectedProduct={setSelectedProduct}
            setSelectedCategory={setSelectedCategory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden">
      
      {/* 1. HEADER LOGO & NAVIGATION */}
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchCommit}
        whatsappNumber={WHATSAPP_NUMBER}
      />

      {/* 2. MAIN SCENE CANVAS WITH ANIMATED TRANSITIONS */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 text-slate-500 font-sans">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <span className="text-xs uppercase tracking-widest font-semibold font-mono">Securing Siso shopping catalogs...</span>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md mx-auto my-24 bg-red-50 text-red-700 text-xs p-6 rounded-2xl border border-red-200 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-base">⚠</div>
            <p className="font-light leading-relaxed">{errorMessage}</p>
            <button
              onClick={loadStorefrontData}
              className="bg-red-600 text-white font-bold px-4 py-2 uppercase tracking-wide rounded-lg text-[10px]"
            >
              Re-establish Store Handshake
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderActivePageContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* 3. SITE DECORATIVE FOOTER */}
      <Footer
        setActivePage={setActivePage}
        contactAddress={content?.contactAddress || "Siso shopping, Tittakudi"}
        contactPhone={content?.contactPhone || "+91 8015449688"}
        contactEmail={content?.contactEmail || "contact@sisoshopping.com"}
        whatsappNumber={WHATSAPP_NUMBER}
      />

      {/* 4. PRIVATE WhatsApp FLOATING SPEED CALLOUT CHAT */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Siso%20shopping,%20I%20would%20love%20to%20inquire%20about%20your%20jewelry%20and%20accessories.`}
        target="_blank"
        rel="noreferrer referrer"
        className="fixed bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-600 transition-all duration-300 z-50 flex items-center justify-center hover:scale-105 group"
        aria-label="Direct WhatsApp assistance"
      >
        <MessageSquare className="w-6 h-6 fill-white text-emerald-500" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2">
          Chat Live
        </span>
      </a>

    </div>
  );
}
