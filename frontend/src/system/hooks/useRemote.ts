import { useEffect, useRef, useState } from 'react';
export type Remote<T> = {
    status: 'loading';
} | {
    status: 'ready';
    data: T;
} | {
    status: 'error';
    message: string;
};
export function useRemote<T>(load: (signal: AbortSignal) => Promise<T>, key: string) {
    const loader = useRef(load);
    useEffect(() => { loader.current = load; });
    const [result, setResult] = useState<{
        key: string;
        state: Remote<T>;
    }>({ key, state: { status: 'loading' } });
    const [version, setVersion] = useState(0);
    const requestKey = key + ':' + version;
    useEffect(() => { const c = new AbortController(); void loader.current(c.signal).then(data => { if (!c.signal.aborted)
        setResult({ key: requestKey, state: { status: 'ready', data } }); }).catch((e: unknown) => { if (!c.signal.aborted)
        setResult({ key: requestKey, state: { status: 'error', message: e instanceof Error ? e.message : 'Unable to load archive' } }); }); return () => c.abort(); }, [requestKey]);
    const state: Remote<T> = result.key === requestKey ? result.state : { status: 'loading' };
    return { state, reload: () => setVersion(v => v + 1) };
}
