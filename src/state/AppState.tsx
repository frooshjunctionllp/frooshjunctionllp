"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { storageService } from "@/services/storageService";
import type { Category, Product, Customer, Sale, WorkerUser, AuthSession, ContestOffer, OnlineOrder } from "@/types";

const initialState = {
  categories: [] as Category[], products: [] as Product[], customers: [] as Customer[],
  sales: [] as Sale[], workers: [] as WorkerUser[], offers: [] as ContestOffer[],
  onlineOrders: [] as OnlineOrder[], currentUser: null as AuthSession | null, isLoaded: false,
  todayStr: "",
};
const AppContext = createContext(initialState);

/** One reactive cache for every portal; storage events also synchronize open tabs. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    const refresh = () => {
      storageService.init();
      setState({
        categories: storageService.getCategories(), products: storageService.getProducts(),
        customers: storageService.getCustomers(), sales: storageService.getSales(),
        workers: storageService.getWorkers(), offers: storageService.getOffers(),
        onlineOrders: storageService.getOnlineOrders(), currentUser: storageService.getCurrentUser(),
        isLoaded: true,
        todayStr: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
      });
    };
    window.addEventListener("froosh:change", refresh);
    window.addEventListener("storage", refresh);
    refresh();
    void storageService.syncFromMongo();
    return () => {
      window.removeEventListener("froosh:change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export const useAppState = () => useContext(AppContext);
