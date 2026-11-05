"use client";

import React, { useState, useEffect } from "react";
import { ContestOffer, CustomerPass, LeaderboardEntry, RewardVoucher } from "@/types";
import { storageService } from "@/services/storageService";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Zap,
  ArrowRight,
  Ticket,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";

interface OffersAndContestsViewProps {
  offers: ContestOffer[];
  currentPass: CustomerPass | null;
  onOpenPassModal: () => void;
  onExploreMenu: () => void;
}

export const OffersAndContestsView: React.FC<OffersAndContestsViewProps> = ({
  offers,
  currentPass,
  onOpenPassModal,
  onExploreMenu,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    offers[0]?.id || "offer-shakes-championship"
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const activeContests = offers.filter((o) => o.offerType === "contest_leaderboard");
  const otherOffers = offers.filter((o) => o.offerType !== "contest_leaderboard");
  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  useEffect(() => {
    if (currentOffer) {
      const board = storageService.computeLeaderboard(currentOffer.id);
      setLeaderboard(board);
    }
  }, [currentOffer, currentPass]);

  // Find user's standing
  const userEntry = leaderboard.find((e) => e.isCurrentUser);
  const leaderScore = leaderboard[0]?.totalScore || 0;
  const userScore = userEntry?.totalScore || 0;
  const deficit = Math.max(0, leaderScore - userScore + 1);

  return (
    <div className="space-y-6">
      {/* Contest Banner Hero */}
      <div className="border-4 border-slate-900 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#0f172a] text-slate-950 font-mono relative overflow-hidden">
        {/* Railway Station Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-950/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-950 text-amber-300 rounded-md">
              <Trophy className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-slate-900">
              STATION CHAMPIONSHIPS • MONTHLY TOURNAMENT
            </span>
          </div>
          <span className="text-[11px] font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Flame className="w-3.5 h-3.5" />
            LIVE LEADERBOARD
          </span>
        </div>

        {/* Contest Switcher Tabs */}
        {activeContests.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {activeContests.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedOfferId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer border-2 ${
                  selectedOfferId === c.id
                    ? "bg-slate-950 text-amber-300 border-slate-950 shadow-[2px_2px_0px_#000]"
                    : "bg-white/80 text-slate-800 border-slate-900/30 hover:bg-white"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        {/* Current Active Contest Details */}
        {currentOffer && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3 font-sans">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-mono leading-tight">
                {currentOffer.title}
              </h2>
              <p className="text-sm text-slate-900 font-medium leading-relaxed">
                {currentOffer.description}
              </p>

              {/* Prize Card */}
              <div className="bg-slate-950 text-amber-300 border-2 border-slate-950 rounded-xl p-3.5 shadow-sm font-mono space-y-1.5">
                <div className="text-[10px] uppercase text-amber-400 font-bold tracking-wider">
                  GRAND PRIZE REWARD
                </div>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>{currentOffer.reward.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-amber-200/80 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Valid until:{" "}
                    {new Date(currentOffer.redeemValidUntil).toLocaleDateString()}
                  </span>
                  <span>
                    • Daily Quota: Max {currentOffer.reward.maxRedemptionsPerDay || 2} free/day
                  </span>
                </div>
              </div>

              {/* Customer's Live Status */}
              <div className="bg-white/90 border-2 border-slate-900 rounded-xl p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Your Passenger Progress
                  </span>
                  {currentPass ? (
                    <div className="text-slate-900 font-bold mt-0.5">
                      You:{" "}
                      <span className="text-red-600 font-black font-mono">
                        {userScore} Drinks
                      </span>{" "}
                      • Current Rank:{" "}
                      <span className="font-black font-mono bg-amber-400 px-1.5 py-0.2 rounded">
                        #{userEntry?.rank || "Unranked"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-700">
                      Get your Rail Pass to claim your spot on the leaderboard!
                    </div>
                  )}
                </div>

                {currentPass ? (
                  <button
                    onClick={onExploreMenu}
                    className="bg-slate-950 hover:bg-slate-800 text-amber-300 font-mono font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>Drink to Win</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenPassModal}
                    className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>Board Now</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Live Leaderboard Standings (Right column) */}
            <div className="lg:col-span-5 bg-white border-3 border-slate-900 rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-2 font-mono">
                <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Platform Champions</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentOffer.targetScope.toUpperCase()} TALLY
                </span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {leaderboard.slice(0, 5).map((entry) => {
                  const isFirst = entry.rank === 1;
                  return (
                    <div
                      key={entry.pnr}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        entry.isCurrentUser
                          ? "bg-amber-100 border-amber-500 ring-2 ring-amber-400"
                          : isFirst
                          ? "bg-amber-50/80 border-amber-300 font-bold"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                            isFirst
                              ? "bg-amber-400 text-slate-950 border border-slate-950"
                              : entry.rank === 2
                              ? "bg-slate-300 text-slate-900"
                              : entry.rank === 3
                              ? "bg-amber-700/30 text-amber-900"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{entry.maskedName}</span>
                            {entry.isCurrentUser && (
                              <span className="bg-slate-900 text-amber-300 text-[9px] font-mono px-1 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">
                            PNR: {entry.pnr}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-black text-red-600 block">
                          {entry.totalScore}
                        </span>
                        <span className="text-[9px] text-slate-500">drinks</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leaderboard Footer Note */}
              <div className="mt-2 text-center text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-1.5">
                Drinks ordered online or punched at counter automatically count!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Offers Section: Happy Hours & Punchcard */}
      <div>
        <h3 className="text-sm font-black uppercase text-slate-900 font-mono mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>Station Perks & Daily Deals</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherOffers.map((offer) => (
            <div
              key={offer.id}
              className="border-3 border-slate-900 bg-white rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-black uppercase bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                    {offer.badge || "OFFER"}
                  </span>
                  {offer.code && (
                    <span className="text-xs font-mono font-black text-red-600 border border-dashed border-red-400 bg-red-50 px-2 py-0.5 rounded">
                      CODE: {offer.code}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-slate-950 font-mono mb-1">
                  {offer.title}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {offer.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Valid until {new Date(offer.endDate).toLocaleDateString()}
                </span>
                <button
                  onClick={onExploreMenu}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 border border-slate-950 text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
