"use client";

import { useState } from "react";

/** One left-facing locomotive followed by eight passenger coaches. */
export function RailwayTrain({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 2300 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="#164735" strokeWidth="2" strokeLinejoin="round">
      <g data-train-engine="true">
        <path d="M12 128V94l24-43h78l17 18h76v62H12Z" fill="#164735" />
        <path d="M36 51h78l-7-12H45Z" fill="#164735" />
        <path d="M27 91l16-30h25v30H27ZM77 61h25v30H77Z" fill="#f4f5ef" />
        <path d="M12 102h195v12H12Z" fill="#ffcf24" stroke="none" />
        <path d="M12 117h195v8H12Z" fill="#df3228" stroke="none" />
        <path d="M10 133h201v9H10Z" fill="#164735" />
        <path d="M7 143h29l-12 11H1Z" fill="#164735" />
        <path d="M137 53h37v16h-37z" fill="#164735" />
        <rect x="145" y="79" width="47" height="15" rx="2" fill="#285b47" />
        {[152,162,172,182].map(x=><path key={x} d={`M${x} 81v11`} stroke="#fff" strokeWidth="1" />)}
        <path d="M17 93h9v8h-9z" fill="#fff" />
        <path d="M46 102v24M108 103v23" stroke="#fff" strokeWidth="1" />
        <text x="149" y="126" stroke="none" fill="#fff" fontFamily="monospace" fontSize="7">FROOSH EXPRESS</text>
        {[47,83,154,185].map(x=><g key={x}><circle cx={x} cy="145" r="13" fill="#164735" /><circle cx={x} cy="145" r="5" fill="#fff" /><circle cx={x} cy="145" r="2" fill="#164735" /></g>)}
      </g>
      {Array.from({length:8},(_,i)=>{const x=237+i*254;return <g key={i} data-passenger-coach={i+1}>
        <path d={`M${x-26} 130h26`} strokeWidth="4" />
        <rect x={x} y="63" width="232" height="73" rx="5" fill="#f6f7ee" />
        <path d={`M${x-3} 63q0-13 16-13h206q16 0 16 13Z`} fill="#164735" />
        <path d={`M${x} 112h232v11H${x}Z`} fill="#df3228" stroke="none" />
        <path d={`M${x} 126h232v8H${x}Z`} fill="#164735" stroke="none" />
        {[16,53,90,127,164].map(w=><g key={w}><rect x={x+w} y="76" width="26" height="24" rx="3" fill="#164735" /><path d={`M${x+w+13} 77v22`} stroke="#e9eee5" strokeWidth="1" /></g>)}
        <rect x={x+202} y="73" width="18" height="56" rx="2" fill="#164735" /><rect x={x+207} y="78" width="8" height="17" rx="1" fill="#e9eee5" /><path d={`M${x+213} 108v8`} stroke="#ffcf24" />
        <text x={x+116} y="120" textAnchor="middle" stroke="none" fill="#fff" fontFamily="monospace" fontSize="7" letterSpacing="1">FROOSH JUNCTION · C{String(i+1).padStart(2,"0")}</text>
        {[39,184].map(w=><g key={w}><path d={`M${x+w-20} 137h40v8h-40z`} fill="#164735" />{[-11,11].map(offset=><g key={offset}><circle cx={x+w+offset} cy="147" r="10" fill="#164735" /><circle cx={x+w+offset} cy="147" r="4" fill="#fff" /></g>)}</g>)}
      </g>;})}
    </g>
  </svg>;
}

export function TrainMarquee() {
  const [paused, setPaused] = useState(false);
  return <section className={`train-departure ${paused ? "is-paused" : ""}`} aria-label="One locomotive pulling eight passenger coaches from right to left">
    <div className="train-departure-heading"><span>UNTIL YOUR NEXT FRESH STOP.</span><button aria-pressed={paused} onClick={() => setPaused(p=>!p)}>{paused ? "Play train" : "Pause train"}</button></div>
    <div className="train-loop" aria-hidden="true"><div className="departure-train"><RailwayTrain /></div><div className="departure-track" /></div>
  </section>;
}
