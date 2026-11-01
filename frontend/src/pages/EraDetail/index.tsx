import { useParams } from 'react-router-dom';
import { GetEra, ListProductions } from '../../apis';
import { useRemote } from '../../system/hooks/useRemote';
import { Label, Notice, ArchiveImage, ProductionCard, ArrowLink } from '../../components/ui/ArchiveUI';
import { creditFor } from '../../system/media/credits';

export default function EraDetail() {
    const { slug = '' } = useParams();
    const { state, reload } = useRemote(async (signal) => {
        const [era, productions] = await Promise.all([new GetEra(slug).send(signal), new ListProductions().send(signal)]);
        return { era, productions: productions.filter(p => p.eraId === era.id) };
    }, slug);
    if (state.status !== 'ready') return <main className="px-8 py-16"><Notice message={state.status === 'error' ? state.message : 'Opening this chapter…'} retry={reload} /></main>;
    const { era: e, productions } = state.data;
    const credit = creditFor(e.image);
    const contextCredit = creditFor('/images/history/context-minstrel-show-ad-1926.webp');
    return <main>
        <section className="bg-ivory px-6 py-20">
            <div className="mx-auto max-w-6xl">
                <ArrowLink to="/history">Back to the timeline</ArrowLink>
                <div className="mt-14">
                    <Label>{e.subtitle}</Label>
                    <h1 className="max-w-4xl text-6xl md:text-8xl">{e.title}</h1>
                    <p className="mt-8 max-w-2xl font-display text-3xl italic">{e.summary}</p>
                </div>
            </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
            <figure>
                <div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30">
                    <ArchiveImage entry={e} className="max-h-[600px] w-full" />
                </div>
                {credit && <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[9px] leading-5 text-[#6b645b]">
                    <a href={credit.source} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{credit.title}</a>
                    <span>{credit.creator} · {credit.license}{credit.licenseUrl && <> · <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">license</a></>}</span>
                </figcaption>}
            </figure>
            <article>
                <Label>Context &amp; characteristics</Label>
                {e.body.split('\n\n').map((t, i) => <p key={i} className="mb-8 text-sm leading-8 text-[#686058]">{t}</p>)}
                <a className="text-xs underline" href={e.source} target="_blank" rel="noreferrer">Read the source ↗</a>
                <p className="mt-7 text-xs leading-6 text-[#6b645b]">This archive uses overlapping teaching chapters, not a single linear account of theatrical progress.</p>
            </article>
        </section>
        {e.slug === 'early-entertainment' && <section className="mx-auto max-w-6xl px-6 pb-20">
            <div className="grid gap-10 border-t border-gold/40 pt-12 md:grid-cols-[.85fr_1.15fr]">
                <figure>
                    <div className="bg-ink p-4 ring-1 ring-inset ring-gold/30">
                        <img
                            src="/images/history/context-minstrel-show-ad-1926.webp"
                            alt="A 1926 newspaper advertisement for a minstrel show, reproduced as historical evidence of racist performance traditions."
                            className="max-h-[520px] w-full object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    {contextCredit && <figcaption className="mt-3 text-[9px] leading-5 text-[#6b645b]">
                        <a href={contextCredit.source} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{contextCredit.title}</a> · {contextCredit.creator} · {contextCredit.license}
                    </figcaption>}
                </figure>
                <div className="self-center">
                    <Label>Historical context / a critical note</Label>
                    <h2 className="text-4xl leading-tight md:text-5xl">Minstrelsy is history, not heritage.</h2>
                    <p className="mt-7 text-sm leading-8 text-[#686058]">The advertisement reproduced here announces a 1926 “real” minstrel show with Black performers. It is evidence of how minstrelsy’s conventions persisted, even as its performers changed. Blackface minstrelsy circulated stereotypes, shaped the variety stage, and excluded Black performers from dramatic authorship. It is shown to name that history critically, not to stage it as entertainment.</p>
                    <p className="mt-5 text-sm leading-8 text-[#686058]">The archive’s critical framing follows the Smithsonian National Museum of African American History and Culture and the Library of Congress. These images are not decorative atmosphere, and they are not presented as nostalgia.</p>
                </div>
            </div>
        </section>}
        <section className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="mb-10 text-4xl">From this chapter.</h2>
            {productions.length ? <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{productions.map(p => <ProductionCard key={p.id} entry={p} />)}</div> : <ArrowLink to="/productions">Discover the collection</ArrowLink>}
        </section>
    </main>;
}
