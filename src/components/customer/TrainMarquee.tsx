"use client";

import { useState } from "react";

/** Bespoke railway illustration, requested as part of the junction identity. */
export function RailwayTrain({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 1200 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="#164735" strokeWidth="3" strokeLinejoin="round">
      <path d="M18 120h1154M0 156h1200M0 164h1200" />
      {Array.from({length:40},(_,i)=><path key={i} d={`M${i*32} 153l-8 16`} />)}
      <path d="M25 111V65h23V28h48v37h45v65H17v-19h8Z" fill="#e6332a" />
      <path d="M43 28h58v-9H43zM101 65V40h32v25" fill="#ffcf24" />
      <path d="M53 39h30v25H53z" fill="#fff" /><path d="M25 91h115M25 100h115" stroke="#ffcf24" />
      <path d="M15 129h131l-15 10H8z" fill="#164735" />
      <path d="M34 17c-12-15 10-24 28-12M76 11c8-17 35-12 42-1" strokeDasharray="5 6" strokeWidth="2" />
      {[173,430,687,944].map((x,i)=><g key={x}>
        <path d={`M${x} 56q0-12 12-12h219q12 0 12 12v76H${x}Z`} fill={i%2 === 0 ? "#ffcf24" : "#fff"} />
        <path d={`M${x-4} 44h251v9H${x-4}z`} fill="#164735" />
        <path d={`M${x} 104h243v16H${x}z`} fill="#e6332a" stroke="none" />
        {[15,59,103,147].map(w=><rect key={w} x={x+w} y="64" width="31" height="27" rx="4" fill="#164735" />)}
        <rect x={x+195} y="61" width="32" height="65" rx="3" fill="#164735" />
        <path d={`M${x+210} 70v18`} stroke="#fff" />
        <path d={`M${x-26} 124h25`} />
        <text x={x+105} y="116" textAnchor="middle" stroke="none" fill="white" fontFamily="monospace" fontSize="9" fontWeight="bold">{["FROOSH JUNCTION","THE JUICE EXPRESS","SHAKE SPECIAL","NEXT STOP: FRESH"][i]}</text>
        {[38,205].map(w=><g key={w}><circle cx={x+w} cy="136" r="14" fill="#164735" /><circle cx={x+w} cy="136" r="5" fill="#fff" /></g>)}
      </g>)}
      {[40,102].map(x=><g key={x}><circle cx={x} cy="132" r="20" fill="#164735" /><circle cx={x} cy="132" r="10" fill="#fff" /></g>)}
      <path d="M40 132h62" stroke="#ffcf24" strokeWidth="5" />
    </g>
  </svg>;
}

export function TrainMarquee() {
  const [paused, setPaused] = useState(false);
  return <section className={`train-departure ${paused ? "is-paused" : ""}`} aria-label="The Froosh express train">
    <div className="train-departure-heading"><span>UNTIL YOUR NEXT FRESH STOP.</span><button onClick={() => setPaused(p=>!p)}>{paused ? "Play train" : "Pause train"}</button></div>
    <div className="train-loop" aria-hidden="true"><div className="train-convoy"><RailwayTrain /><RailwayTrain /></div><div className="train-convoy"><RailwayTrain /><RailwayTrain /></div></div>
  </section>;
}
