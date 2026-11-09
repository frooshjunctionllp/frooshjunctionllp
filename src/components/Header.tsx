"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { Store, ShoppingBag, Layers, Users, BarChart3, Receipt, Briefcase, ArrowUpRight, ArrowRightLeft, LogOut, ChefHat, Tag, Menu, X, ChevronRight, Clock3 } from "lucide-react";
import type { AuthSession } from "@/types";

export type ActiveTab = "pos" | "kds" | "offers" | "menu" | "customers" | "workers" | "sales" | "reports";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: { todaySalesCount: number; todayRevenue: number; totalCustomers: number };
  currentUser: AuthSession | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenCustomerPortal?: () => void;
}

const sections: { label: string; items: { id: ActiveTab; label: string; icon: ComponentType<{ size?: number }>; adminOnly?: boolean }[] }[] = [
  { label: "Workspace", items: [
    { id: "pos", label: "Point of sale", icon: Store },
    { id: "kds", label: "Live orders", icon: ChefHat },
    { id: "menu", label: "Menu & categories", icon: Layers, adminOnly: true },
  ] },
  { label: "Management", items: [
    { id: "customers", label: "Customers", icon: Users, adminOnly: true },
    { id: "workers", label: "Team members", icon: Briefcase, adminOnly: true },
    { id: "offers", label: "Offers & rewards", icon: Tag, adminOnly: true },
  ] },
  { label: "Business", items: [
    { id: "sales", label: "Sales history", icon: Receipt, adminOnly: true },
    { id: "reports", label: "Reports & insights", icon: BarChart3, adminOnly: true },
  ] },
];

const pageCopy: Record<ActiveTab, { title: string; description: string }> = {
  pos: { title: "Point of sale", description: "Build an order and manage checkout." },
  kds: { title: "Live orders", description: "Track preparation, pickup, and completed orders." },
  menu: { title: "Menu & categories", description: "Manage drinks, sizes, prices, and availability." },
  customers: { title: "Customers", description: "Customer details, purchase history, and favourite drinks." },
  workers: { title: "Team members", description: "Manage your team, account access, and shifts." },
  offers: { title: "Offers & rewards", description: "Manage campaigns, contests, and customer rewards." },
  sales: { title: "Sales history", description: "Review transactions, payments, and receipts." },
  reports: { title: "Reports & insights", description: "Explore sales performance and customer trends." },
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function Header({ activeTab, setActiveTab, stats, currentUser, onOpenAuthModal, onLogout, onOpenCustomerPortal }: HeaderProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const isAdmin = currentUser?.role === "admin";
  const activeLabel = sections.flatMap((section) => section.items).find((item) => item.id === activeTab)?.label;
  const initials = currentUser?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "FJ";

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
      setDate(now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navigation.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const buttons = navigation.current?.querySelectorAll<HTMLButtonElement>("button, a[href]");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
  }, [navigationOpen]);

  const closeNavigation = () => { setNavigationOpen(false); menuButton.current?.focus(); };
  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (navigationOpen) closeNavigation();
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return <>
    <a href="#dashboard-content" className="dashboard-skip-link">Skip to workspace</a>
    {navigationOpen && <button className="dashboard-nav-scrim" onClick={closeNavigation} aria-label="Close navigation" tabIndex={-1} />}
    <aside ref={navigation} id="dashboard-navigation" className={`dashboard-sidebar ${navigationOpen ? "is-open" : ""}`} aria-label="Workspace navigation" role={navigationOpen ? "dialog" : undefined} aria-modal={navigationOpen || undefined}>
      <div className="dashboard-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png" alt="Froosh Junction" />
        <button className="dashboard-nav-close" onClick={closeNavigation} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <div className="dashboard-location"><span className="dashboard-location-icon"><Store size={17} /></span><div><strong>Entally, Kolkata</strong><span>{isAdmin ? "Store management" : "Staff terminal"}</span></div><span className="dashboard-status-dot" /></div>
      <nav aria-label="Main navigation" className="dashboard-nav">
        {sections.map((section) => {
          const items = section.items.filter((item) => !item.adminOnly || isAdmin);
          return items.length > 0 && <div className="dashboard-nav-group" key={section.label}>
            <p>{section.label}</p>
            {items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectTab(id)} className={`dashboard-nav-item ${activeTab === id ? "is-active" : ""}`} aria-current={activeTab === id ? "page" : undefined}><Icon size={18} /><span>{label}</span>{activeTab === id && <span className="dashboard-nav-indicator" />}</button>)}
          </div>;
        })}
      </nav>
      <div className="dashboard-sidebar-bottom">
        {onOpenCustomerPortal && <button onClick={onOpenCustomerPortal} className="dashboard-storefront"><span>Customer storefront<small>Open the QR menu</small></span><ArrowUpRight size={18} /></button>}
        <div className="dashboard-profile"><span className="dashboard-avatar">{initials}</span><div><strong title={currentUser?.name}>{currentUser?.name || "Team member"}</strong><small>{isAdmin ? "Store administrator" : "Team member"}</small></div>{isAdmin && <button onClick={onOpenAuthModal} className="dashboard-icon-button" aria-label="Switch account" title="Switch account"><ArrowRightLeft size={16} /></button>}</div>
        <button className="dashboard-signout" onClick={onLogout}><LogOut size={16} /><span>{isAdmin ? "Sign out" : "End shift & sign out"}</span></button>
      </div>
    </aside>
    <header className="dashboard-topbar">
      <div className="dashboard-breadcrumb"><button ref={menuButton} className="dashboard-menu-button dashboard-icon-button" aria-label="Open navigation" aria-expanded={navigationOpen} aria-controls="dashboard-navigation" onClick={() => setNavigationOpen(true)}><Menu size={21} /></button><span>Workspace</span><ChevronRight size={13} /><strong>{activeLabel}</strong></div>
      <div className="dashboard-topbar-meta"><span className="dashboard-date">{date}</span><span className="dashboard-clock"><Clock3 size={14} />{time}</span><span className="dashboard-access-label">{isAdmin ? "Admin" : "Staff"}</span></div>
    </header>
    <section className="dashboard-page-intro" aria-labelledby="dashboard-page-title">
      <div><h1 id="dashboard-page-title">{pageCopy[activeTab].title}</h1><p className="dashboard-page-description">{pageCopy[activeTab].description}</p></div>
    </section>
    {isAdmin && activeTab === "pos" && <section className="dashboard-metrics" aria-label="Store summary">
      <div><span className="dashboard-metric-icon"><Receipt size={19} /></span><div><p>Today&apos;s revenue</p><strong>{currency.format(stats.todayRevenue)}</strong></div><span className="dashboard-metric-note">Today</span></div>
      <div><span className="dashboard-metric-icon"><ShoppingBag size={19} /></span><div><p>Counter sales today</p><strong>{stats.todaySalesCount.toLocaleString("en-IN")}</strong></div><span className="dashboard-metric-note">Receipts</span></div>
      <div><span className="dashboard-metric-icon"><Users size={19} /></span><div><p>Customer directory</p><strong>{stats.totalCustomers.toLocaleString("en-IN")}</strong></div><span className="dashboard-metric-note">All time</span></div>
    </section>}
  </>;
}
