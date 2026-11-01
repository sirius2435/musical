import { Link } from 'react-router-dom';
import type { Entry } from '../../objects/Entry';
import { creditFor } from '../../system/media/credits';

export function Label({ children }: {
    children: React.ReactNode;
}) { return <p className="mb-5 border-l border-gold pl-3 text-[10px] uppercase tracking-[.22em] text-current">{children}</p>; }

export function ArrowLink({ to, children }: {
    to: string;
    children: React.ReactNode;
}) { return <Link to={to} className="group inline-flex items-center gap-8 border-b border-current pb-2 text-[10px] font-medium uppercase tracking-[.15em]">{children}<span className="text-xl transition-transform group-hover:translate-x-1">↗</span></Link>; }

export function SectionTitle({ label, title }: {
    label: string;
    title: string;
}) { return <div className="mb-12"><Label>{label}</Label><h2 className="text-4xl md:text-6xl">{title}</h2></div>; }

export function ArchiveImage({ entry, className = '', loading = 'lazy' }: {
    entry: Entry;
    className?: string;
    loading?: 'lazy' | 'eager';
}) {
    const hasLocalImage = entry.image.startsWith('/images/');
    const credit = creditFor(entry.image);
    const alt = hasLocalImage && credit ? credit.alt : entry.image.startsWith('/art/') ? 'Original editorial theatre illustration for ' + entry.title : 'Archive visual for ' + entry.title;
    return <img
        src={entry.image || '/art/theatre.svg'}
        alt={alt}
        title={credit ? credit.title + ' — ' + credit.creator + ' (' + credit.license + ')' : undefined}
        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/art/theatre.svg'; }}
        className={'object-cover ' + className}
        loading={loading}
        decoding="async"
    />;
}

export function Notice({ message, retry }: {
    message: string;
    retry?: () => void;
}) { return <div className="my-12 border-y border-gold/30 py-10" role="status"><p className="max-w-xl text-sm leading-7">{message}</p>{retry && <button onClick={retry} className="mt-5 border-b text-xs">Try again →</button>}</div>; }

export function ProductionCard({ entry, large = false }: {
    entry: Entry;
    large?: boolean;
}) { return <article className={large ? 'md:col-span-2' : ''}><Link to={'/productions/' + entry.slug} className="group block"><div className="relative overflow-hidden bg-ink ring-1 ring-inset ring-gold/30"><ArchiveImage entry={entry} className={'archive-poster w-full transition-transform duration-700 group-hover:scale-[1.025] ' + (large ? 'aspect-[1.4] object-top' : 'aspect-[3/4]')}/><span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-ink/10"/></div><div className="mt-5 flex justify-between gap-4"><div><p className="mb-2 text-[9px] uppercase tracking-[.15em] text-[#81796f]">{entry.year} / {entry.category}</p><h3 className="text-3xl group-hover:text-burgundy">{entry.title}</h3></div><span className="text-2xl">↗</span></div><p className="mt-3 text-xs leading-6 text-[#81796f]">{entry.summary}</p></Link></article>; }
