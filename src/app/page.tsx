"use client";

import React, { useState, useEffect } from "react";
import { Category, Product } from "@/types";
import { storageService } from "@/services/storageService";
import { CustomerView } from "@/components/customer/CustomerView";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    storageService.init();
    setCategories(storageService.getCategories());
    setProducts(storageService.getProducts());
    setIsLoaded(true);

    // Sync categories & products from MongoDB Atlas in background
    storageService.syncFromMongo().then((updates) => {
      if (updates.categories) setCategories(updates.categories);
      if (updates.products) setProducts(updates.products);
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-4 font-mono max-w-sm mx-auto">
          <div className="flex justify-center mb-2">
            <img
              src="https://res.cloudinary.com/l5vaptox/image/upload/v1793879357/Froosh_Junction_Juice_Full_Logo.png"
              alt="Froosh Junction"
              className="h-16 w-auto object-contain animate-pulse"
            />
          </div>
          <div className="relative inline-flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-full border-3 border-amber-400 border-t-red-600 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Loading Froosh Junction Platform...
          </p>
        </div>
      </div>
    );
  }

  return <CustomerView categories={categories} products={products} />;
}
