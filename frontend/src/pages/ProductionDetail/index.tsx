import { useParams } from 'react-router-dom';
import { useSession } from '../../system/state/session';
import { Notice } from '../../components/ui/ArchiveUI';
import { useProductionDetail } from './hooks/useProductionDetail';
import { ProductionHero } from './components/ProductionHero';
import { ProductionOverview } from './components/ProductionOverview';
import { ProductionMusic } from './components/ProductionMusic';
import { RelatedProductions } from './components/RelatedProductions';

export default function ProductionDetail() {
    const { slug = '' } = useParams();
    const { user } = useSession();
    return <ProductionArchive key={slug + ':' + (user?.id || 'guest')} slug={slug} />;
}
function ProductionArchive({ slug }: { slug: string }) {
    const { state, reload, saved, busy, error, toggle } = useProductionDetail(slug);
    if (state.status !== 'ready') return <main className="mx-auto max-w-6xl px-6 py-16"><Notice message={state.status === 'error' ? state.message : 'Opening this production…'} retry={reload} /></main>;
    const { entry, songs, creators, productions } = state.data;
    return <main>
        <ProductionHero entry={entry} saved={saved} busy={busy} error={error} toggle={toggle} />
        <ProductionOverview entry={entry} creators={creators} />
        <ProductionMusic songs={songs} />
        <RelatedProductions entry={entry} productions={productions} />
    </main>;
}
