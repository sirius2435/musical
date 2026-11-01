import { Label } from '../../../components/ui/ArchiveUI';
import { creditFor } from '../../../system/media/credits';

const images = [
    { src: '/images/music/juanita-hall-south-pacific.webp', label: 'A voice in character', title: 'Juanita Hall as Bloody Mary, South Pacific' },
    { src: '/images/music/broadway-orchestra-pit.webp', label: 'The orchestra at work', title: 'In the pit during Tosca' },
    { src: '/images/music/connecticut-yankee-rehearsal-1928.webp', label: 'The rehearsal room', title: 'A Broadway rehearsal, 1928' },
    { src: '/images/music/south-pacific-happy-talk.webp', label: 'On stage', title: 'South Pacific, original production' },
];

export function ListeningRoom() {
    return <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
                <Label>Listening room</Label>
                <h2 className="text-5xl">Voices, instruments, rehearsal.</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#6b645b]">A song is only one part of what reaches the audience. Look at the people who sing it, the musicians who shape it and the room where it is built.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {images.map(({ src, label, title }) => {
                const credit = creditFor(src);
                return <figure key={src}>
                    <div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30">
                        <img src={src} alt={credit?.alt || title} className="aspect-[4/5] w-full object-cover" loading="lazy" decoding="async" />
                    </div>
                    <figcaption className="mt-3">
                        <p className="text-[9px] uppercase tracking-widest text-burgundy">{label}</p>
                        <p className="mt-1 text-xs leading-5">{title}</p>
                        {credit && <p className="mt-1 text-[9px] leading-5 text-[#6b645b]">{credit.creator} · {credit.licenseUrl ? <a className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy" href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a> : credit.license} · <a className="underline decoration-ink/20 underline-offset-2 hover:text-burgundy" href={credit.source} target="_blank" rel="noreferrer">source</a></p>}
                    </figcaption>
                </figure>;
            })}
        </div>
    </section>;
}
