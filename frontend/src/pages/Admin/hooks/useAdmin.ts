import { useState } from 'react';
import { ListProductions, ListSongs, ListEras, ListCreators, SaveProduction, SaveSong, SaveEra, SaveCreator, DeleteProduction, DeleteSong, DeleteEra, DeleteCreator } from '../../../apis';
import type { Entry } from '../../../objects/Entry';
import { useRemote } from '../../../system/hooks/useRemote';
export type Kind = 'Production' | 'Song' | 'Era' | 'Creator';
export const emptyEntry: Entry = { id: '', slug: '', title: '', subtitle: '', summary: '', body: '', category: '', year: 0, eraId: null, source: '', image: '' };
export function useAdmin(enabled: boolean) { const [kind, setKind] = useState<Kind>('Production'); const [draft, setDraft] = useState<Entry | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const remote = useRemote(signal => enabled ? Promise.all([new ListProductions().send(signal), new ListSongs().send(signal), new ListEras().send(signal), new ListCreators().send(signal)]) : Promise.resolve([[], [], [], []] as Entry[][]), String(enabled)); const save = async () => { if (!draft)
    return; setBusy(true); setMessage(''); try {
    const api = kind === 'Production' ? new SaveProduction(draft) : kind === 'Song' ? new SaveSong(draft) : kind === 'Era' ? new SaveEra(draft) : new SaveCreator(draft);
    await api.send();
    setDraft(null);
    remote.reload();
    setMessage('The archive has been updated.');
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Save failed');
}
finally {
    setBusy(false);
} }; const remove = async (entry: Entry) => { if (!window.confirm('Delete “' + entry.title + '”? This action cannot be undone.'))
    return; setBusy(true); try {
    const api = kind === 'Production' ? new DeleteProduction(entry.id) : kind === 'Song' ? new DeleteSong(entry.id) : kind === 'Era' ? new DeleteEra(entry.id) : new DeleteCreator(entry.id);
    await api.send();
    remote.reload();
    setMessage('Entry deleted.');
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Delete failed');
}
finally {
    setBusy(false);
} }; const changeKind = (next: Kind) => { setKind(next); setDraft(null); setMessage(''); }; return { ...remote, kind, changeKind, draft, setDraft, busy, message, save, remove }; }
