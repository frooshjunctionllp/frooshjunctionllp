"use client";
import { Train, ShoppingBag, Ticket } from "lucide-react";
import type { CustomerPass } from "@/types";
export type CustomerTab = "home" | "menu" | "monitor" | "offers" | "contact";
export function JunctionHeader({ activeTab, onTab, currentPass, cartCount, onAccount, onCart, time }: { activeTab: CustomerTab; onTab: (tab: CustomerTab) => void; currentPass: CustomerPass | null; cartCount: number; onAccount: () => void; onCart: () => void; time: string }) {
  return <>
    <div className="station-announcement"><span><Train size={13} /> YOUR NEXT FRESH STOP</span><span>ENTALLY, KOLKATA <span className="station-announcement-time">· {time}</span></span></div>
    <header className="station-header">
      <button className="station-logo" onClick={() => onTab("home")} aria-label="Froosh Junction home"><img src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png" alt="Froosh Junction" /></button>
      <nav className="station-navigation" aria-label="Customer navigation">{([{id:"home",label:"Home"},{id:"menu",label:"Menu"},{id:"monitor",label:"My visits"},{id:"offers",label:"Offers"},{id:"contact",label:"Visit us"}] as const).map(tab => <button key={tab.id} aria-current={activeTab === tab.id ? "page" : undefined} onClick={() => onTab(tab.id)}>{tab.label}</button>)}</nav>
      <div className="station-header-actions"><button className="station-account" onClick={onAccount}><Ticket size={16} /><span>{currentPass ? currentPass.name.split(" ")[0] : "Your account"}</span></button><button className="station-cart" onClick={onCart} aria-label={`View order, ${cartCount} items`}><ShoppingBag size={18}/><span>Order</span><b>{cartCount}</b></button></div>
    </header>
  </>;
}
