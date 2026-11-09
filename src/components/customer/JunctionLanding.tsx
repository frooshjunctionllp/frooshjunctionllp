"use client";

import { ArrowRight, ArrowUpRight, GlassWater, MapPin, Milk, TrainFront, Ticket, Check } from "lucide-react";
import Image from "next/image";
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
    <section className="junction-hero express-junction-hero" aria-labelledby="junction-title">
      <div className="junction-hero-copy">
        <div className="station-label"><span className="station-signal" /> THE REFRESHMENT PLATFORM</div>
        <h1 id="junction-title">Next stop.<br /><em>Fresh.</em></h1>
        <p>Fresh juices. Thick shakes.<br />A delicious detour from the everyday.</p>
        <div className="express-hero-actions"><button className="station-button station-button-primary" onClick={onMenu}>Find your favourite <ArrowRight size={19} /></button><span><Check size={14} /> No sign-up to browse</span></div>
        <div className="express-station-coordinate"><MapPin size={15} /><span>ENTALLY, KOLKATA</span><span>FRSH / 700014</span></div>
      </div>
      <div className="express-hero-art">
        <div className="express-destination"><TrainFront size={18} /><span>NOW ARRIVING<strong>Froosh Junction</strong></span><ArrowUpRight size={20} /></div>
        <div className="express-hero-photograph">
          <Image src="/images/junction-hero.png" width={1536} height={1024} sizes="(max-width: 700px) 100vw, 55vw" alt="Mango juice and a chocolate shake at a vintage green railway carriage café" preload />
        </div>
        <div className="express-fresh-stamp"><span>TAKE A LITTLE</span><GlassWater size={27} strokeWidth={1.3}/><strong>FRESH BREAK</strong></div>
        <div className="express-photo-label"><span>THE JUICE LINE</span><i /><span>THE SHAKE LINE</span></div>
      </div>
    </section>
    <div className="junction-route-strip" aria-label="Our drink selection"><span><GlassWater size={17} /> Fresh juices</span><i /><span><Milk size={17} /> Thick shakes</span><i /><span><TrainFront size={17} /> One happy junction</span></div>

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
        <div className="junction-drink-photo">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <GlassWater size={44} />}<span>PLATFORM {String(index + 1).padStart(2, "0")}</span></div>
        <div className="junction-drink-info"><span>{product.categoryId === "cat-shakes" ? "THE SHAKE LINE" : "THE FRESH LINE"}</span><h3>{product.name}</h3><div><strong>From ₹{Math.min(...product.variants.filter((variant) => variant.isAvailable !== false).map((variant) => variant.price))}</strong><span className="junction-drink-arrow"><ArrowUpRight size={19} /></span></div></div>
      </button>)}</div>
      {picks.length === 0 && <p className="junction-menu-empty">The menu is being refreshed. Please check back shortly.</p>}
    </section>

    <section className="junction-visit"><div className="junction-visit-sign"><TrainFront size={34} /><span>FROOSH<br />JUNCTION</span><small>FRSH</small></div><div><span className="station-label">A LITTLE KOLKATA. A LOT OF FRESH.</span><h2>Make us your usual stop.</h2><p>Inspired by the meeting points, familiar faces, and everyday journeys of Indian railway stations. Find your own little pause at our Entally counter.</p><button className="station-text-button" onClick={onVisit}>Find the junction <ArrowUpRight size={18} /></button></div><Ticket className="junction-visit-ticket" size={90} strokeWidth={1} /></section>
  </>;
}
