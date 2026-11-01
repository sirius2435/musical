import { useHome } from './hooks/useHome';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { HistoryPreview } from './components/HistoryPreview';
import { FeaturedProductions } from './components/FeaturedProductions';
import { MusicPreview } from './components/MusicPreview';
import { BehindStage } from './components/BehindStage';
import { ClosingInvitation } from './components/ClosingInvitation';
export default function Home() { const { state, reload } = useHome(); return <><Hero /><Introduction /><HistoryPreview state={state} reload={reload}/><FeaturedProductions state={state}/><MusicPreview /><BehindStage /><ClosingInvitation /></>; }
