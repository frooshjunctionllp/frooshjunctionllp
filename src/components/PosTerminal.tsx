"use client";

import React, { useState, useMemo } from "react";
import {
  Category,
  Customer,
  Gender,
  PaymentMethod,
  Product,
  ProductVariant,
  Sale,
  SaleItem,
} from "@/types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  UserCheck,
  ShoppingBag,
  Sparkles,
  Calendar,
  AlertCircle,
  Tag,
  Check,
  Coffee,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  ArrowRight,
  Gift,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PosTerminalProps {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onRecordSale: (sale: Sale) => void;
  onOpenReceipt: (sale: Sale) => void;
  nextCustomerId: string;
  currentWorker?: { id: string; name: string; role: string } | null;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  categories,
  products,
  customers,
  onSaveCustomer,
  onRecordSale,
  onOpenReceipt,
  nextCustomerId,
  currentWorker,
}) => {
  // Catalog View Mode (Grid vs Ultra-Fast Cashier List)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cart State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [saleDate, setSaleDate] = useState<string>("");

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<Product | null>(null);
  const [modalSelectedVariantId, setModalSelectedVariantId] =
    useState<string>("");
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  React.useEffect(() => {
    setSaleDate(new Date().toISOString().slice(0, 16));
  }, []);

  // Customer State
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers.length > 0 ? customers[0].id : ""
  );
  const [customerSearch, setCustomerSearch] = useState<string>("");

  // New Customer Form State
  const [newCustId, setNewCustId] = useState<string>(nextCustomerId);
  const [newCustName, setNewCustName] = useState<string>("");
  const [newCustGender, setNewCustGender] = useState<Gender>("male");
  const [newCustPhone, setNewCustPhone] = useState<string>("");
  const [newCustInstagram, setNewCustInstagram] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  React.useEffect(() => {
    if (!newCustId) {
      setNewCustId(nextCustomerId);
    }
  }, [nextCustomerId, newCustId]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod.isAvailable) return false;
      if (selectedCategory !== "all" && prod.categoryId !== selectedCategory) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !prod.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prod.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const query = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.id.includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.instagramId && c.instagramId.toLowerCase().includes(query))
    );
  }, [customers, customerSearch]);

  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Add Item to Cart
  const handleAddToCart = (
    product: Product,
    variant: ProductVariant,
    quantityToAdd: number = 1
  ) => {
    const cat = categories.find((c) => c.id === product.categoryId);
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.variantId === variant.id
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantityToAdd;
      updated[existingIndex].total =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        categoryId: product.categoryId,
        categoryName: cat?.name || "Drinks",
        variantId: variant.id,
        variantName: variant.name,
        unitPrice: variant.price,
        quantity: quantityToAdd,
        total: variant.price * quantityToAdd,
        imageUrl: product.imageUrl,
      };
      setCart([...cart, newItem]);
    }
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].total = newQty * updated[index].unitPrice;
    }
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    if (paymentMethod === "complimentary") {
      setPaymentMethod("cash");
    }
  };

  // Toggle individual item as Complementary / Free (₹0)
  const handleToggleItemComplementary = (index: number) => {
    const updated = [...cart];
    const item = updated[index];
    if (item.isComplementary) {
      const restoredPrice =
        item.originalPrice !== undefined ? item.originalPrice : item.unitPrice;
      item.isComplementary = false;
      item.unitPrice = restoredPrice;
      item.total = restoredPrice * item.quantity;
    } else {
      item.originalPrice = item.unitPrice;
      item.isComplementary = true;
      item.unitPrice = 0;
      item.total = 0;
    }
    setCart(updated);
  };

  // 1-Tap Make Entire Order 100% Free / Complementary
  const handleMakeOrderComplementary = () => {
    setDiscount(subtotal);
    setPaymentMethod("complimentary");
  };

  // Open Quick Size Modal
  const openDrinkQuickModal = (product: Product) => {
    setSelectedProductForModal(product);
    setModalSelectedVariantId(product.variants[0]?.id || "");
    setModalQuantity(1);
  };

  const handleConfirmModalAdd = () => {
    if (!selectedProductForModal) return;
    const variant = selectedProductForModal.variants.find(
      (v) => v.id === modalSelectedVariantId
    );
    if (variant) {
      handleAddToCart(selectedProductForModal, variant, modalQuantity);
    }
    setSelectedProductForModal(null);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Checkout
  const handleCompleteSale = () => {
    setFormError("");
    if (cart.length === 0) {
      setFormError("Cart is empty. Please add items.");
      return;
    }

    let customerToUse: Customer;

    if (customerMode === "new") {
      if (!newCustName.trim()) {
        setFormError("Please enter customer name.");
        return;
      }
      const formattedId = newCustId.trim() || nextCustomerId;

      const exists = customers.some((c) => c.id === formattedId);
      if (exists) {
        setFormError(`Customer ID #${formattedId} already exists! Use another ID.`);
        return;
      }

      customerToUse = {
        id: formattedId,
        name: newCustName.trim(),
        gender: newCustGender,
        phone: newCustPhone.trim() || undefined,
        instagramId: newCustInstagram.trim()
          ? newCustInstagram.trim().startsWith("@")
            ? newCustInstagram.trim()
            : `@${newCustInstagram.trim()}`
          : undefined,
        createdAt: new Date().toISOString(),
      };

      onSaveCustomer(customerToUse);
      setSelectedCustomerId(customerToUse.id);
    } else {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (!found) {
        setFormError("Please select a customer or switch to '+ New Customer'.");
        return;
      }
      customerToUse = found;
    }

    const isComplementaryOrder =
      paymentMethod === "complimentary" ||
      grandTotal === 0 ||
      cart.every((item) => item.isComplementary);

    const saleId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = {
      id: saleId,
      date: new Date(saleDate || Date.now()).toISOString(),
      customerId: customerToUse.id,
      customerName: customerToUse.name,
      customerGender: customerToUse.gender,
      customerPhone: customerToUse.phone,
      customerInstagram: customerToUse.instagramId,
      items: cart,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      total: Math.round(grandTotal),
      paymentMethod,
      isComplementary: isComplementaryOrder,
      notes: isComplementaryOrder
        ? "Complimentary Order • On the House"
        : undefined,
      workerId: currentWorker?.id,
      workerName: currentWorker?.name,
    };

    onRecordSale(newSale);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setCart([]);
    setDiscount(0);
    setIsOrderModalOpen(false);
    onOpenReceipt(newSale);
  };

  // Reusable Checkout Sheet Contents
  const OrderCheckoutContent = (
    <div className="pos-checkout-content space-y-4">
      {/* Customer Bar */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <UserCheck className="w-4 h-4 text-red-600" />
            <span>Customer</span>
          </div>

          <div className="flex bg-white rounded-lg p-0.5 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setCustomerMode("existing");
                setFormError("");
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                customerMode === "existing"
                  ? "bg-red-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode("new");
                setFormError("");
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                customerMode === "new"
                  ? "bg-red-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New customer
            </button>
          </div>
        </div>

        {customerMode === "existing" ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, name, phone, or insta..."
                aria-label="Search customers for this order"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <select
              aria-label="Customer for this order"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="" disabled>Select a customer</option>
              {filteredCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  #{cust.id} - {cust.name} ({cust.gender}) {cust.phone || ""}
                </option>
              ))}
            </select>

            {activeCustomer && (
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-2xs">
                <div>
                  <span className="font-semibold text-slate-900">
                    {activeCustomer.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                    ID #{activeCustomer.id}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  {activeCustomer.phone || activeCustomer.instagramId || "Walk-In"}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono font-bold text-slate-900"
                  placeholder="009"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewCustGender("male")}
                    className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      newCustGender === "male"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCustGender("female")}
                    className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      newCustGender === "female"
                        ? "bg-red-600 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Mobile (Opt)
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Instagram ID (Opt)
              </label>
              <input
                type="text"
                value={newCustInstagram}
                onChange={(e) => setNewCustInstagram(e.target.value)}
                placeholder="@username"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-red-600 font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Selected Items ({totalItemCount})
          </span>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <ShoppingBag />
              <strong>A little empty in here</strong>
              <p>Add a drink from the menu to start this order.</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className={`border rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs transition-colors ${
                  item.isComplementary
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                      {item.productName}
                    </p>
                    {item.isComplementary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {item.variantName}
                    </span>
                    {item.isComplementary ? (
                      <span className="text-xs text-emerald-700 font-bold tabular-nums">
                        ₹0 <span className="text-slate-400 line-through text-[11px] font-normal">₹{(item.originalPrice || 0).toFixed(0)}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium tabular-nums">
                        ₹{item.unitPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper with High-Touch Buttons */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => handleUpdateQty(index, -1)}
                    className="w-6 h-6 text-slate-700 hover:bg-slate-200 active:scale-90 flex items-center justify-center font-bold text-xs rounded cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs text-slate-900 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(index, 1)}
                    className="w-6 h-6 text-slate-700 hover:bg-slate-200 active:scale-90 flex items-center justify-center font-bold text-xs rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price & Action Icons (Gift / Free toggle + Delete) */}
                <div className="flex items-center gap-1.5 pl-1">
                  <span className={`font-bold text-xs sm:text-sm tabular-nums w-10 text-right ${
                    item.isComplementary ? "text-emerald-700" : "text-slate-900"
                  }`}>
                    ₹{item.total.toFixed(0)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleItemComplementary(index)}
                    className={`p-1 rounded-lg border transition-all cursor-pointer ${
                      item.isComplementary
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "text-slate-400 hover:text-amber-600 border-slate-200 bg-white hover:bg-amber-50"
                    }`}
                    title={
                      item.isComplementary
                        ? "Undo Complementary (Make Paid)"
                        : "Make this item Complementary (Free / ₹0)"
                    }
                  >
                    <Gift className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer active:scale-90"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Mode Selector */}
      <div className="pt-2 border-t border-slate-200/80 space-y-2">
        <span className="text-xs font-semibold text-slate-700 block">
          Payment Method:
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { id: "cash", label: "Cash", icon: <Banknote className="w-4 h-4" /> },
            { id: "upi", label: "UPI", icon: <Smartphone className="w-4 h-4" /> },
            { id: "card", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
            { id: "complimentary", label: "Free / Gift", icon: <Gift className="w-4 h-4" /> },
            { id: "other", label: "Split", icon: <Tag className="w-4 h-4" /> },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                const nextMethod = m.id as PaymentMethod;
                setPaymentMethod(nextMethod);
                if (nextMethod === "complimentary") {
                  setDiscount(subtotal);
                } else if (paymentMethod === "complimentary" && discount === subtotal) {
                  setDiscount(0);
                }
              }}
              className={`py-2 px-1 text-xs rounded-xl font-semibold border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                paymentMethod === m.id
                  ? m.id === "complimentary"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{m.icon}</span>
              <span className="text-[10px] text-center leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional billing controls */}
      <details className="pos-bill-options">
        <summary>Discount & bill date{discount > 0 ? ` · ₹${discount.toFixed(0)} off` : ""}</summary>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500 font-semibold block">
              Discount (₹):
            </span>
            {subtotal > 0 && discount < subtotal && (
              <button
                type="button"
                onClick={handleMakeOrderComplementary}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200"
                title="Make entire order 100% free / on the house"
              >
                <Gift className="w-3 h-3" />
                <span>100% Free</span>
              </button>
            )}
          </div>
          <input
            type="number"
            min="0"
            max={subtotal}
            step="5"
            value={discount}
            onChange={(e) => {
              const val = Math.max(0, parseFloat(e.target.value) || 0);
              setDiscount(val);
              if (val === subtotal && subtotal > 0) {
                setPaymentMethod("complimentary");
              } else if (paymentMethod === "complimentary" && val < subtotal) {
                setPaymentMethod("cash");
              }
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-red-600 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold block mb-1">
            Bill Date & Time:
          </span>
          <input
            type="datetime-local"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
          />
        </div>
      </div>

      </details>

      {/* Financials Breakdown */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-600 font-bold">
            <span>
              {discount >= subtotal ? "Complementary Waiver (100%):" : "Discount Applied:"}
            </span>
            <span>-₹{discount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
          <span>Grand Total:</span>
          <div className="text-right">
            {grandTotal === 0 && subtotal > 0 ? (
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  ON THE HOUSE • FREE
                </span>
                <span className="text-2xl text-emerald-600 font-black">
                  ₹0
                </span>
              </div>
            ) : (
              <span className="text-2xl text-red-600 font-black">
                ₹{grandTotal.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCompleteSale}
        disabled={cart.length === 0}
        className="pos-checkout-button w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Complete sale · ₹{grandTotal.toFixed(0)}</span>
      </button>
    </div>
  );

  return (
    <div className="pos-terminal space-y-4 pb-28 md:pb-6 font-sans">
      <div className="pos-layout">
        <div className="min-w-0 space-y-4">
      {/* Top Filter & View Controls */}
      <div className="pos-toolbar space-y-3">
        {/* Search & Mode Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your menu..."
              aria-label="Search menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear menu search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid vs List View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Speed List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Cart Trigger */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({totalItemCount})</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="pos-category-tabs flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5" aria-label="Drink categories">
          <button
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            All drinks ({products.length})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Drink Catalog + Order Sidebar */}
        {/* DRINK CATALOG: Responsive Grid or Cashier Speed List */}
          {viewMode === "grid" ? (
            <div className="pos-product-grid">
              {filteredProducts.map((prod) => {
                const cat = categories.find((c) => c.id === prod.categoryId);
                return (
                  <div
                    key={prod.id}
                    className="pos-product-card flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* 1:1 Image */}
                      <div
                        onClick={() => openDrinkQuickModal(prod)}
                        className="pos-product-image bg-slate-50 overflow-hidden flex items-center justify-center cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Customize ${prod.name}`}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDrinkQuickModal(prod); } }}
                      >
                        {prod.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                            loading="lazy"
                          />
                        ) : (
                          <Coffee className="w-8 h-8 text-slate-300" />
                        )}

                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-slate-700 shadow-2xs border border-slate-100">
                          {cat?.name || "Drink"}
                        </span>
                      </div>

                      {/* Drink Name */}
                      <h3
                        onClick={() => openDrinkQuickModal(prod)}
                        className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight group-hover:text-red-600 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {prod.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {prod.description}
                      </p>
                    </div>

                    {/* Size Variants: Sleek, high-contrast rows */}
                    <div className="pos-variant-list border-t border-slate-100 space-y-1">
                      {prod.variants.map((v) => (
                        <div
                          key={v.id}
                          className="pos-variant-row flex items-center justify-between gap-1.5"
                        >
                          <div className="min-w-0 pr-1">
                            <div className="text-[11px] sm:text-xs font-medium text-slate-800 leading-tight truncate">
                              {v.name}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-red-600 tabular-nums">
                              ₹{v.price.toFixed(0)}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(prod, v)}
                            aria-label={`Add ${prod.name}, ${v.name}`}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-all flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ULTRA-FAST CASHIER LIST VIEW (Peak rush hour mode on mobile) */
            <div className="space-y-2.5">
              {filteredProducts.map((prod) => {
                const cat = categories.find((c) => c.id === prod.categoryId);
                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                        {prod.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Coffee className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {cat?.name || "Drink"}
                          </span>
                          <h3 className="font-semibold text-sm text-slate-900 truncate">
                            {prod.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Direct 1-Tap Variant Add Pills */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {prod.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleAddToCart(prod, v)}
                          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                        >
                          <span>{v.name}</span>
                          <span className="text-red-600 font-bold tabular-nums">
                            ₹{v.price.toFixed(0)}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-red-600 ml-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
              <p className="text-sm text-red-600 font-semibold">No drinks match this filter</p>
              <p className="text-xs text-slate-400 mt-1">Try another category or clear your search query.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE ORDER CART (Desktop Sticky Sidebar) */}
        <div className="pos-cart">
          <div className="pos-cart-panel">
            <div className="pos-cart-heading">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-600" />
                <h2 className="font-bold text-sm text-slate-900">
                  Current order
                </h2>
              </div>
              <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                {totalItemCount} Items
              </span>
            </div>

            {OrderCheckoutContent}
          </div>
        </div>
      </div>

      {/* QUICK DRINK SIZE MODAL (When tapping drink tile image/title on mobile) */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  {selectedProductForModal.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProductForModal.imageUrl}
                      alt={selectedProductForModal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Coffee className="w-6 h-6 text-amber-500 m-auto" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedProductForModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {selectedProductForModal.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Size Options (Big thumb targets) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Select Size:
              </span>
              <div className="space-y-2">
                {selectedProductForModal.variants.map((v) => {
                  const isSelected = modalSelectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setModalSelectedVariantId(v.id)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-50/80 border-red-600 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-red-600 bg-red-600"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="font-bold text-sm text-slate-900">
                          {v.name}
                        </span>
                      </div>
                      <span className="font-extrabold text-base text-red-600">
                        ₹{v.price.toFixed(0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-xs font-bold text-slate-700">Quantity</span>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-900">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-md font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmModalAdd}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add to Cart • ₹
                {(
                  (selectedProductForModal.variants.find(
                    (v) => v.id === modalSelectedVariantId
                  )?.price || 0) * modalQuantity
                ).toFixed(0)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* FULL ORDER CHECKOUT BOTTOM SHEET */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Order & Checkout
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {totalItemCount} Items Selected • Review & Complete Sale
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer text-xl font-bold"
              >
                ×
              </button>
            </div>

            {OrderCheckoutContent}
          </div>
        </div>
      )}

      {/* FLOATING MOBILE CART BAR (Persistent above mobile bottom navigation) */}
      <div className="pos-mobile-cart lg:hidden fixed bottom-0 left-0 right-0 z-30 px-3 py-2 pointer-events-none">
        <div className="w-full max-w-lg mx-auto pointer-events-auto">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-transform border border-red-500/50"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-amber-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="ml-1 text-xs sm:text-sm font-extrabold">
                {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-black text-sm sm:text-base">
                ₹{grandTotal.toFixed(0)}
              </span>
              <span className="bg-white/20 hover:bg-white/30 text-white text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <span>View Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
