import React, { useState } from "react";
import { CheckCircle, Truck, ShieldCheck, ShoppingBag, ArrowLeft, Heart, PackageOpen } from "lucide-react";
import { Product, Order } from "../types";
import { api } from "../api";
import { motion } from "motion/react";

interface OrderFormProps {
  selectedProduct: Product | null;
  setActivePage: (page: string) => void;
  onOrderCompleted: () => void;
  setTrackerId: (id: string) => void;
}

export default function OrderForm({
  selectedProduct,
  setActivePage,
  onOrderCompleted,
  setTrackerId
}: OrderFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    quantity: 1,
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!selectedProduct) {
    return (
      <div className="py-24 text-center space-y-4 font-sans bg-white text-slate-800">
        <p className="text-slate-500 font-light text-sm">Please choose an accessory from the list before placing a delivery order.</p>
        <button
          onClick={() => setActivePage("shop")}
          className="bg-rose-600 text-white rounded-full text-xs font-bold px-6 py-2.5 uppercase"
        >
          Browse Accessories Shop
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleQuantityChange = (dir: "inc" | "dec") => {
    if (dir === "inc") {
      setForm({ ...form, quantity: Math.min(selectedProduct.stock, form.quantity + 1) });
    } else {
      setForm({ ...form, quantity: Math.max(1, form.quantity - 1) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    // Core Form Validations
    if (!form.fullName.trim() || !form.mobile.trim() || !form.email.trim() || !form.address.trim() || !form.pincode.trim()) {
      setErrorMessage("Please complete all required customer information coordinates.");
      return;
    }

    if (form.mobile.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please supply a valid 10-digit mobile phone contact number.");
      return;
    }

    if (form.pincode.replace(/\D/g, "").length < 6) {
      setErrorMessage("Please enter a valid 6-digit postal pin-code.");
      return;
    }

    setIsLoading(true);
    try {
      const orderPayload = {
        fullName: form.fullName.trim(),
        mobile: form.mobile.replace(/\D/g, ""),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: form.quantity,
        notes: form.notes.trim()
      };

      const res = await api.createOrder(orderPayload);
      setConfirmedOrder(res);
      setTrackerId(res.id);
      onOrderCompleted(); // refresh parents order counting
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit packaging order. Please verify input formats and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS BRAND PAGE
  if (confirmedOrder) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4 flex justify-center items-center font-sans text-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
              Inward Order Accepted
            </span>
            <h2 className="font-display font-semibold text-2xl text-slate-900 leading-tight">
              SISO COURIER SHIPMENT LOCKED
            </h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto font-light leading-relaxed">
              Congratulations <strong className="text-slate-900 font-semibold">{confirmedOrder.fullName}</strong>, your parcel wrapping sequence has begun. We are preparing your complimentary velvet casing box.
            </p>
          </div>

          {/* Invoice card */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left text-xs divide-y divide-slate-100 space-y-2">
            <div className="flex justify-between pb-2 font-semibold">
              <span className="text-slate-500">Inward ID / Track Code</span>
              <span className="text-rose-600 font-mono text-base font-extrabold tracking-wider">{confirmedOrder.id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Accessory Secured</span>
              <span className="text-slate-800 font-bold text-right truncate max-w-[200px]">{confirmedOrder.productName}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Authorized Quantity</span>
              <span className="text-slate-800 font-bold">{confirmedOrder.quantity} units</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Consignment Destination</span>
              <span className="text-slate-800 font-light text-right max-w-[240px]">
                {confirmedOrder.address}, {confirmedOrder.city}, {confirmedOrder.state} - {confirmedOrder.pincode}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                setTrackerId(confirmedOrder.id);
                setActivePage("track");
              }}
              className="flex-1 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase py-3.5 px-6 rounded-full transition shadow-xs"
            >
              Verify Tracking Status Node
            </button>
            <button
              onClick={() => setActivePage("shop")}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs uppercase py-3.5 px-6 rounded-full transition"
            >
              Keep Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb back */}
        <button
          onClick={() => setActivePage("product-details")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 text-xs font-semibold uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Revise product specification details</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* A. PRODUCT CARD SNAPSHOT SUMMARY */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 sticky top-24 space-y-4 shadow-2xs">
              <h3 className="text-slate-900 font-display font-semibold text-base border-b border-slate-200 pb-2">
                Order Summary
              </h3>
              
              <div className="rounded-2xl overflow-hidden h-48 bg-slate-150 relative">
                <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] font-bold uppercase py-0.5 px-2 rounded-full font-mono">
                  ₹{selectedProduct.price} tag
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block">Product:</span>
                  <span className="font-bold text-slate-800">{selectedProduct.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Item SKU:</span>
                  <span className="font-mono text-slate-500 text-[11px]">{selectedProduct.sku}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-slate-500">Order Quantity:</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("dec")}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold font-mono">{form.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("inc")}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-200 pt-4 text-xs font-semibold">
                  <span className="text-slate-600 block">Total Price:</span>
                  <span className="font-montserrat font-extrabold text-lg text-slate-950">
                    ₹{(selectedProduct.price * form.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* B. SHIPPING & COURIER DETAILS COMPILER */}
          <div className="md:col-span-8 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h2 className="font-display font-semibold text-2xl text-slate-900 uppercase">Courier Address Details</h2>
              <p className="text-xs text-slate-500 mt-1 font-sans font-light leading-relaxed">
                Provide secure shipment coordinates. Packages are sealed and shipped within 48 hours.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
                    placeholder="e.g. Elena Rostova"
                    required
                    value={form.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-mono text-slate-800"
                    placeholder="e.g. 9876543210"
                    required
                    value={form.mobile}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Private Email coordinates <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
                  placeholder="e.g. elena@example.com"
                  required
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Street Shipment Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
                  placeholder="e.g. Apartment, House No, Block, Street Name..."
                  required
                  value={form.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Consignment City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
                    required
                    value={form.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    State reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-800"
                    required
                    value={form.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    pincode (6-digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-mono text-slate-800"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    required
                    value={form.pincode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Packaging Notes or Custom Initials Inscriptions
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-805"
                  placeholder="e.g. Please wrap with emerald-green anniversary packing ribbon, size 6 ring, personalized engraving phrase: 'Soulmates'"
                  value={form.notes}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-full transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Securing Order Gateway...</span>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-white" />
                    <span>Authorize Delivery Order Shipment</span>
                  </>
                )}
              </button>
            </form>

            {/* Guarantees badge bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4 justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                <span>Conflict-Free Ethical Sourcing</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <PackageOpen className="w-4.5 h-4.5 text-emerald-600" />
                <span>Gift box packaging included</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
                <span>Waterproof Anti-Tarnish Lifetime wear</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
