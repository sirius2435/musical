import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListFavorites, ListProductions, SetFavorite, UpdateProfile, Logout } from '../../apis';
import { useRemote } from '../../system/hooks/useRemote';
import { useSession, setUser } from '../../system/state/session';
import { setToken } from '../../system/api/token';
import { Label, Notice, ProductionCard } from '../../components/ui/ArchiveUI';
export default function Account() { const { user, ready } = useSession(); const nav = useNavigate(); const [name, setName] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const { state, reload } = useRemote(async (signal) => { if (!user)
    return []; const [ids, productions] = await Promise.all([new ListFavorites().send(signal), new ListProductions().send(signal)]); return productions.filter(p => ids.includes(p.slug)); }, user?.id || 'guest'); const update = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try {
    setUser(await new UpdateProfile(name).send());
    setMessage('Your profile has been updated.');
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Update failed');
}
finally {
    setBusy(false);
} }; const logout = async () => { setBusy(true); try {
    await new Logout().send();
    setToken('');
    setUser(null);
    nav('/auth');
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Sign out failed');
}
finally {
    setBusy(false);
} }; const remove = async (id: string) => { setBusy(true); try {
    await new SetFavorite(id, false).send();
    reload();
}
catch (e) {
    setMessage(e instanceof Error ? e.message : 'Unable to remove');
}
finally {
    setBusy(false);
} }; if (!ready)
    return <main className="p-10"><Notice message="Checking your session…"/></main>; if (!user)
    return <main className="mx-auto max-w-4xl px-6 py-24"><Label>Your collection</Label><h1 className="text-6xl">Make room for a story.</h1><p className="my-8 text-sm">Sign in to save productions and build a collection of your own.</p><Link to="/auth?next=/account" className="border-b pb-2">Sign in ↗</Link></main>; return <main className="mx-auto max-w-7xl px-6 py-20 md:px-12"><Label>Your personal archive</Label><div className="flex flex-wrap items-end justify-between gap-8"><h1 className="text-6xl">Hello, <span className="italic">{user.name}.</span></h1><button disabled={busy} onClick={() => void logout()} className="border-b pb-2 text-xs">Sign out ↗</button></div><section className="my-12 grid gap-8 border-y border-ink/20 py-8 md:grid-cols-2"><div><h2 className="text-3xl">Your profile</h2><p className="mt-3 text-xs text-[#81796f]">{user.email}</p>{user.role === 'admin' && <Link className="mt-4 block text-xs text-burgundy" to="/admin">Open the curator’s desk ↗</Link>}</div><form onSubmit={e => void update(e)} className="flex flex-wrap items-end gap-4"><label className="text-xs">Display name<input placeholder={user.name} required maxLength={100} value={name} onChange={e => setName(e.target.value)} className="mt-3 block border-b bg-transparent py-2"/></label><button disabled={busy} className="bg-ink px-5 py-3 text-[10px] uppercase tracking-widest text-ivory">Save profile</button></form></section>{message && <p role="status" className="mb-8 text-sm text-burgundy">{message}</p>}<h2 className="mb-12 text-4xl">Stories you’re keeping.</h2>{state.status === 'ready' ? state.data.length ? <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{state.data.map(p => <div key={p.id}><ProductionCard entry={p}/><button disabled={busy} className="mt-5 border-b text-xs text-burgundy" onClick={() => void remove(p.id)}>Remove from collection</button></div>)}</div> : <Notice message="Your shelf is waiting. Explore a production and select Save to your archive."/> : <Notice message={state.status === 'error' ? state.message : 'Opening your collection…'} retry={reload}/>}</main>; }
