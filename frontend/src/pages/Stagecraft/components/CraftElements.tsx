import { Label } from '../../../components/ui/ArchiveUI';
import { creditFor } from '../../../system/media/credits';
import { useState } from 'react';

const elements = [
    { name: 'Scenery', text: 'Space is not neutral: scenery locates action and changes how performers move.', image: '/images/stagecraft/scenery-shubert-theatre.webp' },
    { name: 'Costumes', text: 'Dress can reveal social position, self-image and transformation.', image: '/images/stagecraft/costumes-colburn-players-1910.webp' },
    { name: 'Lighting', text: 'Light shapes focus, visibility, atmosphere and the passage of time.', image: '/images/stagecraft/lighting-alien-theatre.webp' },
    { name: 'Sound', text: 'Sound design makes voices, music and a theatrical environment intelligible.', image: '/images/stagecraft/sound-quays-theatre.webp' },
    { name: 'Orchestra', text: 'Live musicians shape the phrasing, colour and energy of a performance.', image: '/images/stagecraft/orchestra-pit-book-of-mormon.webp' },
];

export function CraftElements() {
    const [element, setElement] = useState(0);
    const active = elements[element];
    const credit = creditFor(active.image);
    return <section className="bg-ivory px-6 py-20 text-ink">
        <div className="mx-auto max-w-6xl">
            <Label>Every detail matters</Label>
            <h2 className="text-5xl">Making the imagined real.</h2>
            <div className="my-10 grid gap-8 md:grid-cols-[1.1fr_1fr]">
                <figure>
                    <div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30">
                        <img src={active.image} alt={credit?.alt || active.name + ' in the theatre'} className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    {credit && <figcaption className="mt-3 text-[9px] leading-5 text-[#6b645b]">
                        <a href={credit.source} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{credit.title}</a> · {credit.creator} · {credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy">{credit.license}</a> : credit.license}{credit.shareAlike && <> · adapted</>}
                    </figcaption>}
                </figure>
                <div className="self-center">
                    <div className="flex flex-wrap gap-3">{elements.map(({ name }, i) => <button key={name} aria-pressed={element === i} onClick={() => setElement(i)} className={'border px-5 py-3 text-xs ' + (element === i ? 'border-ink bg-ink text-ivory' : 'border-ink/20')}>{name}</button>)}</div>
                    <p aria-live="polite" className="mt-8 max-w-2xl font-display text-3xl">{active.text}</p>
                </div>
            </div>
        </div>
    </section>;
}
