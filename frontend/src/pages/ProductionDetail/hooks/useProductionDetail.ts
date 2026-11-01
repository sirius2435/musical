import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetProduction, ListProductions, ListSongs, ListCreators, GetProductionLinks, ListFavorites, SetFavorite } from '../../../apis';
import { useRemote } from '../../../system/hooks/useRemote';
import { useSession } from '../../../system/state/session';

export function useProductionDetail(slug: string) {
    const navigate = useNavigate();
    const { user } = useSession();
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const remote = useRemote(async (signal) => {
        const entry = await new GetProduction(slug).send(signal);
        const [productions, songs, creators, links] = await Promise.all([
            new ListProductions().send(signal), new ListSongs().send(signal),
            new ListCreators().send(signal), new GetProductionLinks(entry.id).send(signal),
        ]);
        return {
            entry, productions,
            songs: songs.filter(song => links.songIds.includes(song.id)),
            creators: creators.filter(creator => links.creatorIds.includes(creator.id)),
        };
    }, slug);
    const favorites = useRemote(signal => user ? new ListFavorites().send(signal) : Promise.resolve([] as string[]), user?.id || 'guest');
    const saved = favorites.state.status === 'ready' && favorites.state.data.includes(slug);
    const busy = submitting || (!!user && favorites.state.status === 'loading');
    const error = actionError || (favorites.state.status === 'error' ? favorites.state.message : '');

    const toggle = async () => {
        if (!user) {
            navigate('/auth?next=' + encodeURIComponent('/productions/' + slug));
            return;
        }
        if (remote.state.status !== 'ready' || busy) return;
        if (favorites.state.status !== 'ready') {
            favorites.reload();
            return;
        }
        setSubmitting(true);
        setActionError('');
        try {
            await new SetFavorite(remote.state.data.entry.id, !saved).send();
            favorites.reload();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Unable to save');
        } finally {
            setSubmitting(false);
        }
    };
    return { ...remote, saved, busy, error, toggle };
}
