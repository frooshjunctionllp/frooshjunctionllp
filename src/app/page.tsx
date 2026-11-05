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
        <div className="text-center space-y-3 font-mono">
          <p className="text-sm font-bold text-red-600 animate-pulse">
            Loading Froosh Junction Platform...
          </p>
        </div>
      </div>
    );
  }

  return <CustomerView categories={categories} products={products} />;
}
