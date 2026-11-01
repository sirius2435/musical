import { Link } from 'react-router-dom';
import { SectionTitle, ArrowLink, Notice } from '../../../components/ui/ArchiveUI';
import type { Remote } from '../../../system/hooks/useRemote';
import type { HomeData } from '../objects/HomeData';
export function HistoryPreview({ state, reload }: {
    state: Remote<HomeData>;
    reload: () => void;
}) { return <section className="bg-ink px-6 py-24 text-ivory md:px-12"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-7"><SectionTitle label="A journey through time" title="An ever-changing stage."/><ArrowLink to="/history">The complete history</ArrowLink></div>{state.status === 'ready' ? <div className="mt-10 grid gap-8 border-t border-gold/30 pt-10 md:grid-cols-5">{state.data.eras.map((era, i) => <Link to={'/history/' + era.slug} key={era.id} className="group border-b border-white/10 pb-8"><p className="text-[9px] text-gold">0{i + 1} / {era.subtitle}</p><h3 className="mt-6 text-2xl group-hover:text-gold">{era.title}</h3><p className="mt-4 text-xs leading-6 text-ivory/50">{era.summary}</p><span className="mt-5 inline-block text-xl">↗</span></Link>)}</div> : <Notice message={state.status === 'error' ? state.message : 'Opening the archive…'} retry={state.status === 'error' ? reload : undefined}/>}</div></section>; }
