import { Link, useSearchParams } from 'react-router-dom';
import { ListSongs } from '../../apis';
import { useRemote } from '../../system/hooks/useRemote';
import { Label, Notice } from '../../components/ui/ArchiveUI';
import { SongTypes } from './components/SongTypes';
import { StoryCurve } from './components/StoryCurve';
import { ListeningRoom } from './components/ListeningRoom';

export default function Music() {
    const [params, setParams] = useSearchParams();
    const type = params.get('type') || '';
    const { state, reload } = useRemote(signal => new ListSongs('', type).send(signal), type);
    return <main>
        <section className="bg-ink px-6 py-20 text-ivory md:py-28">
            <div className="mx-auto max-w-7xl">
                <Label>The language of music</Label>
                <h1 className="max-w-4xl text-6xl leading-[.95] md:text-8xl">When words<br />become <span className="italic text-gold">music.</span></h1>
                <p className="my-10 max-w-xl text-sm leading-8 text-ivory/60">Music reveals character, advances a story and makes emotions audible. Learn to hear what a song is doing, as well as how it sounds.</p>
                <SongTypes />
            </div>
        </section>
        <ListeningRoom />
        <section className="mx-auto max-w-6xl px-6 py-20">
            <Label>Close listening</Label>
            <h2 className="text-5xl">Inside a song.</h2>
            <label className="mt-8 block text-xs">Song function<select className="ml-4 border-b bg-transparent p-2" value={type} onChange={e => setParams(e.target.value ? { type: e.target.value } : {})}>
                <option value="">All functions</option>
                <option value="narration">Narration</option>
                <option value="character">Character / I am</option>
                <option value="wish">Wish / I want</option>
                <option value="love">Emotion / Love</option>
            </select></label>
            {state.status === 'ready' ? state.data.length ? state.data.map((s, i) => <Link key={s.id} to={'/music/' + s.slug} className="mt-8 grid gap-5 border-t border-ink/20 py-8 md:grid-cols-[70px_1fr_1fr_30px]">
                <span className="font-display text-4xl text-gold">0{i + 1}</span>
                <div><h3 className="text-3xl">{s.title}</h3><p className="mt-2 text-[10px] text-[#81796f]">{s.subtitle}</p></div>
                <p className="text-sm leading-7 text-[#686058]">{s.summary}</p>
                <span className="text-2xl">↗</span>
            </Link>) : <Notice message="No song essays in this category yet." /> : <Notice message={state.status === 'error' ? state.message : 'Finding the music…'} retry={reload} />}
        </section>
        <StoryCurve />
    </main>;
}
