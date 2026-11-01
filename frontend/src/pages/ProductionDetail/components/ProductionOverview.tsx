import { Link } from 'react-router-dom';
import type { Entry } from '../../../objects/Entry';
import { Label } from '../../../components/ui/ArchiveUI';

export function ProductionOverview({ entry: e, creators }: { entry: Entry; creators: Entry[] }) {
    return <section className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-[2fr_1fr]">
        <article>
            <Label>Inside the story</Label>
            <h2 className="mb-7 text-4xl">A world in music.</h2>
            {e.body.split('\n\n').map((p, i) => <p key={i} className="mb-6 text-sm leading-8 text-[#686058]">{p}</p>)}
            {e.eraId && <Link className="text-xs underline" to={'/history/' + e.eraId}>Explore this historical chapter ↗</Link>}
        </article>
        <aside className="border-t border-gold pt-6">
            <Label>Creative voices</Label>
            {creators.length ? creators.map(c => <div key={c.id} className="mb-6 flex items-start gap-4">
                {c.image && <img src={c.image} alt={'Portrait of ' + c.title} className="mt-1 h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-gold/50" loading="lazy" decoding="async" />}
                <div>
                    <h3 className="text-2xl">{c.title}</h3>
                    <p className="mt-2 text-xs text-[#81796f]">{c.subtitle}</p>
                </div>
            </div>) : <p className="text-sm leading-7">{e.subtitle}</p>}
            <p className="mt-8 text-[10px] leading-6 text-[#81796f]">Year shown is the original Broadway opening, not necessarily the earliest world premiere.</p>
            <a href={e.source} target="_blank" rel="noreferrer" className="mt-5 inline-block border-b text-xs">Production source ↗</a>
        </aside>
    </section>;
}
