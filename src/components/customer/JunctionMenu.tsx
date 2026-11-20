"use client";

import { useState } from "react";
import { GlassWater, Search } from "lucide-react";
import { drinkCopy } from "@/lib/drinkCopy";
import type { Category, Product } from "@/types";

export function JunctionMenu({ products, categories, onChoose }: { products: Product[]; categories: Category[]; onChoose: (product: Product) => void }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const available = products.filter(p => p.isAvailable !== false && p.variants.some(v => v.isAvailable !== false));
  const visible = available.filter(p => (category === "all" || p.categoryId === category) && `${p.name} ${p.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section id="menu" className="junction-menu-section" aria-labelledby="menu-title">
    <div className="junction-section-heading"><div><span className="station-label">THE FULL PLATFORM MENU</span><h2 id="menu-title">Find your<br /><em>fresh favourite.</em></h2></div><label className="junction-menu-search"><Search size={19} /><span className="sr-only">Search juices and shakes</span><input type="search" placeholder="Search juices & shakes" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    <div className="junction-menu-filters" role="group" aria-label="Filter menu by category"><button aria-pressed={category === "all"} onClick={() => setCategory("all")}>All drinks <span>{available.length}</span></button>{categories.filter(c => available.some(p => p.categoryId === c.id)).map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div>
    <p className="menu-result-count" role="status">{visible.length} {visible.length === 1 ? "drink" : "drinks"}{query ? ` matching “${query}”` : " ready to order"}</p>
    <div className="junction-drink-grid">{visible.map(product => <article className="junction-drink" key={product.id}>
      <button className="junction-drink-photo" onClick={() => onChoose(product)} aria-label={`Choose size for ${drinkCopy(product.name)}`}>{product.imageUrl ? <img src={product.imageUrl} alt={drinkCopy(product.name)} loading="lazy" width={500} height={500} /> : <GlassWater size={50} />}</button>
      <div className="junction-drink-info"><span>{categories.find(c => c.id === product.categoryId)?.name || "FROOSH FAVOURITES"}</span><h3>{drinkCopy(product.name)}</h3><p>{drinkCopy(product.description)}</p><div className="drink-size-prices">{product.variants.filter(v => v.isAvailable !== false).map(v => <span key={v.id}>{v.name}<strong>₹{v.price}</strong></span>)}</div><button className="drink-add" onClick={() => onChoose(product)}>Choose size & add <span aria-hidden="true">+</span></button></div>
    </article>)}</div>
    {visible.length === 0 && <div className="junction-menu-empty"><GlassWater size={30} /><h3>{available.length ? "No drinks found." : "The menu is being refreshed."}</h3><p>{available.length ? "Try another name or browse all drinks." : "Please check with the counter for today’s selection."}</p>{available.length > 0 && <button className="station-text-button" onClick={() => {setCategory("all");setQuery("");}}>Show all drinks</button>}</div>}
  </section>;
}
