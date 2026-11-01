import { ListFeaturedProductions, ListEras } from '../../../apis';
import { useRemote } from '../../../system/hooks/useRemote';
export function useHome() { return useRemote(async (signal) => { const [productions, eras] = await Promise.all([new ListFeaturedProductions().send(signal), new ListEras().send(signal)]); return { productions, eras }; }, 'home'); }
