import { useEffect } from 'react';
export function usePageMotion(pathname: string) { useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return; const intersection = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) {
    e.target.classList.remove('opacity-0', 'translate-y-4');
    intersection.unobserve(e.target);
} }), { threshold: 0.02 }); const attach = () => document.querySelectorAll('#content section:not([data-revealed])').forEach(el => { el.setAttribute('data-revealed', 'true'); el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-4'); intersection.observe(el); }); attach(); const mutation = new MutationObserver(attach); const root = document.getElementById('content'); if (root)
    mutation.observe(root, { childList: true, subtree: true }); return () => { intersection.disconnect(); mutation.disconnect(); document.querySelectorAll('#content section').forEach(el => el.classList.remove('opacity-0', 'translate-y-4')); }; }, [pathname]); }
