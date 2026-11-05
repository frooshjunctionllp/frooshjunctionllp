import React from "react";

interface RailwaySignboardProps {
  title?: string;
  subTitle?: string;
  bengaliTitle?: string;
  stationCode?: string;
  platform?: string;
  className?: string;
}

export const RailwaySignboard: React.FC<RailwaySignboardProps> = ({
  title = "FROOSH JUNCTION",
  bengaliTitle = "ফ্রুশ জংশন",
  stationCode = "FRSH / 700014",
  platform,
  className = "",
}) => {
  return (
    <div
      className={`relative border-4 border-slate-900 bg-amber-400 text-slate-900 rounded-sm shadow-[4px_4px_0px_#0f172a] p-3 text-center uppercase tracking-wider select-none ${className}`}
    >
      {/* Decorative mounting bolts */}
      <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-slate-900/60" />
      <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-slate-900/60" />
      <div className="absolute bottom-1 left-2 w-2 h-2 rounded-full bg-slate-900/60" />
      <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-slate-900/60" />

      {/* Bengali Title */}
      <div className="text-xs sm:text-sm font-semibold tracking-normal text-slate-800">
        {bengaliTitle}
      </div>

      {/* English Big Station Name */}
      <div className="text-xl sm:text-3xl font-black tracking-widest text-slate-950 font-mono my-0.5">
        {title}
      </div>

      {/* Station Code & Platform details */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold border-t border-slate-900/30 pt-1 mt-1 text-slate-800">
        <span>{stationCode}</span>
        {platform && (
          <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
            {platform}
          </span>
        )}
        <span>ENTALLY, KOLKATA</span>
      </div>
    </div>
  );
};
