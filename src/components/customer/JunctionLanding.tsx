"use client";

import {
  GlassWater,
  Milk,
  MapPin,
  TrainFront,
  Ticket,
  ExternalLink,
  Leaf,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { googleProfile } from "@/lib/googleReviews";
import { GoogleReviews, TestimonialVideos } from "./JunctionSocial";

interface Props {
  menuSection: ReactNode;
  offersSection: ReactNode;
  onMenu: () => void;
  onVisit: () => void;
}

export function JunctionLanding({
  menuSection,
  offersSection,
  onMenu,
  onVisit,
}: Props) {
  return (
    <>
      <section
        className="junction-editorial-hero"
        aria-labelledby="junction-title"
      >
        <div className="editorial-hero-copy">
          <span className="editorial-location">
            FROOSH JUNCTION <span>/</span> ENTALLY, KOLKATA
          </span>
          <h1 id="junction-title">
            Take the
            <br />
            <em>fresh route.</em>
          </h1>
          <p>
            Fresh fruit juices. Thick, creamy shakes.
            <br />A good reason to pause, right here in Entally.
          </p>
          <div className="editorial-hero-actions">
            <button
              className="station-button station-button-primary"
              onClick={onMenu}
            >
              Explore the menu
            </button>
            <button className="editorial-visit" onClick={onVisit}>
              Visit the junction
            </button>
          </div>
          <div className="editorial-route">
            <TrainFront size={22} strokeWidth={1.4} />
            <div>
              <span>YOUR EVERYDAY REFRESHMENT STOP</span>
              <strong>Juices & shakes, served with railway soul.</strong>
            </div>
          </div>
        </div>
        <div className="editorial-hero-image">
          <Image
            sizes="(max-width: 700px) 100vw, 56vw"
            src="/images/Hero_image.jpg"
            alt="Fresh mango juice and a chocolate shake on a café counter beside a vintage green railway carriage"
            width={1536}
            height={1024}
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="editorial-platform">
          <span>FRESHLY AT THE JUNCTION</span>
          <span>
            JUICES <i /> SHAKES <i /> GOOD COMPANY
          </span>
          <button onClick={onVisit}>
            <MapPin size={15} /> ENTALLY · KOLKATA
          </button>
        </div>
      </section>

      <div className="junction-route-strip">
        <span>
          <GlassWater /> Fresh fruit juices
        </span>
        <span>
          <Milk /> Creamy shakes
        </span>
        <span>
          <MapPin /> Made for Entally
        </span>
        <span>
          <Ticket /> Your daily happy stop
        </span>
      </div>

      {menuSection}

      <section
        className="junction-story"
        id="junction-story"
        aria-labelledby="story-title"
      >
        <div className="story-sign">
          <TrainFront size={46} />
          <span>
            THODI SI
            <br />
            <strong>FRESHNESS.</strong>
            <br />
            THODA SA
            <br />
            <strong>KOLKATA.</strong>
          </span>
          <div>WELCOME TO FROOSH JUNCTION</div>
        </div>
        <div className="story-copy">
          <span className="station-label">A BREAK WORTH STOPPING FOR</span>
          <h2 id="story-title">
            Big city energy.
            <br />
            <em>Neighbourhood heart.</em>
          </h2>
          <p>
            Every station has its stories. Ours come with a fresh juice, a
            creamy shake, and the familiar faces of Entally.
          </p>
          <p>
            We’ve borrowed the joy of an Indian railway junction and made a
            little place to pause. No ticket needed. Just bring your thirst.
          </p>
          <button className="station-button story-button" onClick={onVisit}>
            <MapPin size={18} /> Come find your fresh stop
          </button>
        </div>
      </section>

      <section className="junction-how" aria-labelledby="how-title">
        <div className="junction-section-heading">
          <div>
            <span className="station-label">NO COMPLICATED CONNECTIONS</span>
            <h2 id="how-title">
              Three stops.
              <br />
              <em>One happy sip.</em>
            </h2>
          </div>
          <TrainFront className="how-train-icon" size={64} strokeWidth={1.3} />
        </div>
        <ol className="junction-steps">
          <li>
            <span className="junction-step-number">
              <GlassWater />
            </span>
            <div>
              <span className="step-stop">THE MENU STOP</span>
              <h3>Find your favourite.</h3>
              <p>
                Fresh juice or a creamy shake? Browse the menu and follow your
                craving.
              </p>
            </div>
          </li>
          <li>
            <span className="junction-step-number">
              <Milk />
            </span>
            <div>
              <span className="step-stop">THE SIZE STOP</span>
              <h3>Pick your size.</h3>
              <p>
                Choose from the available sizes. The price is right there beside
                each one.
              </p>
            </div>
          </li>
          <li>
            <span className="junction-step-number">
              <Ticket />
            </span>
            <div>
              <span className="step-stop">THE HAPPY STOP</span>
              <h3>Order. Collect. Enjoy.</h3>
              <p>
                Add your details at checkout, then follow your order until it’s
                ready.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {offersSection}
      <TestimonialVideos />
      <GoogleReviews />

      <section id="visit" className="junction-last-stop">
        <div>
          <span className="station-label">YOUR NEIGHBOURHOOD JUNCTION</span>
          <h2>
            Same city.
            <br />
            <em>New favourite stop.</em>
          </h2>
        </div>
        <div>
          <p>
            <MapPin /> Padma Pukur, Bihar Bus Stand
            <br />
            Entally, Kolkata · 700014
          </p>
          <a href="tel:+918013726751">+91 80137 26751</a>
          <a
            className="station-button"
            href={googleProfile.url}
            target="_blank"
            rel="noreferrer"
          >
            Get directions <MapPin size={18} />
          </a>
        </div>
        <Leaf className="last-stop-leaf" size={160} strokeWidth={1} />
      </section>
      <section
        className="junction-review-invite"
        aria-labelledby="review-invite-title"
      >
        <div>
          <span className="station-label">BEEN TO THE JUNCTION?</span>
          <h2 id="review-invite-title">
            Leave a little love.
            <br />
            <em>Help the next person find us.</em>
          </h2>
          <p>
            Your honest review helps our neighbourhood junction grow. Scan the
            code or tap below to share your experience on Google.
          </p>
          <a
            className="station-button station-button-primary"
            href={googleProfile.reviewUrl}
            target="_blank"
            rel="noreferrer"
          >
            Review us on Google <ExternalLink size={18} />
          </a>
          <a
            className="station-text-button"
            href={googleProfile.url}
            target="_blank"
            rel="noreferrer"
          >
            Open our Google profile
          </a>
        </div>
        <a
          className="review-qr-ticket"
          href={googleProfile.reviewUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open Froosh Junction on Google to leave a review"
        >
          <div>
            <TrainFront size={21} />
            <strong>FROOSH JUNCTION</strong>
          </div>
          <img
            src="/images/google-review-qr.svg"
            width={224}
            height={224}
            alt="Scan this QR code to review Froosh Junction on Google"
            loading="lazy"
          />
          <strong>SCAN. SIP. SAY HELLO.</strong>
          <span>Point your phone camera here.</span>
        </a>
      </section>
    </>
  );
}
