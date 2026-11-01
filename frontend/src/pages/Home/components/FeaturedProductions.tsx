import { SectionTitle, ArrowLink, ProductionCard } from '../../../components/ui/ArchiveUI';
import type { Remote } from '../../../system/hooks/useRemote';
import type { HomeData } from '../objects/HomeData';
export function FeaturedProductions({ state }: {
    state: Remote<HomeData>;
}) { return <section className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-32"><div className="flex flex-wrap items-end justify-between gap-7"><SectionTitle label="The collection / selected works" title="Stories that shaped the stage."/><ArrowLink to="/productions">View all productions</ArrowLink></div>{state.status === 'ready' && <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">{state.data.productions.slice(0, 4).map(e => <ProductionCard key={e.id} entry={e}/>)}</div>}</section>; }
