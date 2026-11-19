import { useState } from "react";
import { Pause, Play } from "lucide-react";

function DrinkCoach({ shake = false }: { shake?: boolean }) {
  return (
    <svg viewBox="0 0 77 48" className="fj-coach" aria-hidden="true">
      <g stroke="#17362a" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 35h73" fill="none" />
        <path d="M6 29h65v10H6z" fill={shake ? "#ee947f" : "#f7b735"} />
        <circle cx="18" cy="41" r="4" fill="#17362a" />
        <circle cx="59" cy="41" r="4" fill="#17362a" />
        {shake ? (
          <>
            <path d="m41 13 5-10h5" fill="none" />
            <path d="M27 16c0-4 4-5 7-6 0-4 4-6 7-5 0 4 8 4 8 11" fill="#fff4d9" />
            <path d="M26 16h24l-4 15H30z" fill="#ee947f" />
            <path d="M35 21l1 5m7-5-1 5" />
          </>
        ) : (
          <>
            <path d="m40 14 5-10h6" fill="none" />
            <path d="M26 13h24l-4 18H30z" fill="#f7b735" />
            <path d="M29 19h18M35 24l1 3m6-3-1 3" />
            <path d="M22 9h6m-3-3v6" />
          </>
        )}
      </g>
    </svg>
  );
}

function Locomotive() {
  return (
    <svg viewBox="0 0 85 48" className="fj-engine" aria-hidden="true">
      <g stroke="#17362a" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 35h78M26 13l9-7 9 7m-16-8h23" fill="none" />
        <path d="M7 14h52l11 7 7 15H7z" fill="#d64a32" />
        <path d="M8 19h53l8 6H8z" fill="#fff4d9" />
        <path d="M55 17h7l7 7H55zM14 20h5v8h-5zm10 0h5v8h-5zm10 0h5v8h-5z" fill="#17362a" />
        <circle cx="65" cy="30" r="2.5" fill="#f7b735" />
        <circle cx="19" cy="39" r="5" fill="#17362a" />
        <circle cx="60" cy="39" r="5" fill="#17362a" />
      </g>
    </svg>
  );
}

export function FrooshMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="fj-marquee" role="group" aria-label="Froosh Express animation">
      <div className="fj-marqueeWindow" aria-hidden="true">
        <div className="fj-marqueeTrack" data-paused={paused}>
          {Array.from({ length: 8 }, (_, index) => (
            <div className="fj-marqueeSet" key={index}>
              <span>Fresh juice</span>
              <DrinkCoach />
              <span>Thick shakes</span>
              <DrinkCoach shake />
              <span>Froosh Express</span>
              <Locomotive />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="fj-motionControl"
        aria-label={paused ? "Play train animation" : "Pause train animation"}
        onClick={() => setPaused((current) => !current)}
      >
        {paused ? <Play size={17} /> : <Pause size={17} />}
      </button>
    </div>
  );
}
