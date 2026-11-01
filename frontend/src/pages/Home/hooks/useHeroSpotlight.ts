import { useEffect, useRef } from 'react';

const INITIAL_X = 0.72;
const INITIAL_Y = 0.46;
const MIN_X = 0.2;
const MAX_X = 0.88;
const MIN_Y = 0.22;
const MAX_Y = 0.76;

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function useHeroSpotlight() {
    const heroRef = useRef<HTMLElement | null>(null);
    const lightsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const hero = heroRef.current;
        const lights = lightsRef.current;
        if (!hero || !lights) return;

        const pointerQuery = window.matchMedia('(any-pointer: fine)');
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const motion = {
            x: INITIAL_X,
            y: INITIAL_Y,
            focusX: INITIAL_X,
            focusY: INITIAL_Y,
            targetX: INITIAL_X,
            targetY: INITIAL_Y,
            returning: false,
            raf: 0,
        };
        let listening = false;

        const render = () => {
            const rect = hero.getBoundingClientRect();
            const spotX = (motion.x - 0.5) * rect.width;
            const spotY = (motion.y - 0.5) * rect.height;
            const focusX = (motion.focusX - 0.5) * rect.width;
            const focusY = (motion.focusY - 0.5) * rect.height;

            lights.style.setProperty('--spot-x', `${spotX.toFixed(1)}px`);
            lights.style.setProperty('--spot-y', `${spotY.toFixed(1)}px`);
            lights.style.setProperty('--focus-x', `${focusX.toFixed(1)}px`);
            lights.style.setProperty('--focus-y', `${focusY.toFixed(1)}px`);
        };

        const step = () => {
            const positionEase = motion.returning ? 0.035 : 0.085;
            const focusEase = motion.returning ? 0.024 : 0.058;

            motion.x += (motion.targetX - motion.x) * positionEase;
            motion.y += (motion.targetY - motion.y) * positionEase;
            motion.focusX += (motion.x - motion.focusX) * focusEase;
            motion.focusY += (motion.y - motion.focusY) * focusEase;
            render();

            const unsettled =
                Math.abs(motion.targetX - motion.x) > 0.0008 ||
                Math.abs(motion.targetY - motion.y) > 0.0008 ||
                Math.abs(motion.x - motion.focusX) > 0.0008 ||
                Math.abs(motion.y - motion.focusY) > 0.0008;

            if (unsettled) {
                motion.raf = requestAnimationFrame(step);
            } else {
                motion.raf = 0;
                motion.returning = false;
            }
        };

        const stop = () => {
            if (motion.raf !== 0) cancelAnimationFrame(motion.raf);
            motion.raf = 0;
        };

        const start = () => {
            if (!pointerQuery.matches || motionQuery.matches || motion.raf !== 0) return;
            motion.raf = requestAnimationFrame(step);
        };

        const reset = () => {
            stop();
            motion.x = INITIAL_X;
            motion.y = INITIAL_Y;
            motion.focusX = INITIAL_X;
            motion.focusY = INITIAL_Y;
            motion.targetX = INITIAL_X;
            motion.targetY = INITIAL_Y;
            motion.returning = false;
            render();
        };

        const onPointerMove = (event: PointerEvent) => {
            if (event.pointerType === 'touch') return;
            if (!pointerQuery.matches || motionQuery.matches) return;
            const rect = hero.getBoundingClientRect();
            motion.targetX = clamp((event.clientX - rect.left) / rect.width, MIN_X, MAX_X);
            motion.targetY = clamp((event.clientY - rect.top) / rect.height, MIN_Y, MAX_Y);
            motion.returning = false;
            start();
        };

        const onPointerLeave = () => {
            if (!pointerQuery.matches || motionQuery.matches) return;
            motion.targetX = INITIAL_X;
            motion.targetY = INITIAL_Y;
            motion.returning = true;
            start();
        };

        const onResize = () => {
            render();
        };

        const addListeners = () => {
            if (listening) return;
            hero.addEventListener('pointermove', onPointerMove);
            hero.addEventListener('pointerleave', onPointerLeave);
            window.addEventListener('resize', onResize);
            listening = true;
        };

        const removeListeners = () => {
            if (!listening) return;
            hero.removeEventListener('pointermove', onPointerMove);
            hero.removeEventListener('pointerleave', onPointerLeave);
            window.removeEventListener('resize', onResize);
            listening = false;
        };

        const syncMode = () => {
            if (pointerQuery.matches && !motionQuery.matches) {
                addListeners();
            } else {
                removeListeners();
                reset();
            }
        };

        render();
        syncMode();
        pointerQuery.addEventListener('change', syncMode);
        motionQuery.addEventListener('change', syncMode);

        return () => {
            removeListeners();
            stop();
            pointerQuery.removeEventListener('change', syncMode);
            motionQuery.removeEventListener('change', syncMode);
        };
    }, []);

    return { heroRef, lightsRef };
}
