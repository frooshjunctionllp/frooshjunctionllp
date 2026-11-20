"use client";

import { GlassWater, Milk, MapPin, TrainFront, Ticket, ExternalLink, Leaf } from "lucide-react";
import Image from "next/image";
import { drinkCopy } from "@/lib/drinkCopy";
import { googleProfile } from "@/lib/googleReviews";
import type { Product } from "@/types";
import { GoogleReviews, TestimonialVideos } from "./JunctionSocial";

interface Props {
  products: Product[];
  onMenu: () => void;
  onChoose: (product: Product) => void;
  onVisit: () => void;
  onOffers: () => void;
}

export function JunctionLanding({ products, onMenu, onChoose, onVisit, onOffers }: Props) {
  const available = products.filter(p => p.isAvailable !== false && p.variants.some(v => v.isAvailable !== false));
  const picks = available.slice(0, 4);
  return <>
    <section className="junction-editorial-hero" aria-labelledby="junction-title">
      <div className="editorial-hero-copy">
        <span className="editorial-location">FROOSH JUNCTION <span>/</span> ENTALLY, KOLKATA</span>
        <h1 id="junction-title">Take the<br /><em>fresh route.</em></h1>
        <p>Fresh fruit juices. Thick, creamy shakes.<br />A good reason to pause, right here in Entally.</p>
        <div className="editorial-hero-actions"><button className="station-button station-button-primary" onClick={onMenu}>Explore the menu</button><button className="editorial-visit" onClick={onVisit}>Visit the junction</button></div>
        <div className="editorial-route"><TrainFront size={22} strokeWidth={1.4} /><div><span>YOUR EVERYDAY REFRESHMENT STOP</span><strong>Juices & shakes, served with railway soul.</strong></div></div>
      </div>
      <div className="editorial-hero-image"><Image sizes="(max-width: 700px) 100vw, 56vw" src="/images/junction-hero.png" alt="Fresh mango juice and a chocolate shake on a café counter beside a vintage green railway carriage" width={1536} height={1024} loading="eager" fetchPriority="high" /></div>
      <div className="editorial-platform"><span>FRESHLY AT THE JUNCTION</span><span>JUICES <i /> SHAKES <i /> GOOD COMPANY</span><button onClick={onVisit}><MapPin size={15} /> ENTALLY · KOLKATA</button></div>
    </section>

    <div className="junction-route-strip"><span><GlassWater /> Fresh fruit juices</span><span><Milk /> Creamy shakes</span><span><MapPin /> Made for Entally</span><span><Ticket /> Your daily happy stop</span></div>

    <section className="junction-featured" aria-labelledby="featured-title">
      <div className="junction-section-heading"><div><span className="station-label">FRESH ARRIVALS</span><h2 id="featured-title">A platform for<br /><em>every craving.</em></h2></div><div><p>Something fruity? Something creamy?<br />Your next favourite is waiting.</p><button className="station-text-button" onClick={onMenu}>Explore the full menu</button></div></div>
      <div className="junction-drink-grid">{picks.map((product,index)=><article className="junction-drink" key={product.id}>
        <button className="junction-drink-photo" onClick={()=>onChoose(product)} aria-label={`Choose size for ${drinkCopy(product.name)}`}>{product.imageUrl ? <img src={product.imageUrl} alt={drinkCopy(product.name)} loading="lazy" /> : <GlassWater size={65} />}</button>
        <div className="junction-drink-info"><span>{product.categoryId === "cat-shakes" ? "THE SHAKE SPECIAL" : "THE FRESH EXPRESS"} / {String(index+1).padStart(2,"0")}</span><h3>{drinkCopy(product.name)}</h3><p>{drinkCopy(product.description)}</p><div className="drink-size-prices">{product.variants.filter(v=>v.isAvailable!==false).map(v=><span key={v.id}>{v.name}<strong>₹{v.price}</strong></span>)}</div><button className="drink-add" onClick={()=>onChoose(product)}>Choose size & add <span>+</span></button></div>
      </article>)}</div>
      {!picks.length && <div className="junction-menu-empty"><GlassWater size={32} /><h3>The next fresh arrival is on its way.</h3><p>We’re updating the menu. Stop by the counter for today’s selection.</p><button className="station-text-button" onClick={onMenu}>Check the menu</button></div>}
    </section>

    <section className="junction-story" id="junction-story" aria-labelledby="story-title">
      <div className="story-sign"><TrainFront size={46} /><span>THODI SI<br /><strong>FRESHNESS.</strong><br />THODA SA<br /><strong>KOLKATA.</strong></span><div>WELCOME TO FROOSH JUNCTION</div></div>
      <div className="story-copy"><span className="station-label">A BREAK WORTH STOPPING FOR</span><h2 id="story-title">Big city energy.<br /><em>Neighbourhood heart.</em></h2><p>Every station has its stories. Ours come with a fresh juice, a creamy shake, and the familiar faces of Entally.</p><p>We’ve borrowed the joy of an Indian railway junction and made a little place to pause. No ticket needed. Just bring your thirst.</p><button className="station-button story-button" onClick={onVisit}><MapPin size={18} /> Come find your fresh stop</button></div>
    </section>

    <section className="junction-how" aria-labelledby="how-title"><div className="junction-section-heading"><div><span className="station-label">NO COMPLICATED CONNECTIONS</span><h2 id="how-title">Three stops.<br /><em>One happy sip.</em></h2></div><TrainFront className="how-train-icon" size={64} strokeWidth={1.3} /></div><ol className="junction-steps">
      <li><span className="junction-step-number"><GlassWater /></span><div><span className="step-stop">THE MENU STOP</span><h3>Find your favourite.</h3><p>Fresh juice or a creamy shake? Browse the menu and follow your craving.</p></div></li>
      <li><span className="junction-step-number"><Milk /></span><div><span className="step-stop">THE SIZE STOP</span><h3>Pick your size.</h3><p>Choose from the available sizes. The price is right there beside each one.</p></div></li>
      <li><span className="junction-step-number"><Ticket /></span><div><span className="step-stop">THE HAPPY STOP</span><h3>Order. Collect. Enjoy.</h3><p>Add your details at checkout, then follow your order until it’s ready.</p></div></li>
    </ol></section>

    <section className="junction-offer-stop"><Ticket size={58} strokeWidth={1.4} /><div><span className="station-label">A LITTLE EXTRA FOR THE JOURNEY</span><h2>Good things on the offers board.</h2><p>Take a look at the current deals, contests, and rewards.</p></div><button className="station-button" onClick={onOffers}>Check today’s offers</button></section>
    <TestimonialVideos />
    <GoogleReviews />



    <section className="junction-last-stop"><div><span className="station-label">YOUR NEIGHBOURHOOD JUNCTION</span><h2>Same city.<br /><em>New favourite stop.</em></h2></div><div><p><MapPin /> Padma Pukur, Bihar Bus Stand<br />Entally, Kolkata · 700014</p><a href="tel:+918013726751">+91 80137 26751</a><button className="station-button" onClick={onVisit}>Location & contact <MapPin size={18} /></button></div><Leaf className="last-stop-leaf" size={160} strokeWidth={1} /></section>
    <section className="junction-review-invite" aria-labelledby="review-invite-title"><div><span className="station-label">BEEN TO THE JUNCTION?</span><h2 id="review-invite-title">Leave a little love.<br /><em>Help the next person find us.</em></h2><p>Your honest review helps our neighbourhood junction grow. Scan the code or tap below to share your experience on Google.</p><a className="station-button station-button-primary" href={googleProfile.reviewUrl} target="_blank" rel="noreferrer">Review us on Google <ExternalLink size={18} /></a><a className="station-text-button" href={googleProfile.url} target="_blank" rel="noreferrer">Open our Google profile</a></div><a className="review-qr-ticket" href={googleProfile.reviewUrl} target="_blank" rel="noreferrer" aria-label="Open Froosh Junction on Google to leave a review"><div><TrainFront size={21} /><strong>FROOSH JUNCTION</strong></div><img src="/images/google-review-qr.svg" width={224} height={224} alt="Scan this QR code to review Froosh Junction on Google" loading="lazy" /><strong>SCAN. SIP. SAY HELLO.</strong><span>Point your phone camera here.</span></a></section>
  </>;
}
