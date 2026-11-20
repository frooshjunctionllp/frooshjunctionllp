"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import { drinkCopy } from "@/lib/drinkCopy";
import type { Product, ProductVariant, OrderItemCustomization } from "@/types";

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number, customization: OrderItemCustomization | undefined, finalPrice: number) => void;
}

export function DrinkCustomizationModal({ product, isOpen, onClose, onAddToCart }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [variantId, setVariantId] = useState(product?.variants.find(v => v.isAvailable !== false)?.id);
  const [quantity, setQuantity] = useState(1);
  const variants = product?.variants.filter(v => v.isAvailable !== false) ?? [];
  const selected = variants.find(v => v.id === variantId) ?? variants[0];

  useEffect(() => {
    const element = dialog.current;
    if (isOpen && product) element?.showModal();
    else element?.close();
    return () => element?.close();
  }, [isOpen, product]);

  if (!isOpen || !product) return null;
  return <dialog ref={dialog} className="size-dialog" aria-labelledby="size-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="size-dialog-heading"><span className="station-label">YOUR DRINK TICKET</span><button onClick={onClose} aria-label="Close size selection"><X size={22} /></button></div>
    <h2 id="size-dialog-title">{drinkCopy(product.name)}</h2>
    <p>Pick your size. We’ll take it from here.</p>
    <fieldset><legend>Choose a size</legend><div className="size-options">{variants.map(v => <label key={v.id} className={v.id === selected?.id ? "selected" : ""}>
      <input type="radio" name="drink-size" value={v.id} checked={v.id === selected?.id} onChange={() => setVariantId(v.id)} />
      <span>{v.name}<strong>₹{v.price}</strong></span><Check size={18} aria-hidden="true" />
    </label>)}</div></fieldset>
    {!selected && <p role="status">This drink is currently unavailable.</p>}
    <div className="size-quantity"><span>Quantity</span><div><button aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18} /></button><output aria-live="polite">{quantity}</output><button aria-label="Increase quantity" onClick={() => setQuantity(q => q + 1)}><Plus size={18} /></button></div></div>
    <button className="station-button station-button-primary size-confirm" disabled={!selected} onClick={() => { if (selected) { onAddToCart(product, selected, quantity, undefined, selected.price * quantity); onClose(); } }}>Add to order <strong>₹{selected ? selected.price * quantity : 0}</strong></button>
  </dialog>;
}
