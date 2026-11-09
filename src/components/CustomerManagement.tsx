"use client";

import React, { useState, useMemo } from "react";
import { Customer, Gender, Sale } from "@/types";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  X,
  CreditCard,
  Heart,
  ChevronRight,
  Filter,
} from "lucide-react";
import { InstagramIcon } from "./icons";

interface CustomerManagementProps {
  customers: Customer[];
  sales: Sale[];
  onSaveCustomer: (customer: Customer) => void;
  nextCustomerId: string;
  onOpenReceipt: (sale: Sale) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  sales,
  onSaveCustomer,
  nextCustomerId,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modal State for New Customer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newId, setNewId] = useState(nextCustomerId);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<Gender>("male");
  const [newPhone, setNewPhone] = useState("");
  const [newInstagram, setNewInstagram] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [modalError, setModalError] = useState("");

  const handleOpenAddModal = () => {
    setNewId(nextCustomerId);
    setNewName("");
    setNewGender("male");
    setNewPhone("");
    setNewInstagram("");
    setNewNotes("");
    setModalError("");
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!newName.trim()) {
      setModalError("Please enter customer name");
      return;
    }

    const formattedId = newId.trim() || nextCustomerId;
    if (customers.some((c) => c.id === formattedId)) {
      setModalError(`Customer ID #${formattedId} already exists! Use another.`);
      return;
    }

    const created: Customer = {
      id: formattedId,
      name: newName.trim(),
      gender: newGender,
      phone: newPhone.trim() || undefined,
      instagramId: newInstagram.trim()
        ? newInstagram.trim().startsWith("@")
          ? newInstagram.trim()
          : `@${newInstagram.trim()}`
        : undefined,
      notes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveCustomer(created);
    setIsAddModalOpen(false);
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (genderFilter !== "all" && c.gender !== genderFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchId = c.id.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchInsta = c.instagramId?.toLowerCase().includes(q);
        return matchName || matchId || matchPhone || matchInsta;
      }
      return true;
    });
  }, [customers, genderFilter, searchQuery]);

  // Sales grouped by customer
  const customerSalesMap = useMemo(() => {
    const map: Record<
      string,
      {
        salesList: Sale[];
        totalSpent: number;
        drinksBought: { drink: string; count: number }[];
      }
    > = {};

    customers.forEach((c) => {
      map[c.id] = { salesList: [], totalSpent: 0, drinksBought: [] };
    });

    sales.forEach((s) => {
      if (!map[s.customerId]) {
        map[s.customerId] = { salesList: [], totalSpent: 0, drinksBought: [] };
      }
      map[s.customerId].salesList.push(s);
      map[s.customerId].totalSpent += s.total;

      s.items.forEach((it) => {
        const existing = map[s.customerId].drinksBought.find(
          (d) => d.drink === it.productName
        );
        if (existing) {
          existing.count += it.quantity;
        } else {
          map[s.customerId].drinksBought.push({
            drink: it.productName,
            count: it.quantity,
          });
        }
      });
    });

    return map;
  }, [customers, sales]);

  const selectedCustomerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales
      .filter((s) => s.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, sales]);

  return (
    <div className="space-y-6 pb-20 md:pb-6 font-sans">
      {/* Search, Filter & Register Header */}
      <div className="dashboard-panel space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-sm text-slate-900">
                Customer directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact details, past orders, and familiar favourites.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="pixel-btn-yellow px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer rounded-lg font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add customer</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID (e.g. 001), name, mobile, or @insta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          {/* Gender Filter */}
          <div className="dashboard-filter-tabs flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-xs font-semibold text-slate-500 px-2">Gender:</span>
            {(["all", "male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                  genderFilter === g
                    ? "bg-yellow-400 text-amber-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER DIRECTORY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCustomers.map((cust) => {
          const stats = customerSalesMap[cust.id] || {
            salesList: [],
            totalSpent: 0,
            drinksBought: [],
          };
          const topDrink = stats.drinksBought.sort((a, b) => b.count - a.count)[0];

          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white border border-slate-200 rounded-xl hover:border-red-300 shadow-xs hover:shadow-md transition-all p-4 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* ID & Gender Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                    #{cust.id}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                      cust.gender === "male"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {cust.gender === "male" ? "♂ Male" : "♀ Female"}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                  {cust.name}
                </h3>

                {/* Contact info */}
                <div className="mt-2 space-y-1 text-xs text-slate-500 font-medium">
                  {cust.phone ? (
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.phone}</span>
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">No phone added</p>
                  )}

                  {cust.instagramId ? (
                    <p className="flex items-center gap-1.5 text-pink-600 font-semibold truncate">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>{cust.instagramId}</span>
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">No Instagram</p>
                  )}
                </div>
              </div>

              {/* Purchase summary banner */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Orders: {stats.salesList.length}</span>
                  <span className="text-red-600 font-bold">
                    Spent: ₹{stats.totalSpent.toFixed(0)}
                  </span>
                </div>

                {topDrink && (
                  <div className="bg-amber-50/70 p-1.5 rounded border border-amber-200 text-[11px] truncate flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-600 flex-shrink-0" />
                    <span className="text-slate-500">Fav:</span>
                    <span className="text-slate-800 font-bold truncate">
                      {topDrink.drink}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end text-xs text-red-600 group-hover:underline pt-1 font-semibold">
                  <span>View History</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="dashboard-empty-state">
          <Users className="w-8 h-8" />
          <p>{customers.length === 0 ? "Make room for your regulars" : "No customers found"}</p>
          <p>{customers.length === 0 ? "Add your first customer to start building their visit history." : "Try a different name, phone number, or filter."}</p>
          <button className="pixel-btn-white mt-4 px-4 text-xs" onClick={customers.length === 0 ? handleOpenAddModal : () => { setSearchQuery(""); setGenderFilter("all"); }}>
            {customers.length === 0 ? "Add customer" : "Clear filters"}
          </button>
        </div>
      )}

      {/* MODAL: CUSTOMER PROFILE & PURCHASE LOG */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-mono">
                    Customer #{selectedCustomer.id}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      selectedCustomer.gender === "male"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-pink-50 text-pink-700"
                    }`}
                  >
                    {selectedCustomer.gender === "male" ? "Male" : "Female"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedCustomer.name}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.instagramId && (
                    <a
                      href={`https://instagram.com/${selectedCustomer.instagramId.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-pink-600 hover:underline font-semibold"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      {selectedCustomer.instagramId}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Stats in INR */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-500 block font-medium">
                  Total Visits
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedCustomerHistory.length}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-500 block font-medium">
                  Lifetime Spent
                </span>
                <span className="text-lg font-bold text-red-600">
                  ₹
                  {selectedCustomerHistory
                    .reduce((acc, s) => acc + s.total, 0)
                    .toFixed(0)}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-xs text-slate-500 block font-medium">
                  Drinks Bought
                </span>
                <span className="text-lg font-bold text-amber-600">
                  {selectedCustomerHistory.reduce(
                    (acc, s) =>
                      acc +
                      s.items.reduce((sum, it) => sum + it.quantity, 0),
                    0
                  )}
                </span>
              </div>
            </div>

            {/* Purchase Log */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-red-600" />
                <span>Juice Purchase Log by Date</span>
              </h4>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedCustomerHistory.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6">
                    No purchase history yet for this client.
                  </p>
                ) : (
                  selectedCustomerHistory.map((s) => {
                    const dateFormatted = new Date(s.date).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                    return (
                      <div
                        key={s.id}
                        className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                          <span className="text-slate-600 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {dateFormatted}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-bold text-sm">
                              ₹{s.total.toFixed(0)}
                            </span>
                            <button
                              onClick={() => onOpenReceipt(s)}
                              className="text-[11px] font-semibold bg-amber-100 hover:bg-yellow-400 text-amber-950 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Receipt #{s.id}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {s.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-slate-700 pl-2 border-l-2 border-red-500"
                            >
                              <div>
                                <span className="font-semibold text-slate-900">
                                  {it.productName}
                                </span>{" "}
                                <span className="text-slate-400 text-[11px]">
                                  [{it.variantName}]
                                </span>
                              </div>
                              <span className="text-red-600 font-bold">
                                x{it.quantity} (₹{it.total.toFixed(0)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="pixel-btn-yellow rounded-xl px-5 py-2 text-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW CUSTOMER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-red-600">
                Register New Client
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              {modalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Client ID*
                  </label>
                  <input
                    type="text"
                    required
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="009"
                    className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-2 text-xs text-slate-900 font-bold text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sahil Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Gender* (For Reporting)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGender("male")}
                    className={`py-1.5 text-xs rounded-lg border text-center transition-all cursor-pointer font-medium ${
                      newGender === "male"
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGender("female")}
                    className={`py-1.5 text-xs rounded-lg border text-center transition-all cursor-pointer font-medium ${
                      newGender === "female"
                        ? "bg-pink-50 border-pink-500 text-pink-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instagram Handle (Optional)
                </label>
                <input
                  type="text"
                  value={newInstagram}
                  onChange={(e) => setNewInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-pink-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 pixel-btn-white rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn-yellow rounded-lg px-5 py-2 text-xs cursor-pointer"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
