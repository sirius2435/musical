import { Link } from 'react-router-dom';
import type { Entry } from '../../../objects/Entry';
import { Label, ArchiveImage } from '../../../components/ui/ArchiveUI';
import { creditFor } from '../../../system/media/credits';

const imageNotes: Record<string, string> = {
    '/images/productions/grease-1972.webp': 'The Muny production, 2014 — not the original 1972 staging.',
};

export function ProductionHero({ entry: e, saved, busy, error, toggle }: { entry: Entry; saved: boolean; busy: boolean; error: string; toggle: () => Promise<void> }) {
    const credit = creditFor(e.image);
    return <section className="bg-ivory px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.2fr_1fr]">
            <div className="self-center">
                <Link to="/productions" className="text-[9px] uppercase tracking-widest">← The collection</Link>
                <div className="mt-14">
                    <Label>{e.year} / {e.category}</Label>
                    <h1 className="text-6xl leading-[.95] md:text-8xl">{e.title}</h1>
                    <p className="mt-7 font-display text-3xl italic">{e.summary}</p>
                    <p className="mt-6 text-xs leading-7 text-[#6b645b]">{e.subtitle}</p>
                    <button disabled={busy} onClick={() => void toggle()} className="mt-8 border border-ink px-6 py-3 text-[10px] uppercase tracking-widest">{saved ? '♥ In your archive' : '♡ Save to your archive'}</button>
                    {error && <p role="alert" className="mt-3 text-sm text-burgundy">{error}</p>}
                </div>
            </div>
            <figure>
                <div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30">
                    <ArchiveImage entry={e} className="max-h-[650px] w-full" loading="eager" />
                </div>
                <figcaption className="mt-3 text-[9px] leading-5 text-[#6b645b]">
                    {credit ? <>
                        <a href={credit.source} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{credit.title}</a> · {credit.creator} · {credit.license}
                        {credit.licenseUrl && <> · <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">license</a></>}
                        {credit.shareAlike && <> · adapted image shared under the same license</>}
                        {imageNotes[e.image] && <> · {imageNotes[e.image]}</>}
                    </> : 'Archive visual · consult the entry source for context'}
                </figcaption>
            </figure>
        </div>
    </section>;
}
