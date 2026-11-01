import { usePageMotion } from './system/hooks/usePageMotion';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './components/ui/SiteHeader';
import { SiteFooter } from './components/ui/SiteFooter';
import { CurrentUser } from './apis';
import { getToken, setToken } from './system/api/token';
import { setUser } from './system/state/session';
export function Layout() { const { pathname } = useLocation(); usePageMotion(pathname); useEffect(() => { window.scrollTo({ top: 0 }); document.title = 'The Stage of Stories — ' + (pathname === '/' ? 'Where Music Meets Drama' : pathname.split('/')[1]); }, [pathname]); useEffect(() => { if (getToken())
    void new CurrentUser().send().then(setUser).catch(() => { setToken(''); setUser(null); });
else
    setUser(null); }, []); return <><a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:bg-paper focus:p-4">Skip to content</a><SiteHeader /><div id="content"><Outlet /></div><SiteFooter /></>; }
