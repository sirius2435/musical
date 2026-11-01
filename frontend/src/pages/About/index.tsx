import { Label, ArrowLink } from '../../components/ui/ArchiveUI';
import { ListProductions } from '../../apis';
import { useRemote } from '../../system/hooks/useRemote';
import { MEDIA_CREDITS } from '../../system/media/credits';

export default function About() {
    const { state } = useRemote(s => new ListProductions().send(s), 'sources');
    return <main>
        <section className="bg-ivory px-6 py-24">
            <div className="mx-auto max-w-5xl">
                <Label>The curatorial note</Label>
                <h1 className="text-6xl md:text-8xl">About this <span className="italic">archive.</span></h1>
                <p className="mt-10 max-w-3xl font-display text-3xl leading-snug">A story is never told by words alone. It is sung, danced, and brought to life on stage.</p>
            </div>
        </section>
        <article className="mx-auto max-w-4xl space-y-10 px-6 py-20">
            <div>
                <h2 className="text-4xl">An invitation to look closer.</h2>
                <p className="mt-6 text-sm leading-8 text-[#686058]">The Stage of Stories is an independent learning archive about the history and art of musical theatre. It follows the learning themes of a Western musical theatre history course: storytelling, music, dance and stagecraft. Original course slides were not available in this project; factual starting points are cross-referenced with the sources below.</p>
            </div>
            <div>
                <h2 className="text-4xl">A responsible archive.</h2>
                <p className="mt-6 text-sm leading-8 text-[#686058]">The archive treats racist theatrical traditions critically and does not reproduce blackface imagery as decoration. Historical categories overlap, and dates refer to original Broadway openings unless otherwise specified. Song analyses are original interpretive commentary, not exclusive official classifications.</p>
            </div>
            <div id="credits">
                <Label>References &amp; image credits</Label>
                <h2 className="text-4xl">Where the stories begin.</h2>
                <p className="my-6 text-sm leading-8 text-[#686058]">Historical production photographs, playbills, theatre photography and creator portraits are sourced from Wikimedia Commons, with the homepage hero supplied by the project owner. Every file is stored locally and credited below with its creator, source and license. Wikimedia images were resized, cropped or padded for the archive’s layouts and encoded as WebP; the hero PNG is unaltered. Production cards receive a light CSS grade, while the stored files are not colour-altered. Historical images are presented as archival documents, not as official posters, endorsements or reconstructions.</p>
                <p className="my-5 text-sm leading-8 text-[#686058]">The homepage hero is a stage photograph supplied by the project owner and used with permission; it is not a Wikimedia image. The authentication page shows the Belasco Theatre auditorium by Emily Mathews (CC BY 2.0). The Elgin Theatre photograph in the introduction is by Canmenwalker (CC BY 4.0). The early-entertainment chapter reproduces a 1926 minstrel-show advertisement only as critical historical evidence. Blackface imagery is not used as decoration. CC BY-SA images are adapted and shared under the same license.</p>
                <div className="divide-y divide-ink/10">
                    {state.status === 'ready' && state.data.map(p => <a key={p.id} href={p.source} target="_blank" rel="noreferrer" className="flex justify-between gap-6 py-4 text-sm">{p.title}<span>Source ↗</span></a>)}
                    <a className="block py-4 text-sm underline" href="https://nmaahc.si.edu/explore/stories/blackface-birth-american-stereotype" target="_blank" rel="noreferrer">Smithsonian NMAAHC — historical context ↗</a>
                    <a className="block py-4 text-sm underline" href="https://rodgersandhammerstein.com/" target="_blank" rel="noreferrer">Rodgers &amp; Hammerstein — official show and song resources ↗</a>
                </div>
                <div className="mt-14 border-t border-gold/40 pt-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h3 className="text-3xl">Image credits</h3>
                        <span className="text-[9px] uppercase tracking-widest text-[#6b645b]">{MEDIA_CREDITS.length} local files</span>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-[#6b645b]">The full provenance record, including modifications and unresolved media, is maintained in <span className="font-medium">IMAGE_ATTRIBUTIONS.md</span>. Dates accessed: 1 November 2026.</p>
                    <ul className="mt-6 divide-y divide-ink/10">
                        {MEDIA_CREDITS.map(credit => <li key={credit.local} className="py-4">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <p className="text-sm">{credit.title}</p>
                                <span className="text-[9px] uppercase tracking-widest text-burgundy">{credit.license}</span>
                            </div>
                            <p className="mt-1 text-[10px] leading-5 text-[#6b645b]">{credit.creator} · {credit.usedIn}</p>
                            <p className="mt-1 text-[9px] leading-5 text-[#6b645b]">
                                <a className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy" href={credit.source} target="_blank" rel="noreferrer">Source ↗</a>
                                {credit.licenseUrl && <> · <a className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy" href={credit.licenseUrl} target="_blank" rel="noreferrer">License ↗</a></>}
                                {credit.shareAlike && <> · adapted image shared under the same license</>}
                            </p>
                        </li>)}
                    </ul>
                </div>
            </div>
            <ArrowLink to="/history">Begin the journey</ArrowLink>
        </article>
    </main>;
}
