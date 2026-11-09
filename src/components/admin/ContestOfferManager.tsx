"use client";

import React, { useState } from "react";
import { ContestOffer, OfferType, Product, RewardVoucher } from "@/types";
import { storageService } from "@/services/storageService";
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  Zap,
} from "lucide-react";

interface ContestOfferManagerProps {
  offers: ContestOffer[];
  products: Product[];
  onOffersUpdated: (updated: ContestOffer[]) => void;
}

export const ContestOfferManager: React.FC<ContestOfferManagerProps> = ({
  offers,
  products,
  onOffersUpdated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [declaredMessage, setDeclaredMessage] = useState("");

  // Form State for Custom Offer Creation
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offerType, setOfferType] = useState<OfferType>("contest_leaderboard");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [targetScope, setTargetScope] = useState<"all" | "shakes" | "juices" | "specific_product">("shakes");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [metric, setMetric] = useState<"drink_count" | "spend_amount" | "order_count">("drink_count");
  const [winnerCount, setWinnerCount] = useState(1);
  const [rewardQty, setRewardQty] = useState(100);
  const [maxPerDay, setMaxPerDay] = useState(2);
  const [redeemExpiryDate, setRedeemExpiryDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [badgeText, setBadgeText] = useState("CHAMPIONSHIP");

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newOffer: ContestOffer = {
      id: `offer-${Date.now()}`,
      title: title.trim(),
      badge: badgeText.toUpperCase(),
      description: description.trim(),
      offerType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
      targetScope,
      targetProductIds:
        targetScope === "specific_product" && selectedProductId
          ? [selectedProductId]
          : undefined,
      evaluationMetric: metric,
      winnerCount: Number(winnerCount),
      reward: {
        type: "free_drinks",
        productScope: targetScope === "shakes" ? "shakes" : targetScope === "juices" ? "juices" : "any",
        quantity: Number(rewardQty),
        maxRedemptionsPerDay: Number(maxPerDay),
        title: `${rewardQty} Free ${
          targetScope === "shakes" ? "Shakes" : targetScope === "juices" ? "Juices" : "Drinks"
        } (Max ${maxPerDay}/day)`,
      },
      redeemValidUntil: new Date(`${redeemExpiryDate}T23:59:59.000Z`).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const updated = storageService.saveOffer(newOffer);
    onOffersUpdated(updated);
    setIsCreating(false);
    setTitle("");
    setDescription("");
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm("Are you sure you want to remove this campaign offer?")) {
      const updated = storageService.deleteOffer(id);
      onOffersUpdated(updated);
    }
  };

  const handleDeclareWinner = (offerId: string) => {
    const vouchers = storageService.declareContestWinners(offerId);
    if (vouchers.length > 0) {
      setDeclaredMessage(
        `Winners declared! Issued ${vouchers.length} digital reward vouchers to Passenger PNR: ${vouchers
          .map((v) => `${v.customerName} (${v.pnr})`)
          .join(", ")}.`
      );
      onOffersUpdated(storageService.getOffers());
      setTimeout(() => setDeclaredMessage(""), 8000);
    } else {
      setDeclaredMessage("No qualifying passengers found on leaderboard to award.");
      setTimeout(() => setDeclaredMessage(""), 4000);
    }
  };

  return (
    <div className="campaign-manager space-y-6">
      {/* Top Banner */}
      <div className="dashboard-panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-800 font-mono">
            CUSTOMER REWARDS
          </span>
          <h2 className="text-xl font-black text-slate-950 uppercase font-mono">
            Offers & campaigns
          </h2>
          <p className="text-xs text-slate-800 mt-0.5">
            Happy hours, seasonal contests, and a little extra for your regulars.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="pixel-btn-red text-xs px-4 py-2.5 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? "Cancel" : "Create campaign"}</span>
        </button>
      </div>

      {declaredMessage && (
        <div className="bg-emerald-100 border-2 border-emerald-500 text-emerald-900 p-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{declaredMessage}</span>
        </div>
      )}

      {/* Creation Form Modal / Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateOffer}
          className="border-3 border-slate-900 bg-white rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] space-y-4 font-mono"
        >
          <div className="border-b-2 border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-950 uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>New campaign</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grand November Shakes Championship"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Campaign Badge / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. PLATFORM CHAMPIONSHIP"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-medium uppercase"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-black text-slate-900 uppercase mb-1">
                Public Description *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Drink the most number of gourmet shakes between Nov 1 and Nov 30 to win 100 Free Shakes!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-sans text-xs"
              />
            </div>

            {/* Campaign Archetype */}
            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Campaign Archetype
              </label>
              <select
                value={offerType}
                onChange={(e) => setOfferType(e.target.value as OfferType)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-bold cursor-pointer"
              >
                <option value="contest_leaderboard">
                  Tournament / Drink Championship (Leaderboard)
                </option>
                <option value="happy_hours">Platform Rush Hour (Happy Hours)</option>
                <option value="punchcard_milestone">Station Stamp / Milestone (Buy 5 Get 1)</option>
                <option value="flat_discount">Flat Minimum Order Value Discount</option>
              </select>
            </div>

            {/* Target Drinks Scope */}
            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Target Drink Category
              </label>
              <select
                value={targetScope}
                onChange={(e) =>
                  setTargetScope(
                    e.target.value as "all" | "shakes" | "juices" | "specific_product"
                  )
                }
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-bold cursor-pointer"
              >
                <option value="shakes">Shakes Only (cat-shakes)</option>
                <option value="juices">Juices Only (cat-juices)</option>
                <option value="all">All Platform Beverages</option>
                <option value="specific_product">Specific Single Item</option>
              </select>
            </div>

            {targetScope === "specific_product" && (
              <div className="md:col-span-2">
                <label className="block font-black text-slate-900 uppercase mb-1">
                  Select Specific Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-medium cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Pickers */}
            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                End Date (Tally Closes)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2"
              />
            </div>

            {/* Reward Definition */}
            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Prize Free Drink Quantity
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={rewardQty}
                onChange={(e) => setRewardQty(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-black text-red-600"
              />
              <span className="text-[10px] text-slate-500">
                e.g. 100 free drinks awarded to winner
              </span>
            </div>

            <div>
              <label className="block font-black text-slate-900 uppercase mb-1">
                Daily Redemption Cap (Per Visit)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxPerDay}
                onChange={(e) => setMaxPerDay(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2 font-black"
              />
              <span className="text-[10px] text-slate-500">
                Protects inventory (e.g. max 2 free drinks per day)
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block font-black text-slate-900 uppercase mb-1">
                Prize Redemption Expiry Date
              </label>
              <input
                type="date"
                required
                value={redeemExpiryDate}
                onChange={(e) => setRedeemExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2"
              />
              <span className="text-[10px] text-slate-500">
                Winners can only redeem their prize before this date
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 border-2 border-slate-950 rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Publish Campaign
            </button>
          </div>
        </form>
      )}

      {/* Active Campaigns List */}
      <div className="space-y-3 font-mono">
        <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <span>Active Station Campaigns ({offers.length})</span>
        </h3>

        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border-3 border-slate-900 bg-white rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {offer.badge || offer.offerType}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      offer.status === "active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-400"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-950">
                  {offer.title}
                </h4>
                <p className="text-xs text-slate-600 font-sans">
                  {offer.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>
                    Duration: {new Date(offer.startDate).toLocaleDateString()} to{" "}
                    {new Date(offer.endDate).toLocaleDateString()}
                  </span>
                  <span>
                    Reward: <strong>{offer.reward.title}</strong>
                  </span>
                  <span>
                    Redeem by:{" "}
                    {new Date(offer.redeemValidUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {offer.offerType === "contest_leaderboard" && (
                  <button
                    onClick={() => handleDeclareWinner(offer.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg border border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Calculate leaderboard and credit vouchers to top passenger"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Award Winner</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 p-2 rounded-lg transition-colors cursor-pointer"
                  title="Delete offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
