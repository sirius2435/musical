import { SectionTitle } from '../../../components/ui/ArchiveUI';
import { SongTypes } from '../../Music/components/SongTypes';
export function MusicPreview() { return <section className="bg-[#202020] px-6 py-24 text-ivory md:px-12"><div className="mx-auto max-w-7xl"><SectionTitle label="Listen differently" title="When music tells the story."/><SongTypes compact/></div></section>; }
