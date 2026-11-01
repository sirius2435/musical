import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { UserProfile } from '../../objects/UserProfile';
const session = createStore<{
    user: UserProfile | null;
    ready: boolean;
}>(() => ({ user: null, ready: false }));
export const useSession = () => useStore(session);
export const setUser = (user: UserProfile | null) => session.setState({ user, ready: true });
export const getUser = () => session.getState().user;
