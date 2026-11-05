"use client";

import React, { useState } from "react";
import { Product, ProductVariant, OrderItemCustomization } from "@/types";
import { X, Plus, Minus, Check, Sparkles } from "lucide-react";

interface DrinkCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    quantity: number,
    customization: OrderItemCustomization,
    finalPrice: number
  ) => void;
}

const ADDON_OPTIONS = [
  { id: "dry_fruits", name: "Dry Fruit Crunch", price: 30 },
  { id: "chia", name: "Organic Chia Seeds", price: 15 },
  { id: "ice_cream", name: "Vanilla Ice Cream Scoop", price: 40 },
  { id: "whey", name: "Whey Protein Booster (15g)", price: 60 },
];

export const DrinkCustomizationModal: React.FC<DrinkCustomizationModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { id: "default", name: "Regular", price: 90 }
  );
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState<
    "Normal (100%)" | "Less Sweet (50%)" | "Sugar-Free / Natural"
  >("Normal (100%)");
  const [iceLevel, setIceLevel] = useState<
    "Normal Chill" | "Less Ice" | "No Ice"
  >("Normal Chill");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Calculate Addon Prices
  const addonTotal = selectedAddons.reduce((sum, addonName) => {
    const item = ADDON_OPTIONS.find((a) => a.name === addonName);
    return sum + (item ? item.price : 0);
  }, 0);

  const unitTotal = selectedVariant.price + addonTotal;
  const grandTotal = unitTotal * quantity;

  const toggleAddon = (name: string) => {
    if (selectedAddons.includes(name)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== name));
    } else {
      setSelectedAddons([...selectedAddons, name]);
    }
  };

  const handleConfirm = () => {
    onAddToCart(
      product,
      selectedVariant,
      quantity,
      {
        sugarLevel,
        iceLevel,
        addons: selectedAddons,
      },
      grandTotal
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-amber-50 rounded-2xl shadow-2xl border-4 border-slate-900 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-amber-400 p-4 flex items-center justify-between border-b-2 border-amber-400">
          <div>
            <span className="text-[10px] font-mono uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
              DRINK CUSTOMIZER
            </span>
            <h3 className="font-mono text-base font-black tracking-wide text-white mt-1">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Size Variant Picker */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-2">
              Select Size & Portion
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-slate-950 bg-amber-400 shadow-[2px_2px_0px_#0f172a]"
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {v.name}
                    </div>
                    <div className="text-sm font-black text-red-600 mt-1">
                      ₹{v.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sugar Level */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-2">
              Sweetness Preference
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(
                [
                  "Normal (100%)",
                  "Less Sweet (50%)",
                  "Sugar-Free / Natural",
                ] as const
              ).map((sugar) => (
                <button
                  key={sugar}
                  type="button"
                  onClick={() => setSugarLevel(sugar)}
                  className={`p-2 rounded-lg border-2 font-medium transition-colors cursor-pointer text-center ${
                    sugarLevel === sugar
                      ? "border-slate-950 bg-slate-900 text-amber-300 font-bold"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  {sugar.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Level */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-2">
              Ice & Chill
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["Normal Chill", "Less Ice", "No Ice"] as const).map((ice) => (
                <button
                  key={ice}
                  type="button"
                  onClick={() => setIceLevel(ice)}
                  className={`p-2 rounded-lg border-2 font-medium transition-colors cursor-pointer text-center ${
                    iceLevel === ice
                      ? "border-slate-950 bg-slate-900 text-amber-300 font-bold"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  {ice}
                </button>
              ))}
            </div>
          </div>

          {/* Addons & Boosters */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 font-mono mb-2 flex items-center justify-between">
              <span>Platform Add-ons & Boosters</span>
              <span className="text-[10px] text-slate-500 font-sans font-normal">
                Optional
              </span>
            </label>
            <div className="space-y-1.5">
              {ADDON_OPTIONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.name);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.name)}
                    className={`w-full p-2.5 rounded-lg border-2 flex items-center justify-between transition-colors cursor-pointer ${
                      isChecked
                        ? "border-slate-900 bg-amber-200/80"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked
                            ? "bg-slate-900 border-slate-900 text-amber-300"
                            : "border-slate-400 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {addon.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 font-mono">
                      +₹{addon.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3">
            <span className="text-xs font-black uppercase text-slate-900 font-mono">
              Quantity
            </span>
            <div className="flex items-center border-2 border-slate-900 rounded-lg bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-black font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer & Submit Button */}
        <div className="bg-slate-900 p-4 border-t-2 border-amber-400 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-200/80 font-mono block">
              TOTAL PRICE
            </span>
            <div className="text-xl font-black text-amber-400 font-mono">
              ₹{grandTotal}
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 border-2 border-slate-950 font-mono font-black px-5 py-2.5 rounded-lg shadow-[3px_3px_0px_#000] hover:shadow-none transition-all uppercase text-xs cursor-pointer"
          >
            Add to Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
