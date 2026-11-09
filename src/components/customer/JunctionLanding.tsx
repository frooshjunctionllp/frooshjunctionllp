"use client";
import { drinkCopy } from "@/lib/drinkCopy";

import { ArrowRight, ArrowUpRight, GlassWater, MapPin, Milk, TrainFront, Ticket, Check } from "lucide-react";
import type { Product } from "@/types";

interface Props {
  products: Product[];
  onMenu: () => void;
  onChoose: (product: Product) => void;
  onVisit: () => void;
}

export function JunctionLanding({ products, onMenu, onChoose, onVisit }: Props) {
  const available = products.filter((product) => product.isAvailable !== false && product.variants.some((variant) => variant.isAvailable !== false));
  const featured = [...available.filter((product) => product.categoryId === "cat-juices").slice(0, 2), ...available.filter((product) => product.categoryId === "cat-shakes").slice(0, 2)];
  const picks = featured.length ? featured : available.slice(0, 4);
  return <>
    <section className="junction-hero" aria-labelledby="junction-title">
      <div className="junction-hero-copy">
        <div className="station-label"><span className="station-signal" /> YOUR FRESH STOP · ENTALLY, KOLKATA</div>
        <h1 id="junction-title">Good things<br />come to a <em>stop.</em></h1>
        <p>Fresh fruit juices. Juices and shakes.<br />A little pause in your everyday journey.</p>
        <div className="junction-hero-actions"><button className="station-button station-button-primary" onClick={onMenu}>Explore the menu <ArrowRight size={18} /></button><a href="#how-title" className="station-text-button">How to order <ArrowUpRight size={16} /></a></div>
        <span className="junction-no-signup"><Check size={14} /> Browse first. Add your details at checkout.</span>
        <div className="junction-location"><MapPin size={17} /><span>Padma Pukur, Entally<small>Your neighbourhood refreshment junction.</small></span></div>
      </div>
      <div className="junction-hero-scene">
        <div className="junction-station-sign"><span lang="bn">ফ্রুশ জংশন</span><strong>FROOSH JUNCTION</strong><small>ENTALLY · KOLKATA · FRSH</small></div>
        <div className="junction-photo-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80" width={400} height={400} alt="Fresh mango drink with fruit at the Froosh refreshment stop" fetchPriority="high" />
          <span className="junction-photo-caption"><GlassWater size={15} /> A refreshing change of pace.</span>
        </div>
        <div className="junction-ticket"><span className="junction-ticket-icon"><TrainFront size={24} /></span><div><small>YOUR NEXT FRESH STOP</small><strong>Something delicious.</strong><span>Fresh juices. Shakes. Good company.</span></div><b>01</b></div>
        <span className="junction-scene-code">FJ / REFRESHMENT COACH</span>
      </div>
    </section>
    <div className="junction-route-strip" aria-label="Our drink selection"><span><GlassWater size={17} /> Fresh juices</span><i /><span><Milk size={17} /> Shakes</span><i /><span><TrainFront size={17} /> One happy junction</span></div>

    <section className="junction-how" aria-labelledby="how-title">
      <div className="junction-section-heading"><div><span className="station-label">FIRST TIME AT THE JUNCTION?</span><h2 id="how-title">Three stops. One good sip.</h2></div><p>No railway timetable needed.<br />Here&apos;s how to order.</p></div>
      <ol className="junction-steps">
        <li><span className="junction-step-number">01</span><div><h3>Find your favourite</h3><p>Browse the menu and pick a juice or shake.</p></div></li>
        <li><span className="junction-step-number">02</span><div><h3>Make it yours</h3><p>Choose your size, sweetness, ice, and extras.</p></div></li>
        <li><span className="junction-step-number">03</span><div><h3>Order & collect</h3><p>Add your name and phone at checkout. Follow your order until it&apos;s ready.</p></div></li>
      </ol>
    </section>

    <section className="junction-featured" aria-labelledby="featured-title">
      <div className="junction-section-heading"><div><span className="station-label">NOW ARRIVING</span><h2 id="featured-title">Pick your platform.</h2></div><button className="station-text-button" onClick={onMenu}>See the full menu <ArrowUpRight size={18} /></button></div>
      <div className="junction-drink-grid">{picks.map((product, index) => <button className="junction-drink" key={product.id} onClick={() => onChoose(product)}>
        <div className="junction-drink-photo">{product.imageUrl ? <img src={product.imageUrl} alt={drinkCopy(product.name)} loading="lazy" /> : <GlassWater size={44} />}<span>PLATFORM {String(index + 1).padStart(2, "0")}</span></div>
        <div className="junction-drink-info"><span>{product.categoryId === "cat-shakes" ? "THE SHAKE LINE" : "THE FRESH LINE"}</span><h3>{drinkCopy(product.name)}</h3><div><strong>From ₹{Math.min(...product.variants.filter((variant) => variant.isAvailable !== false).map((variant) => variant.price))}</strong><span className="junction-drink-arrow"><ArrowUpRight size={19} /></span></div></div>
      </button>)}</div>
      {picks.length === 0 && <p className="junction-menu-empty">The menu is being refreshed. Please check back shortly.</p>}
    </section>

    <section className="junction-visit"><div className="junction-visit-sign"><TrainFront size={34} /><span>FROOSH<br />JUNCTION</span><small>FRSH</small></div><div><span className="station-label">A LITTLE KOLKATA. A LOT OF FRESH.</span><h2>Make us your usual stop.</h2><p>Inspired by the meeting points, familiar faces, and everyday journeys of Indian railway stations. Find your own little pause at our Entally counter.</p><button className="station-text-button" onClick={onVisit}>Find the junction <ArrowUpRight size={18} /></button></div><Ticket className="junction-visit-ticket" size={90} strokeWidth={1} /></section>
  </>;
}
