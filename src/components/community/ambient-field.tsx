'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { AmbientVariant } from './ambient-backdrop';

/**
 * The ambient living background: one THREE.Points field of soft orbs in the
 * b. palette, breathing on an 8s cycle (echoing BreathingIntro), drifting
 * slowly, with gentle pointer parallax and scroll counter-drift.
 *
 * Budget: ≤90 points, one draw call, no postprocessing.
 */

const MAX_POINTS = 90;

const VARIANTS: Record<AmbientVariant, { count: number; opacity: number; speed: number }> = {
    portal: { count: 90, opacity: 0.38, speed: 1.0 },
    feed: { count: 60, opacity: 0.3, speed: 0.7 },
    course: { count: 45, opacity: 0.26, speed: 0.5 },
    lesson: { count: 24, opacity: 0.18, speed: 0.25 },
};

// b-sand, b-sage, b-clay, b-mist
const PALETTE = ['#F5F2EB', '#8DA399', '#D4A59A', '#E0E6E6'];

const VERTEX = /* glsl */ `
    attribute vec3 aColor;
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uBreath;
    uniform float uSpeed;
    uniform float uScrollY;
    varying vec3 vColor;

    void main() {
        vColor = aColor;
        vec3 pos = position;
        float t = uTime * uSpeed;
        pos.x += sin(t * aSpeed * 0.15 + aPhase) * 0.6;
        pos.y += cos(t * aSpeed * 0.11 + aPhase * 1.7) * 0.6;
        pos.y += uScrollY * 0.0006;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (1.0 + 0.06 * uBreath) * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const FRAGMENT = /* glsl */ `
    uniform float uOpacity;
    uniform float uBreath;
    varying vec3 vColor;

    void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist) * uOpacity * (0.85 + 0.15 * uBreath);
        gl_FragColor = vec4(vColor, alpha);
    }
`;

/** mulberry32 — deterministic field so the scene looks identical every visit. */
function mulberry32(seed: number): () => number {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function AmbientField({
    variant,
    onReady,
}: {
    variant: AmbientVariant;
    onReady?: () => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const variantRef = useRef(variant);
    variantRef.current = variant;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ── Scene setup ──
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.z = 1;

        // ── Geometry: deterministic scattered field ──
        const rand = mulberry32(0xb1f3);
        const positions = new Float32Array(MAX_POINTS * 3);
        const colors = new Float32Array(MAX_POINTS * 3);
        const sizes = new Float32Array(MAX_POINTS);
        const phases = new Float32Array(MAX_POINTS);
        const speeds = new Float32Array(MAX_POINTS);

        const color = new THREE.Color();
        for (let i = 0; i < MAX_POINTS; i++) {
            positions[i * 3] = (rand() * 2 - 1) * 14;
            positions[i * 3 + 1] = (rand() * 2 - 1) * 8;
            positions[i * 3 + 2] = -4 - rand() * 10;

            color.set(PALETTE[Math.floor(rand() * PALETTE.length)]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // ~6% become large soft orbs
            const isOrb = rand() < 0.06;
            sizes[i] = isOrb ? 3 + rand() * 2 : 0.6 + rand() * 1.8;
            phases[i] = rand() * Math.PI * 2;
            speeds[i] = 0.3 + rand() * 0.7;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uBreath: { value: 0 },
                uOpacity: { value: VARIANTS[variantRef.current].opacity },
                uSpeed: { value: VARIANTS[variantRef.current].speed },
                uScrollY: { value: 0 },
            },
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        geometry.setDrawRange(0, VARIANTS[variantRef.current].count);

        // ── Interaction state ──
        let targetX = 0;
        let targetY = 0;
        const finePointer = window.matchMedia('(pointer: fine)').matches;

        const onPointerMove = (e: PointerEvent) => {
            targetX = (e.clientX / window.innerWidth) * 2 - 1;
            targetY = (e.clientY / window.innerHeight) * 2 - 1;
        };
        if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true });

        const onScroll = () => {
            material.uniforms.uScrollY.value = window.scrollY;
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        let resizeTimer: ReturnType<typeof setTimeout>;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, 150);
        };
        window.addEventListener('resize', onResize);

        // ── Frame loop ──
        const clock = new THREE.Clock();
        let rafId = 0;
        let running = true;
        let firstFrame = true;

        // Variant transitions lerp over ~1.5s
        let currentOpacity = VARIANTS[variantRef.current].opacity;
        let currentSpeed = VARIANTS[variantRef.current].speed;
        let currentCount = VARIANTS[variantRef.current].count;

        const tick = () => {
            if (!running) return;
            rafId = requestAnimationFrame(tick);

            const t = clock.getElapsedTime();
            material.uniforms.uTime.value = t;
            // 8s full breath cycle — ~4s swell, ~4s release
            material.uniforms.uBreath.value = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 8);

            const target = VARIANTS[variantRef.current];
            const lerp = 0.02; // ≈1.5s to settle at 60fps
            currentOpacity += (target.opacity - currentOpacity) * lerp;
            currentSpeed += (target.speed - currentSpeed) * lerp;
            currentCount += (target.count - currentCount) * lerp;
            material.uniforms.uOpacity.value = currentOpacity;
            material.uniforms.uSpeed.value = currentSpeed;
            geometry.setDrawRange(0, Math.round(currentCount));

            camera.position.x += (targetX * 0.5 - camera.position.x) * 0.03;
            camera.position.y += (-targetY * 0.3 - camera.position.y) * 0.03;

            renderer.render(scene, camera);

            if (firstFrame) {
                firstFrame = false;
                onReady?.();
            }
        };
        rafId = requestAnimationFrame(tick);

        const onVisibility = () => {
            if (document.hidden) {
                running = false;
                cancelAnimationFrame(rafId);
            } else if (!running) {
                running = true;
                clock.start();
                rafId = requestAnimationFrame(tick);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        // ── Teardown ──
        return () => {
            running = false;
            cancelAnimationFrame(rafId);
            clearTimeout(resizeTimer);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            if (finePointer) window.removeEventListener('pointermove', onPointerMove);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
        // Scene is created once; variant changes flow through variantRef in the loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}
