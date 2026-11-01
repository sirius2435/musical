import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListEras } from '../../apis';
import { useRemote } from '../../system/hooks/useRemote';
import { Label, ArrowLink, ArchiveImage, Notice } from '../../components/ui/ArchiveUI';
import { creditFor } from '../../system/media/credits';

export default function History() {
    const { state, reload } = useRemote(s => new ListEras().send(s), 'eras');
    const [active, setActive] = useState('');
    useEffect(() => {
        const observer = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) setActive(e.target.id);
        }), { rootMargin: '-15% 0px -55% 0px' });
        document.querySelectorAll('[data-era]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [state]);
    return <main>
        <section className="bg-ivory px-6 py-20 md:px-12">
            <div className="mx-auto max-w-7xl">
                <Label>A history of musical theatre</Label>
                <h1 className="max-w-4xl text-6xl leading-[.95] md:text-8xl">The evolution<br />of <span className="italic">the extraordinary.</span></h1>
                <p className="mt-8 max-w-lg text-sm leading-7 text-[#6b645b]">From variety entertainment to the rock musical. Explore how a changing society found new ways to tell its stories.</p>
            </div>
        </section>
        {state.status === 'ready' ? <>
            <div className="mx-auto max-w-7xl px-6 pt-8">
                <progress aria-label="Historical chapter reading progress" max={state.data.length || 1} value={Math.max(0, state.data.findIndex(e => e.slug === active) + 1)} className="h-1 w-full accent-burgundy" />
            </div>
            <nav aria-label="Historical periods" className="mx-auto grid max-w-7xl gap-3 border-b border-ink/20 px-6 py-8 md:grid-cols-5">
                {state.data.map((e, i) => <a key={e.id} href={'#' + e.slug} className={'border-l-2 p-3 text-xs ' + (active === e.slug ? 'border-burgundy text-burgundy' : 'border-gold/30')}><span className="mb-3 block text-[9px]">0{i + 1} · {e.subtitle}</span>{e.category}</a>)}
            </nav>
            {state.data.map((e, i) => {
                const credit = creditFor(e.image);
                return <section key={e.id} id={e.slug} data-era className="mx-auto grid max-w-7xl gap-10 border-b border-ink/10 px-6 py-20 md:grid-cols-2 md:px-12">
                    <figure className={i % 2 ? 'md:order-2' : ''}>
                        <div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30">
                            <ArchiveImage entry={e} className="aspect-[4/3] w-full" />
                        </div>
                        {credit && <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[9px] leading-5 text-[#6b645b]">
                            <a href={credit.source} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{credit.title}</a>
                            <span>{credit.creator} · {credit.license}{credit.licenseUrl && <> · <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">license</a></>}</span>
                        </figcaption>}
                    </figure>
                    <div className="self-center md:p-10">
                        <Label>{e.subtitle} / chapter 0{i + 1}</Label>
                        <h2 className="text-5xl">{e.title}</h2>
                        <p className="my-7 text-sm leading-8 text-[#6b645b]">{e.summary}</p>
                        <ArrowLink to={'/history/' + e.slug}>Read the chapter</ArrowLink>
                    </div>
                </section>;
            })}
            <section className="bg-ink px-6 py-24 text-center text-ivory">
                <Label>A historical reflection</Label>
                <h2 className="text-5xl">The stage reflects its time.</h2>
                <p className="mx-auto mt-8 max-w-xl text-sm leading-8 text-ivory/60">Who was invited onto the stage? Whose stories were excluded? How does a musical change when a new generation listens?</p>
                <Link to="/productions" className="mt-8 inline-block border-b pb-2 text-xs">Continue into the collection ↗</Link>
            </section>
        </> : <div className="px-8"><Notice message={state.status === 'error' ? state.message : 'Turning the pages…'} retry={reload} /></div>}
    </main>;
}
