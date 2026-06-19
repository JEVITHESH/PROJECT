import React, { useState, useEffect } from "react";
import {
  Lock,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle,
  Clock,
  Settings,
  Image as ImageIcon,
  Edit,
  Save,
  LogOut,
  Sliders,
  IndianRupee,
  Package,
  ArrowRight,
  Eye,
  X,
  RefreshCw
} from "lucide-react";
import { api, setAdminToken, getAdminToken } from "../api";
import { Product, Order, Customer, Banner, WebContent, Category } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  onContentUpdated: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  content: WebContent | null;
  setContent: React.Dispatch<React.SetStateAction<WebContent | null>>;
  setActivePage: (page: string) => void;
}

export default function AdminPanel({
  onContentUpdated,
  products,
  setProducts,
  banners,
  setBanners,
  categories: dbCategories,
  setCategories,
  content,
  setContent,
  setActivePage
}: AdminPanelProps) {
  // Upload states & helper
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              base64: reader.result as string
            })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
          }
          const data = await res.json();
          resolve(data.url);
        } catch (err: any) {
          reject(err);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        reject(new Error("File reading failed"));
      };
      reader.readAsDataURL(file);
    });
  };

  // Authentication states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Administrative views: 'dashboard', 'products', 'orders', 'customers', 'banners', 'content'
  const [adminTab, setAdminTab] = useState("dashboard");

  // State data for administrator tables
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [stats, setStats] = useState<{
    pageViews: number;
    monthlyTraffic: Record<string, number>;
    monthlyOrders: Record<string, number>;
  } | null>(null);

  // Product Modals & Forms
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Rings",
    images: "",
    colors: "",
    stock: 10,
    sku: ""
  });

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Banner Editing states
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    offerText: "",
    imageUrl: "",
    isActive: true
  });

  // FAQ Form
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  // Category Modals & Forms
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    tagline: "",
    description: "",
    image: "",
    stats: ""
  });

  const categories = dbCategories.map((c) => c.name);

  // Verify token on mount or state change
  useEffect(() => {
    const checkToken = async () => {
      const token = getAdminToken();
      if (token) {
        try {
          const res = await api.verifyToken();
          if (res.valid) {
            setIsAdminLoggedIn(true);
            loadAdminData();
          } else {
            setAdminToken(null);
            setIsAdminLoggedIn(false);
          }
        } catch {
          setAdminToken(null);
          setIsAdminLoggedIn(false);
        }
      }
    };
    checkToken();
  }, []);

  const loadAdminData = async () => {
    setIsLoadingAdminData(true);
    try {
      const [orderList, customerList, statsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getStats().catch(() => null)
      ]);
      setOrders(orderList);
      setCustomers(customerList);
      if (statsData) {
        setStats(statsData);
      }
    } catch (e) {
      console.error("Error loading administration reports:", e);
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsAuthenticating(true);
    try {
      const res = await api.login(username, password);
      setAdminToken(res.token);
      setIsAdminLoggedIn(true);
      loadAdminData();
    } catch (err: any) {
      setLoginError(err.message || "Invalid system credentials. Try admin / admin123");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignout = () => {
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // PRODUCT ACTIONS
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: 150,
      category: categories[0] || "Rings",
      images: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
      colors: "Gold, Silver, Rose Gold",
      stock: 15,
      sku: "RNG-NEW-" + Math.floor(100 + Math.random() * 900)
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: categories.includes(p.category) ? p.category : (categories[0] || p.category),
      images: p.images.join(", "),
      colors: p.colors.join(", "),
      stock: p.stock,
      sku: p.sku
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formatted = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        category: productForm.category,
        images: productForm.images.split(",").map((i) => i.trim()).filter(Boolean),
        colors: productForm.colors.split(",").map((c) => c.trim()).filter(Boolean),
        stock: Number(productForm.stock),
        sku: productForm.sku
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, formatted);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res : p)));
      } else {
        const res = await api.createProduct(formatted);
        setProducts([...products, res]);
      }
      setIsProductModalOpen(false);
      onContentUpdated();
    } catch (e: any) {
      alert("Error saving product: " + e.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you absolutely sure you want to permanently delete this product?")) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        onContentUpdated();
      } catch (e: any) {
        alert("Error deleting product.");
      }
    }
  };

  // CATEGORY ACTIONS
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      tagline: "",
      description: "",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
      stats: ""
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      image: c.image,
      stats: c.stats || ""
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formatted = {
        name: categoryForm.name,
        tagline: categoryForm.tagline,
        description: categoryForm.description,
        image: categoryForm.image,
        stats: categoryForm.stats
      };

      if (editingCategory) {
        const res = await api.updateCategory(editingCategory.id, formatted);
        setCategories(dbCategories.map((c) => (c.id === editingCategory.id ? res : c)));
      } else {
        const res = await api.createCategory(formatted);
        setCategories([...dbCategories, res]);
      }
      setIsCategoryModalOpen(false);
      onContentUpdated();
    } catch (e: any) {
      alert("Error saving category: " + e.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you absolutely sure you want to permanently delete this category? Products in this category will need to be re-assigned.")) {
      try {
        await api.deleteCategory(id);
        setCategories(dbCategories.filter((c) => c.id !== id));
        onContentUpdated();
      } catch (e: any) {
        alert("Error deleting category: " + e.message);
      }
    }
  };

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      const res = await api.updateOrder(orderId, { status });
      setOrders(orders.map((o) => (o.id === orderId ? res : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res);
      }
      loadAdminData();
    } catch (e: any) {
      alert("Error transition status: " + e.message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Delete Order permanently?")) {
      try {
        await api.deleteOrder(orderId);
        setOrders(orders.filter((o) => o.id !== orderId));
        setIsOrderModalOpen(false);
        loadAdminData();
      } catch (e: any) {
        alert("Error deleting order: " + e.message);
      }
    }
  };

  // BANNER ACTIONS
  const handleEditBanner = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle,
      offerText: b.offerText,
      imageUrl: b.imageUrl,
      isActive: b.isActive
    });
  };

  const handleSaveBanner = async (id: string) => {
    try {
      const res = await api.updateBanner(id, bannerForm);
      setBanners(banners.map((b) => (b.id === id ? res : b)));
      setEditingBannerId(null);
      alert("Banner updated successfully");
    } catch (e: any) {
      alert("Error updating banner: " + e.message);
    }
  };

  // METRIC CALCULATIONS
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.id && o.status === "Pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "Confirmed").length;
  const processingOrders = orders.filter((o) => o.status === "Processing").length;
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalCustomerCount = customers.length;
  
  // Safe calculation of total revenue
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => {
      const prod = products.find((p) => p.id === o.productId);
      const itemPrice = prod ? prod.price : 250; // fallback standard estimation
      return sum + (itemPrice * o.quantity);
    }, 0);

  // Sign out if token check failed but component remains
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-slate-800 relative overflow-hidden"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500" />
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">
              Siso Central Vault
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Enter credentials to securely manage products, orders, and content.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-lg mb-6 border border-red-200 flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                System Username
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Access Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                placeholder="e.g. admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200 mt-6 shadow-sm flex justify-center items-center gap-2"
            >
              {isAuthenticating ? "Verifying Vault Passkey..." : "Authorize Credentials"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isAuthenticating}
              onClick={async () => {
                setUsername("admin");
                setPassword("admin123");
                setIsAuthenticating(true);
                setLoginError("");
                try {
                  const res = await api.login("admin", "admin123");
                  setAdminToken(res.token);
                  setIsAdminLoggedIn(true);
                  loadAdminData();
                } catch (err: any) {
                  setLoginError(err.message || "Failed to auto-login");
                } finally {
                  setIsAuthenticating(false);
                }
              }}
              className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition duration-200 shadow-2xs flex justify-center items-center gap-2 border border-slate-200"
            >
              ⚡ Instant Test-User Auto-Login
            </button>
          </form>

          {/* Quick Guidance Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-500">Security Note:</span> Seed installation grants default username <code className="bg-slate-50 font-mono text-rose-600 px-1 rounded font-semibold text-[10px]">admin</code> and password <code className="bg-slate-50 font-mono text-rose-600 px-1 rounded font-semibold text-[10px]">admin123</code> for prototype preview audits.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Banner Navigation bar for Admins */}
      <div className="bg-slate-900 text-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-rose-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded tracking-widest uppercase">
              Admin Mode
            </div>
            <span className="font-display font-medium text-lg leading-none hidden sm:inline">
              Siso Management Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="p-1 px-2 text-xs bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 flex items-center gap-1.5 transition"
              title="Refresh database entries"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reload data</span>
            </button>

            <button
              onClick={handleSignout}
              className="bg-red-700/80 hover:bg-red-800 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Admin Sidebar Links */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">
                Operational Modules
              </h3>
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Overview Metrics", icon: TrendingUp },
                  { id: "products", label: "Manage Products", icon: ShoppingBag, count: products.length },
                  { id: "orders", label: "Track Orders List", icon: Package, count: orders.length, highlight: pendingOrders > 0 },
                  { id: "categories", label: "Manage Categories", icon: Settings, count: dbCategories.length },
                  { id: "customers", label: "Acquired Customers", icon: Users, count: customers.length },
                  { id: "content", label: "Brand Customization", icon: Sliders }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150 ${
                        adminTab === item.id
                          ? "bg-rose-50 text-rose-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            item.highlight
                              ? "bg-red-500 text-white animate-pulse font-bold"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActivePage("home")}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center block transition"
                >
                  View Public Website
                </button>
              </div>
            </div>
          </div>

          {/* Admin Operations Screen */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. DASHBOARD OVERVIEW */}
            {adminTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Prestige Sales Metrics</h2>
                  <p className="text-xs text-slate-500 font-light mt-1">
                    Complete administrative snapshot of orders, customer acquisitions, and product portfolios.
                  </p>
                </div>

                {isLoadingAdminData ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Calculating statistics...
                  </div>
                ) : (
                  <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Est. Sales</span>
                          <span className="text-2xl font-bold font-montserrat text-slate-900">₹{totalRevenue.toLocaleString()} +</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unprocessed Orders</span>
                          <span className="text-2xl font-bold font-montserrat text-rose-600">{pendingOrders} pending</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unique Clientele</span>
                          <span className="text-2xl font-bold font-montserrat text-slate-900">{totalCustomerCount} clients</span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Confirmed", count: confirmedOrders, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Processing", count: processingOrders, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Shipped", count: shippedOrders, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Delivered", count: deliveredOrders, color: "text-emerald-600", bg: "bg-emerald-50" }
                      ].map((sub, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs text-center">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">{sub.label}</span>
                          <span className={`text-xl font-bold font-montserrat mt-1 block ${sub.color}`}>{sub.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* MONTHLY PERFORMANCE ANALYTICS SECTION */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-slate-900 font-display font-semibold text-base">Monthly Analysis Metrics</h3>
                          <p className="text-[11px] text-slate-500 font-light mt-0.5">
                            Comparison between website traffic numbers (page views) and submitted orders.
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[11px]">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                            <span className="w-3 h-3 rounded bg-blue-500 block" />
                            <span>Website Views</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                            <span className="w-3 h-3 rounded bg-rose-500 block" />
                            <span>Placed Orders</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm("ARE YOU SURE? This will permanently delete all placed orders and reset page views and traffic data back to 0.")) return;
                              try {
                                await api.resetStats();
                                alert("Data reset successfully! Reloading page...");
                                window.location.reload();
                              } catch (e: any) {
                                alert("Failed to reset metrics: " + e.message);
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg border border-red-100 transition ml-2 shadow-2xs"
                          >
                            Reset Metrics & Orders
                          </button>
                        </div>
                      </div>

                      {/* SVG Chart */}
                      <div className="py-2">
                        <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-6 px-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                          {["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"].map((m) => {
                            const trafficVal = stats?.monthlyTraffic?.[m] || 0;
                            const orderVal = stats?.monthlyOrders?.[m] || 0;
                            
                            // Safe dynamic heights
                            const trafficHeight = Math.max(8, Math.min(100, (trafficVal / Math.max(...["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"].map(x => stats?.monthlyTraffic?.[x] || 0), 100)) * 100));
                            const orderHeight = Math.max(8, Math.min(100, (orderVal / Math.max(...["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"].map(x => stats?.monthlyOrders?.[x] || 0), 10)) * 100));
                            
                            // Format month helper
                            const formatMonthLabel = (key: string) => {
                              const [, month] = key.split("-");
                              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              const idx = parseInt(month, 10) - 1;
                              return idx >= 0 && idx < 12 ? months[idx] : key;
                            };

                            return (
                              <div key={m} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                {/* Hover details tooltip banner */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] p-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-32 whitespace-nowrap">
                                  <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1 mb-1 text-center font-display">
                                    {formatMonthLabel(m)} Performance
                                  </span>
                                  <div className="flex items-center justify-between text-blue-400">
                                    <span>Views:</span> <span className="font-mono font-bold">{trafficVal}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-rose-400">
                                    <span>Orders:</span> <span className="font-mono font-bold">{orderVal}</span>
                                  </div>
                                </div>

                                {/* Side-by-side bars */}
                                <div className="flex items-end gap-1 sm:gap-2.5 w-full justify-center max-w-[85px] h-[75%]">
                                  {/* Traffic bar */}
                                  <div className="flex-1 flex flex-col items-center h-full justify-end">
                                    <span className="text-[9px] font-mono font-bold text-blue-600 mb-0.5 group-hover:block hidden">
                                      {trafficVal}
                                    </span>
                                    <div
                                      style={{ height: `${trafficHeight}%` }}
                                      className="w-2.5 sm:w-5 min-h-[10px] rounded-t-xs bg-blue-500 hover:bg-blue-600 transition shadow-xs"
                                    />
                                  </div>

                                  {/* Orders bar */}
                                  <div className="flex-1 flex flex-col items-center h-full justify-end">
                                    <span className="text-[9px] font-mono font-bold text-rose-600 mb-0.5 group-hover:block hidden">
                                      {orderVal}
                                    </span>
                                    <div
                                      style={{ height: `${orderHeight}%` }}
                                      className="w-2.5 sm:w-5 min-h-[10px] rounded-t-xs bg-rose-500 hover:bg-rose-600 transition shadow-xs"
                                    />
                                  </div>
                                </div>

                                {/* Label */}
                                <span className="text-[11px] font-semibold text-slate-500 font-sans mt-3 group-hover:text-slate-800">
                                  {formatMonthLabel(m)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom insights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 font-bold shrink-0">
                            <Eye className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Website Traffic Counter</h4>
                            <p className="text-[11px] text-slate-500 font-light leading-relaxed mt-0.5">
                              Cumulative views across devices. Current record view count is <span className="font-bold font-mono text-blue-700">{stats?.pageViews || 1240} views</span> this year, demonstrating stable month-by-month traffic.
                            </p>
                          </div>
                        </div>

                        <div className="bg-rose-50/40 rounded-xl p-4 border border-rose-100 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-700 font-bold shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Conversion Rate Dynamic</h4>
                            <p className="text-[11px] text-slate-500 font-light leading-relaxed mt-0.5">
                              By dividing {orders.length} placed transactions by visitors count, the current system conversion count tracks at <span className="font-bold text-rose-700 font-mono">{((orders.length / Math.max(stats?.pageViews || 1, 1240)) * 100).toFixed(1)}%</span>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Recent Activity list */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
                      <h3 className="text-slate-900 font-display font-semibold text-base mb-4">Latest Inbound Invoices</h3>
                      {orders.length === 0 ? (
                        <p className="text-xs text-slate-400 font-light">No customer orders recorded yet.</p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {orders.slice(0, 5).map((o) => (
                            <div key={o.id} className="py-3.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-mono text-slate-900">{o.id}</span>
                                  <span className="text-slate-500 font-light">by {o.fullName}</span>
                                </div>
                                <span className="text-slate-400 font-light text-[11px] block mt-0.5">
                                  {o.productName} ({o.quantity} units)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    o.status === "Pending"
                                      ? "bg-red-50 text-red-600"
                                      : o.status === "Delivered"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  {o.status}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    setIsOrderModalOpen(true);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. PRODUCT MANAGEMENT */}
            {adminTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-2xl text-slate-900">Exquisite Accessories Catalog</h2>
                    <p className="text-xs text-slate-500 font-light mt-1">
                      Add, update jewelry specification details, pricing tiers, colors and stock inventory instantly.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddProduct}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider py-3 px-4 transition self-start flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Entry</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                          <th className="p-4">SKU / Item</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Unit Price</th>
                          <th className="p-4">Stock status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images[0] || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100"}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-lg bg-slate-50"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 leading-tight block">{p.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono tracking-widest">{p.sku}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4 font-bold font-montserrat text-slate-900">₹{p.price}</td>
                            <td className="p-4">
                              <span
                                className={`font-bold ${p.stock <= 5 ? "text-red-500 animate-pulse" : "text-slate-600"}`}
                              >
                                {p.stock} units
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1 px-2.5 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded transition font-semibold"
                                  title="Edit properties"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                  title="Remove catalog product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ORDER MANAGEMENT */}
            {adminTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Registry Invoices</h2>
                  <p className="text-xs text-slate-500 font-light mt-1">
                    Transition shipment status, coordinate package wrapping, and manage global orders securely.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                          <th className="p-4">Order ID / Date</th>
                          <th className="p-4">Customer info</th>
                          <th className="p-4">Quantity / Item</th>
                          <th className="p-4">Delivery State</th>
                          <th className="p-4 text-right">Invoice Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 font-mono tracking-wider">{o.id}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">{o.fullName}</div>
                              <div className="text-slate-400 text-[11px] font-mono mt-0.5">{o.mobile}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-700 clamp-1">{o.productName}</div>
                              <div className="text-slate-400 text-[11px]">Qty: {o.quantity}</div>
                            </td>
                            <td className="p-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className={`text-[11px] font-bold border rounded-lg px-2 py-1 focus:outline-hidden ${
                                  o.status === "Pending"
                                    ? "bg-red-50 border-red-200 text-red-600 font-extrabold"
                                    : o.status === "Delivered"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : "bg-blue-50 border-blue-200 text-blue-600"
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    setIsOrderModalOpen(true);
                                  }}
                                  className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
                                  title="View invoice details"
                                >
                                  Invoice
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Permanently remove order"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CUSTOMER MANAGEMENT */}
            {adminTab === "customers" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Prestige Clientele Ledger</h2>
                  <p className="text-xs text-slate-500 font-light mt-1">
                    Complete registered history of acquisition nodes, addressing references, and lifetime buy transactions.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                          <th className="p-4">Customer reference</th>
                          <th className="p-4">Registered Location</th>
                          <th className="p-4">Orders count</th>
                          <th className="p-4 text-right">Invoice Record</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="font-bold text-slate-800 text-sm">{c.fullName}</div>
                              <div className="text-slate-400 font-mono text-[11px] mt-0.5">{c.mobile}</div>
                              <div className="text-slate-400 text-[11px]">{c.email}</div>
                            </td>
                            <td className="p-4 max-w-xs clamp-1">
                              <span className="font-light text-slate-500">{c.address}</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold">
                                {c.orderHistory.length} orders
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-slate-500 font-mono font-light text-[11px]">
                                {c.orderHistory.map((h) => h.orderId).join(", ")}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. WEB CONTENT MANAGEMENT */}
            {adminTab === "content" && content && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Custom Brand Copy writing</h2>
                  <p className="text-xs text-slate-500 font-light mt-1">
                    Directly rewrite the customer-facing About Us narrative, store coordinates, contact channels and FAQ queries.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-slate-900 font-display font-semibold text-base">Corporate Details & Values</h3>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Our Narrative / About Us Block
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:outline-hidden"
                      value={content.aboutUs}
                      onChange={(e) => setContent({ ...content, aboutUs: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Store Badges / Landing Page Stats</h4>
                    <p className="text-[10px] text-slate-500 font-light mb-3">
                      These values are automatically calculated from active products, categories, and orders in the database.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Design Portfolios</span>
                        <span className="text-sm font-bold font-montserrat text-indigo-600 block mt-0.5">
                          {content.designPortfolios || "850+"}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5 block">(850 + Product Count)</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Client Reviews</span>
                        <span className="text-sm font-bold font-montserrat text-rose-600 block mt-0.5">
                          {content.clientReviews || "15k+"}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5 block">(15,000 + Order Count)</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Artisanal Awards</span>
                        <span className="text-sm font-bold font-montserrat text-emerald-600 block mt-0.5">
                          {content.artisanalAwards || "12"}
                        </span>
                        <span className="text-[8px] text-slate-400 mt-0.5 block">(12 + Category Count)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Corporate Vision
                      </label>
                      <textarea
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:outline-hidden"
                        value={content.vision}
                        onChange={(e) => setContent({ ...content, vision: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Corporate Mission
                      </label>
                      <textarea
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:outline-hidden"
                        value={content.mission}
                        onChange={(e) => setContent({ ...content, mission: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        concierge Phone Number
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                        value={content.contactPhone}
                        onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        concierge Email Anchor
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                        value={content.contactEmail}
                        onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        HQ Address Coordinate
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                        value={content.contactAddress}
                        onChange={(e) => setContent({ ...content, contactAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Active WhatsApp API string
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                        value={content.whatsappNumber}
                        onChange={(e) => setContent({ ...content, whatsappNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Live FAQ entries</h4>
                    <div className="space-y-3">
                      {content.faqs.map((f, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-lg flex items-start gap-4">
                          <div className="flex-1 text-xs">
                            <span className="font-bold text-slate-800">Q: {f.question}</span>
                            <p className="text-slate-500 font-light mt-1">A: {f.answer}</p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = content.faqs.filter((_, idx) => idx !== i);
                              setContent({ ...content, faqs: updated });
                            }}
                            className="text-red-500 hover:text-red-700 p-1 font-bold text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 mt-4 space-y-3">
                      <h4 className="font-semibold text-slate-800 text-xs">Add dynamic FAQ query:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
                          placeholder="Question name..."
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        />
                        <input
                          type="text"
                          className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
                          placeholder="Detailed answers..."
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFaq.question || !newFaq.answer) return;
                          setContent({
                            ...content,
                            faqs: [...content.faqs, newFaq]
                          });
                          setNewFaq({ question: "", answer: "" });
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg"
                      >
                        Insert FAQ block
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const res = await api.updateContent(content);
                        setContent(res);
                        onContentUpdated();
                        alert("Custom Brand copy updated live successfully!");
                      } catch (e: any) {
                        alert("Error saving branding contents: " + e.message);
                      }
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition mt-4"
                  >
                    Confirm & Publish Global Copywriting Updates
                  </button>
                </div>
              </div>
            )}

            {/* 8. CATEGORY MANAGEMENT */}
            {adminTab === "categories" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-display font-bold text-2xl text-slate-900">Manage Categories</h2>
                    <p className="text-xs text-slate-500 font-light mt-1">
                      Directly modify and add storefront directories, taglines, description contents and covers.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddCategory}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Directory Category</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-4">Category Cover</th>
                          <th className="p-4">Name</th>
                          <th className="p-4">Tagline</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {dbCategories.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-light">
                              No categories configured yet. Please click Create Category to start.
                            </td>
                          </tr>
                        ) : (
                          dbCategories.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-4">
                                <img
                                  src={c.image}
                                  alt={c.name}
                                  className="w-14 h-10 object-cover rounded-lg border border-slate-100 bg-slate-50"
                                />
                              </td>
                              <td className="p-4 font-bold text-slate-900">{c.name}</td>
                              <td className="p-4 text-rose-600 font-semibold">{c.tagline}</td>
                              <td className="p-4 text-slate-500 max-w-xs truncate font-light" title={c.description}>
                                {c.description}
                              </td>
                              <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenEditCategory(c)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition"
                                  title="Edit category details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(c.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition"
                                  title="Delete category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* PRODUCT ADD/EDIT SCREEN MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <span className="font-display font-semibold text-lg">
                  {editingProduct ? "Revise Jewelry entry" : "Create Jewelry entry"}
                </span>
                <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Product Label
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Item SKU Code
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Exquisite Description Narrative
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg p-3 text-xs"
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Unit price (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Stock inventory
                    </label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Product image URLs (comma-separated for multiples)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="https://images.unsplash.com/url1, https://images.unsplash.com/url2"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      Upload Product Pic
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setProductForm((prev) => ({
                                ...prev,
                                images: prev.images ? `${prev.images}, ${url}` : url
                              }));
                            } catch (err: any) {
                              alert("Upload failed: " + err.message);
                            }
                          }
                        }}
                      />
                    </label>
                    {isUploadingImage && (
                      <span className="text-[10px] font-mono text-rose-500 animate-pulse">Uploading file...</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Available Metals / Colors (comma separated options)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="e.g. Gold, Silver, Rose Gold"
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition mt-4"
                >
                  Publish Product Specifications
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SELECTED ORDER RECEIPT INVOICE MODAL */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-rose-600">
                <span className="font-display font-semibold text-lg">Sales Invoice: {selectedOrder.id}</span>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                
                {/* Status card */}
                <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Node</span>
                    <span className="text-sm font-bold text-rose-600 font-sans">{selectedOrder.status}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, st as any)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition ${
                          selectedOrder.status === st
                            ? "bg-rose-600 text-white font-extrabold"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer card */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Shipment Consignee
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-light">Client name:</span>
                      <span className="font-bold text-slate-800">{selectedOrder.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-light">Client Phone:</span>
                      <span className="font-bold text-slate-800 font-mono">{selectedOrder.mobile}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-light">Client email:</span>
                      <span className="font-bold text-slate-800">{selectedOrder.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-light">Consignment Address:</span>
                      <span className="font-light text-slate-700 leading-normal block">
                        {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items card */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                    Jewelry Specifications ordered
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{selectedOrder.productName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {selectedOrder.productId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold block">Qty: {selectedOrder.quantity}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                      Client Packaging instructions:
                    </span>
                    <p className="text-xs text-amber-900 leading-relaxed font-light italic">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm("Permanently trash order?")) {
                        handleDeleteOrder(selectedOrder.id);
                      }
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-3 px-4 rounded-xl transition text-center uppercase tracking-wider"
                  >
                    Delete Ledger Invoice
                  </button>
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition text-center uppercase tracking-wider"
                  >
                    Keep Invoice
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY ADD/EDIT SCREEN MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] text-slate-800"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    {editingCategory ? "Modify Directory Category" : "Create Directory Category"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">
                    Provide the name, description copy, tagline and directory cover.
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="e.g. Anklets"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="e.g. Custom laser engraving & summer layers"
                    value={categoryForm.tagline}
                    onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="Brief description showing on directories index catalog..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category Cover Image URL
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      Upload Category Pic
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setCategoryForm((prev) => ({
                                ...prev,
                                image: url
                              }));
                            } catch (err: any) {
                              alert("Upload failed: " + err.message);
                            }
                          }
                        }}
                      />
                    </label>
                    {isUploadingImage && (
                      <span className="text-[10px] font-mono text-rose-500 animate-pulse">Uploading file...</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Stats / Highlights (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="e.g. Over 20 options available"
                    value={categoryForm.stats}
                    onChange={(e) => setCategoryForm({ ...categoryForm, stats: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition mt-4"
                >
                  {editingCategory ? "Publish Category Changes" : "Create New Category"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
