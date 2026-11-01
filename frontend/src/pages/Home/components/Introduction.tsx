import { Label, ArrowLink } from '../../../components/ui/ArchiveUI';

export function Introduction() {
    return <section id="introduction" className="mx-auto grid max-w-7xl gap-14 px-6 py-24 md:grid-cols-2 md:px-12 md:py-32">
        <div className="relative self-start bg-ivory p-6 md:self-center">
            <div className="relative">
                <img
                    src="/images/home/elgin-theatre-interior.webp"
                    alt="The ornate interior of the Elgin Theatre in Toronto, with its balcony and painted ceiling."
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/art/theatre.svg'; }}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                />
                <span className="absolute bottom-8 left-8 max-w-[75%] bg-ink/55 px-2 py-1 text-[8px] uppercase tracking-widest text-gold">The Elgin Theatre, Toronto · Photograph: <a className="underline decoration-gold/30 underline-offset-2 hover:text-ivory" href="https://commons.wikimedia.org/wiki/File:Elgin_Theatre_Interior_2022.jpg" target="_blank" rel="noreferrer">Canmenwalker</a> · <a className="underline decoration-gold/30 underline-offset-2 hover:text-ivory" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span>
            </div>
        </div>
        <div className="self-center md:pl-10">
            <Label>The art of musical theatre</Label>
            <h2 className="text-5xl leading-[1.02] md:text-6xl">More than music.<br /><span className="italic">More than drama.</span></h2>
            <p className="my-7 max-w-md text-sm leading-8 text-[#81796f]">A story is never told by words alone. It is sung, danced, and brought to life on stage. Discover the art that brings these languages together.</p>
            <ArrowLink to="/about">Meet the archive</ArrowLink>
        </div>
    </section>;
}
