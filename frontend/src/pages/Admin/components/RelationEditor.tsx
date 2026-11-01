import { useEffect, useState } from 'react';
import { GetProductionLinks, UpdateProductionRelations } from '../../../apis';
import type { Entry } from '../../../objects/Entry';
export function RelationEditor({ productionId, creators, songs }: {
    productionId: string;
    creators: Entry[];
    songs: Entry[];
}) { const [selected, setSelected] = useState<{
    creatorIds: string[];
    songIds: string[];
} | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); useEffect(() => { const c = new AbortController(); void new GetProductionLinks(productionId).send(c.signal).then(setSelected).catch((e: unknown) => { if (!c.signal.aborted)
    setMessage(e instanceof Error ? e.message : 'Unable to load associations'); }); return () => c.abort(); }, [productionId]); const toggle = (field: 'creatorIds' | 'songIds', id: string) => { if (selected)
    setSelected({ ...selected, [field]: selected[field].includes(id) ? selected[field].filter(v => v !== id) : [...selected[field], id] }); }; const save = async () => { if (!selected)
    return; setBusy(true); try {
    await new UpdateProductionRelations(productionId, selected.creatorIds, selected.songIds).send();
    setMessage('Associations saved.');
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Update failed');
}
finally {
    setBusy(false);
} }; return <section className="mb-10 border border-ink/20 p-6"><h2 className="text-3xl">Connect the archive.</h2><p className="my-4 text-xs leading-7 text-[#81796f]">Choose the credited creators and songs for this production. Saving updates these associations together; existing credit roles are preserved, and newly linked creators are recorded as contributors.</p>{selected ? <><div className="grid gap-8 md:grid-cols-2">{([['creatorIds', creators, 'Creators'], ['songIds', songs, 'Songs']] as const).map(([field, entries, label]) => <fieldset key={field}><legend className="mb-4 text-xs uppercase tracking-widest">{label}</legend>{entries.map(e => <label key={e.id} className="mb-3 flex items-center gap-3 text-sm"><input className="accent-burgundy" type="checkbox" checked={selected[field].includes(e.id)} onChange={() => toggle(field, e.id)}/>{e.title}</label>)}</fieldset>)}</div><button disabled={busy} onClick={() => void save()} className="mt-6 border-b text-xs">{busy ? 'Saving…' : 'Save associations ↗'}</button></> : <p className="text-xs">Loading associations…</p>}{message && <p role="status" className="mt-5 text-sm text-burgundy">{message}</p>}</section>; }
