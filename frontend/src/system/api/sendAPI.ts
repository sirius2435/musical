import type { APIMessage } from './APIMessage';
import { getToken } from './token';
export async function sendAPI<T>(m: APIMessage<T>, signal?: AbortSignal): Promise<T> {
    const response = await fetch('/api/' + m.constructor.name.toLowerCase(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m.needsUserToken ? { ...m, userToken: getToken() } : m), signal });
    if (!response.ok) {
        let message = 'The archive is temporarily unavailable. Please try again.';
        try {
            const data = await response.json();
            message = data.message || message;
        }
        catch { /* non-JSON server error */ }
        throw new Error(message);
    }
    return response.json() as Promise<T>;
}
