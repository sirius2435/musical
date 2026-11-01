import type { Entry } from '../../../objects/Entry';
import { Label, ProductionCard } from '../../../components/ui/ArchiveUI';
export function RelatedProductions({ entry: e, productions }: { entry: Entry; productions: Entry[] }) { return <section className="mx-auto max-w-6xl px-6 py-20"><Label>Continue exploring</Label><h2 className="mb-10 text-4xl">Another story awaits.</h2><div className="grid gap-10 sm:grid-cols-3">{productions.filter(p => p.id !== e.id).slice(0, 3).map(p => <ProductionCard key={p.id} entry={p}/>)}</div></section>; }
