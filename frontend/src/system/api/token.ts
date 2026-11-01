export const getToken = () => localStorage.getItem('stage-session') || '';
export const setToken = (token: string) => { if (token)
    localStorage.setItem('stage-session', token);
else
    localStorage.removeItem('stage-session'); };
