"use client";

import { ArrowRight, CheckCircle2, ChevronRight, Clock, GlassWater, MapPin, Milk, ShoppingBag, Ticket, Train } from "lucide-react";
import type { Category, Product } from "@/types";

interface PlatformProps {
  categories: Category[];
  products: Product[];
  onMenu: (categoryId?: string) => void;
}

export function StationOrderGuide() {
  return <section id="station-order-guide" aria-labelledby="order-guide-heading" className="scroll-mt-44 border-3 border-slate-900 bg-white rounded-xl p-5 sm:p-6 shadow-[3px_3px_0px_#0f172a]">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-slate-900 pb-4">
      <div><p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600">First visit? Start here</p><h2 id="order-guide-heading" className="mt-1 font-mono font-black uppercase text-lg sm:text-xl text-slate-950">Your order in three stops</h2></div>
      <span className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 rounded-md px-2.5 py-1.5 text-[10px] font-mono font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Browse without signing in</span>
    </div>
    <ol className="grid sm:grid-cols-3 gap-5 sm:gap-7 mt-5">
      {[
        { number: "01", icon: GlassWater, title: "Pick your drink", text: "Open the menu and choose a juice or shake." },
        { number: "02", icon: ShoppingBag, title: "Make it yours", text: "Choose a size, adjust sweetness and ice, then add it to your order." },
        { number: "03", icon: Ticket, title: "Checkout & track", text: "Enter your name and phone, choose how to receive your order, and follow its status." },
      ].map(({ number, icon: Icon, title, text }) => <li key={number} className="flex items-start gap-3">
        <span className="shrink-0 w-10 h-10 border-2 border-slate-900 bg-amber-400 rounded-lg grid place-items-center font-mono font-black text-sm">{number}</span>
        <div><h3 className="font-mono font-bold text-sm flex items-center gap-1.5 text-slate-950"><Icon className="w-3.5 h-3.5 text-red-600 shrink-0" />{title}</h3><p className="text-xs text-slate-600 leading-relaxed mt-2 max-w-[34ch]">{text}</p></div>
      </li>)}
    </ol>
  </section>;
}

export function StationPlatforms({ categories, products, onMenu }: PlatformProps) {
  return <section aria-labelledby="platforms-heading" className="space-y-4">
    <div className="flex items-center gap-2"><Train className="w-5 h-5 text-red-600" /><h2 id="platforms-heading" className="font-mono text-lg font-black uppercase text-slate-950">Choose your platform</h2></div>
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { key: "juices", number: "01", title: "Juices", text: "A refreshing stop for a fruity favourite.", icon: GlassWater },
        { key: "shakes", number: "02", title: "Shakes", text: "Take a break with a shake you love.", icon: Milk },
      ].map(({ key, number, title, text, icon: Icon }) => {
        const category = categories.find(item => item.slug === key || item.id === `cat-${key}`);
        const count = products.filter(item => item.categoryId === category?.id && item.isAvailable !== false && item.variants.some(variant => variant.isAvailable !== false)).length;
        return <button key={key} onClick={() => onMenu(category?.id)} className="text-left border-3 border-slate-900 rounded-xl bg-amber-100 p-5 sm:p-6 shadow-[3px_3px_0px_#0f172a] hover:bg-amber-200 transition-colors flex items-center gap-4 group">
          <span className="bg-slate-950 text-amber-400 rounded-lg border-2 border-slate-900 p-3 shrink-0"><Icon className="w-7 h-7" /></span>
          <div className="flex-1"><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600">Platform {number}</span><h3 className="font-mono text-xl font-black text-slate-950 mt-1">{title}</h3><p className="text-xs text-slate-600 mt-1">{text}</p><span className="block mt-3 text-[10px] font-mono font-bold text-red-700">{count > 0 ? `${count} available · Browse ${title.toLowerCase()}` : `Explore ${title.toLowerCase()}`}</span></div>
          <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>;
      })}
    </div>
  </section>;
}

export function StationVisitorInfo({ onVisit, onOffers }: { onVisit: () => void; onOffers: () => void }) {
  return <>
    <section className="border-3 border-slate-900 bg-amber-400 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[3px_3px_0px_#0f172a]" aria-labelledby="offers-guide-heading">
      <div className="flex items-center gap-3"><Ticket className="w-7 h-7 shrink-0" /><div><h2 id="offers-guide-heading" className="font-mono text-base font-black uppercase">Check the offers board</h2><p className="text-xs mt-1">Find current offers, contests, and rewards before you order.</p></div></div>
      <button onClick={onOffers} className="inline-flex items-center justify-center gap-2 bg-slate-950 text-amber-300 border-2 border-slate-900 rounded-lg px-4 py-2.5 font-mono text-xs font-bold shrink-0 hover:bg-slate-800">View offers <ArrowRight className="w-4 h-4" /></button>
    </section>
    <section className="grid lg:grid-cols-2 gap-5" aria-label="Visit and ordering information">
      <div className="border-3 border-slate-900 bg-white rounded-xl p-5 sm:p-6 shadow-[3px_3px_0px_#0f172a]">
        <p className="text-[10px] font-mono font-bold uppercase text-red-600 tracking-widest">Before you board</p><h2 className="font-mono text-lg font-black uppercase mt-1 mb-4">A few useful answers</h2>
        {[
          ["Do I need an account to order?", "You can browse and build your order first. Add your name and phone number at checkout so we can identify your order."],
          ["Can I customise my drink?", "Yes. Open a drink to choose your size, sweetness, ice preference, and any available extras before adding it."],
          ["How do I track my order?", "Your tracker opens after you place an order. You can reopen it from the live order banner on the home page."],
        ].map(([question, answer]) => <details key={question} className="group border-t border-slate-200 py-3"><summary className="cursor-pointer list-none flex justify-between items-center gap-3 font-mono font-bold text-xs"><span>{question}</span><ChevronRight className="w-4 h-4 shrink-0 group-open:rotate-90 transition-transform" /></summary><p className="text-xs text-slate-600 leading-relaxed pt-3 pr-5">{answer}</p></details>)}
      </div>
      <div className="border-3 border-slate-900 bg-slate-950 text-white rounded-xl p-5 sm:p-6 shadow-[3px_3px_0px_#f59e0b] flex flex-col items-start">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">Your neighbourhood junction</span><h2 className="font-mono font-black text-xl uppercase mt-2">Meet us at the counter</h2>
        <p className="text-sm text-slate-300 leading-relaxed mt-3">A stop for juices, shakes, and a little railway spirit in the heart of Entally.</p>
        <div className="space-y-3 my-5 text-xs text-slate-300"><p className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 text-amber-400" /><span>Padma Pukur, Bihar Bus Stand<br />Entally, Kolkata · 700014</span></p><p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /><span>Daily · 10:00 AM – 11:30 PM</span></p></div>
        <button onClick={onVisit} className="mt-auto inline-flex items-center gap-2 font-mono font-bold text-xs bg-amber-400 text-slate-950 border-2 border-amber-400 px-4 py-2.5 rounded-lg hover:bg-amber-300">Location & contact <ArrowRight className="w-4 h-4" /></button>
      </div>
    </section>
  </>;
}
