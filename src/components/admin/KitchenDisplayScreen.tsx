"use client";

import React, { useState, useEffect } from "react";
import { OnlineOrder, OrderStatus } from "@/types";
import { storageService } from "@/services/storageService";
import { audioService } from "@/lib/audioService";
import {
  Train,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  Bell,
  ChefHat,
  Filter,
  MapPin,
} from "lucide-react";

export const KitchenDisplayScreen: React.FC = () => {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "ready">("active");

  const refreshOrders = () => {
    setOrders(storageService.getOnlineOrders());
  };

  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    storageService.updateOrderStatus(orderId, newStatus);
    if (newStatus === "ready") {
      audioService.playStationChime();
    }
    refreshOrders();
  };

  const handleChimeOrder = (ticketId: string) => {
    audioService.speakAnnouncement(
      `Attention please, ticket number ${ticketId.replace(
        "-",
        " "
      )} is ready at platform counter.`
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "active")
      return o.orderStatus !== "completed" && o.orderStatus !== "cancelled";
    if (filter === "ready") return o.orderStatus === "ready";
    return true;
  });

  return (
    <div className="space-y-5 font-mono">
      {/* Top LED Station KDS Header */}
      <div className="border-3 border-slate-900 bg-slate-950 text-amber-400 p-4 rounded-xl shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Platform Kitchen Display • Station KDS
            </h2>
            <p className="text-[11px] text-amber-200/80">
              Live Customer QR & Online Ticket Dispatch System
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filter === "active"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            Active Tickets ({orders.filter((o) => o.orderStatus !== "completed").length})
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filter === "ready"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            Ready at Counter ({orders.filter((o) => o.orderStatus === "ready").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filter === "all"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="border-3 border-dashed border-slate-300 bg-white rounded-xl p-8 text-center text-slate-500">
          <Train className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-sm">Platform Track Clear</p>
          <p className="text-xs text-slate-400">
            Incoming QR code orders from customers will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isReady = order.orderStatus === "ready";
            const isPreparing = order.orderStatus === "preparing";
            return (
              <div
                key={order.id}
                className={`border-3 border-slate-900 rounded-xl overflow-hidden shadow-[3px_3px_0px_#0f172a] bg-white flex flex-col justify-between ${
                  isReady ? "ring-4 ring-amber-400" : ""
                }`}
              >
                {/* Order Top Bar */}
                <div
                  className={`p-3 border-b-2 border-slate-900 flex items-center justify-between ${
                    isReady
                      ? "bg-red-600 text-white"
                      : isPreparing
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-900 text-amber-300"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold block uppercase tracking-wider">
                      {order.orderType.replace("_", " ")}
                    </span>
                    <h3 className="text-base font-black tracking-wide">
                      {order.id} • {order.customerName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold block uppercase">
                      PNR: {order.pnr}
                    </span>
                    <span className="text-xs font-black">₹{order.total}</span>
                  </div>
                </div>

                {/* Items & Customizations */}
                <div className="p-3.5 space-y-2.5 flex-1 text-xs">
                  {order.notes && (
                    <div className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded border border-amber-300 font-bold text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                      <span>{order.notes}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 p-2 rounded-lg"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-red-600 font-mono">
                            {item.variantName}
                          </span>
                        </div>
                        {item.customization && (
                          <div className="text-[10px] text-slate-600 font-sans mt-0.5 space-y-0.5">
                            <div>
                              Sugar:{" "}
                              <strong className="text-slate-900">
                                {item.customization.sugarLevel}
                              </strong>{" "}
                              • Ice:{" "}
                              <strong className="text-slate-900">
                                {item.customization.iceLevel}
                              </strong>
                            </div>
                            {item.customization.addons.length > 0 && (
                              <div className="text-amber-800 font-bold">
                                Boosters: {item.customization.addons.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Changer Actions */}
                <div className="p-3 bg-slate-100 border-t-2 border-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Current Platform Status:</span>
                    <span className="font-black uppercase bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[10px]">
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {order.orderStatus === "new" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "accepted")}
                        className="col-span-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Accept Order
                      </button>
                    )}

                    {order.orderStatus === "accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "preparing")}
                        className="col-span-2 bg-amber-400 hover:bg-amber-500 text-slate-950 border border-slate-950 font-black py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Start Preparing (Blenders On)
                      </button>
                    )}

                    {order.orderStatus === "preparing" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "ready")}
                        className="col-span-2 bg-red-600 hover:bg-red-700 text-white font-black py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 animate-bounce" />
                        <span>Mark Ready (Play Chimes)</span>
                      </button>
                    )}

                    {order.orderStatus === "ready" && (
                      <>
                        <button
                          onClick={() => handleChimeOrder(order.id)}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 border border-slate-950 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                          title="Broadcast Station Chime"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Announce</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, "completed")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer text-[11px]"
                        >
                          Delivered ✓
                        </button>
                      </>
                    )}

                    {order.orderStatus === "completed" && (
                      <div className="col-span-2 text-center text-[11px] text-emerald-700 font-bold py-1">
                        ✓ Journey Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
