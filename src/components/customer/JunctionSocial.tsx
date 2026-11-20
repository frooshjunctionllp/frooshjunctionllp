"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Star, ExternalLink } from "lucide-react";
import { googleProfile, googleReviews } from "@/lib/googleReviews";

const videoUrl = "https://res.cloudinary.com/vt5gqi1c/video/upload/v1794895741/video-gallery/real-estate/DVTbtG-E-3x.mp4";
const videoPoster = "https://res.cloudinary.com/vt5gqi1c/video/upload/so_0,w_540,h_960,c_fill/v1794895741/video-gallery/real-estate/DVTbtG-E-3x.jpg";

function VideoPreview({ index }: { index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (started) void video.current?.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
  }, [started]);
  return <article className="junction-video">
    <div className="junction-video-frame">
      <video ref={video} src={started ? videoUrl : undefined} poster={videoPoster} preload="none" controls={started} playsInline aria-label={`Testimonial preview ${index + 1}`} onPlay={event => { document.querySelectorAll<HTMLVideoElement>(".junction-video video").forEach(other=>{if(other!==event.currentTarget) other.pause();}); }} onError={()=>setFailed(true)} />
      {!started && <button aria-label={`Play testimonial preview ${index + 1}`} onClick={() => { setStarted(true); setFailed(false); }}><Play size={25} fill="currentColor" /></button>}
      {failed && <a className="video-fallback" href={videoUrl} target="_blank" rel="noreferrer">Open video</a>}
    </div>
    <div className="video-caption"><span>AT THE JUNCTION</span><span>Preview {String(index+1).padStart(2,"0")}</span></div>
  </article>;
}

export function TestimonialVideos() {
  const rail = useRef<HTMLDivElement>(null);
  return <section className="junction-videos" aria-labelledby="video-title">
    <div className="junction-section-heading"><div><span className="station-label">THE PLATFORM, IN PLAY</span><h2 id="video-title">Good sips.<br /><em>Great company.</em></h2></div><div className="video-intro"><p>A little life at the junction.<br />Ten portrait previews, ready for your stories.</p><div className="rail-controls"><button aria-label="Previous videos" onClick={()=>rail.current?.scrollBy({left:-360,behavior:"smooth"})}><ChevronLeft /></button><button aria-label="Next videos" onClick={()=>rail.current?.scrollBy({left:360,behavior:"smooth"})}><ChevronRight /></button></div></div></div>
    <div ref={rail} className="video-rail">{Array.from({length:10},(_,i)=><VideoPreview key={i} index={i} />)}</div>
    <p className="preview-note">Preview gallery · The same sample clip is used in all ten slots. Customer testimonial videos coming soon.</p>
  </section>;
}

export function GoogleReviews() {
  return <section className="junction-reviews" aria-labelledby="reviews-title">
    <div className="reviews-intro"><span className="station-label">WORD AROUND THE STATION</span><h2 id="reviews-title">The locals<br />have spoken.</h2><div className="google-score"><strong>{googleProfile.rating.toFixed(1)}</strong><div><span className="review-stars" aria-label="5 out of 5 stars">{Array.from({length:5},(_,i)=><Star key={i} size={20} fill="currentColor" />)}</span><span>From {googleProfile.reviewCount} Google reviews</span></div></div><a className="station-text-button" href={googleProfile.url} target="_blank" rel="noreferrer">Read all reviews on Google <ExternalLink size={16} /></a><small>All 123 reviews · Newest first · Snapshot: 20 Nov 2026</small></div>
    <div className="review-rail" tabIndex={0} aria-label="Latest Google reviews, scroll to read more">{googleReviews.map(review=><article className="google-review" key={review.authorId}><div className="review-author"><span>{review.name.slice(0,1)}</span><div><a href={`https://www.google.com/maps/contrib/${review.authorId}/reviews`} target="_blank" rel="noreferrer">{review.name}</a><span className="review-date">{review.date} at capture</span></div><span className="google-letter" aria-label="Google">G</span></div><span className="review-stars review-item-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}</span><p>{review.text ? <q>{review.text}</q> : <span className="rating-only">Left a rating on Google</span>}</p>{review.translated && <small>Translated by Google</small>}<a className="review-source" href={`https://www.google.com/maps/reviews/data=!4m5!14m4!1m3!1m2!1s${review.authorId}!2s0x3a02776d804c1471:0xb7a603e25a4bd541`} target="_blank" rel="noreferrer">View on Google <ExternalLink size={13} /></a></article>)}</div>
  </section>;
}
