import { Link } from 'react-router-dom';
import { useHeroSpotlight } from '../hooks/useHeroSpotlight';

export function Hero() {
    const { heroRef, lightsRef } = useHeroSpotlight();

    return <section ref={heroRef} className="hero-stage relative isolate flex min-h-[88svh] items-center overflow-hidden bg-ink text-ivory">
        <img
            src="/images/hero/stage-local-2026-11-01.png"
            alt="A warmly lit theatre stage in a dark auditorium."
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/art/theatre.svg'; }}
            className="hero-image absolute inset-0 z-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            draggable={false}
        />
        <div aria-hidden="true" className="hero-atmosphere absolute inset-0 z-10" />
        <div aria-hidden="true" className="hero-left-protection absolute inset-0 z-10" />
        <div aria-hidden="true" className="hero-bottom-protection absolute inset-x-0 bottom-0 z-10 h-48" />
        <div ref={lightsRef} aria-hidden="true" className="hero-spotlight pointer-events-none absolute inset-0 z-20">
            <div className="hero-glow" />
            <div className="hero-focus" />
        </div>
        <div className="hero-copy relative z-30 mx-auto w-full max-w-[1440px] px-6 pb-24 pt-16 md:px-12">
            <p className="mb-8 flex items-center gap-4 text-[9px] uppercase tracking-[.25em] text-[#e5c17b]"><span className="h-px w-10 bg-gold" /> An archive of the extraordinary</p>
            <h1 className="hero-title max-w-4xl text-[clamp(3.1rem,7.3vw,7rem)] leading-[.9] tracking-[-.025em]">The stage<br />of <span className="italic text-[#e8c37e]">stories.</span></h1>
            <div className="mt-9 max-w-sm">
                <p className="hero-slogan font-display text-2xl italic text-ivory">Where Music Meets Drama.</p>
                <p className="hero-description mt-4 text-xs leading-6 text-ivory/80">Step into the world of musical theatre.<br />A living conversation between music, movement and story.</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/history" className="bg-ivory px-7 py-4 text-[9px] font-medium uppercase tracking-widest text-ink hover:bg-gold">Explore the history ↗</Link>
                <Link to="/productions" className="border border-ivory/65 bg-ink/25 px-7 py-4 text-[9px] uppercase tracking-widest backdrop-blur-[1px] hover:border-gold hover:bg-ink/40">Discover productions ↗</Link>
            </div>
        </div>
        <div className="absolute inset-x-6 bottom-6 z-40 flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-4 text-[8px] uppercase tracking-[.2em] md:inset-x-12">
            <span>THE STAGE OF STORIES</span>
            <span className="hidden text-ivory/60 md:block">Stage photograph · project-owner supplied</span>
            <a href="#introduction">Scroll to explore ↓</a>
        </div>
    </section>;
}
