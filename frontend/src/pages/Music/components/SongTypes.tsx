import { ListSongFunctions } from '../../../apis';
import { useRemote } from '../../../system/hooks/useRemote';
import { Notice } from '../../../components/ui/ArchiveUI';
import { useState } from 'react';
import { Link } from 'react-router-dom';
export function SongTypes({ compact = false }: {
    compact?: boolean;
}) { const [active, setActive] = useState('character'); const { state, reload } = useRemote(s => new ListSongFunctions().send(s), 'song-functions'); if (state.status !== 'ready')
    return <Notice message={state.status === 'error' ? state.message : 'Listening for the story…'} retry={reload}/>; const songTypes = state.data; return <div><div className="grid gap-px bg-white/20 sm:grid-cols-2 lg:grid-cols-4">{songTypes.map(({ id, title, subtitle: sub }, i) => <button key={id} onClick={() => setActive(id)} onMouseEnter={() => setActive(id)} aria-pressed={active === id} className={'min-h-52 p-7 text-left transition-colors ' + (active === id ? 'bg-gold text-ink' : 'bg-ink text-ivory hover:bg-[#343c50]')}><span className="text-[9px] tracking-widest">0{i + 1} / {id.toUpperCase()}</span><span className="mt-8 block font-display text-4xl italic">{title}</span><span className="mt-5 block text-xs leading-6">{sub}</span></button>)}</div><div className="mt-8 flex flex-wrap items-center justify-between gap-6"><p className="max-w-2xl text-sm leading-7 text-ivory/70">{songTypes.find(t => t.id === active)?.description}</p>{compact && <Link to={'/music?type=' + active} className="border-b pb-2 text-[10px] uppercase tracking-widest">Explore this language ↗</Link>}</div></div>; }
