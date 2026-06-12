'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { AmbientVariant, AmbientMode } from './ambient-backdrop';

/**
 * The ambient living layer: one THREE.Points field rendered as sprites.
 * - Day: dandelion seeds tumbling slowly across the meadow on a soft wind.
 * - Night: fireflies hovering and blinking over the dusk field.
 * Both breathe on an 8s cycle (echoing BreathingIntro).
 *
 * Budget: ≤90 points, one draw call, no postprocessing.
 */

const MAX_POINTS = 90;

const VARIANTS: Record<AmbientVariant, { count: number; opacity: number; speed: number }> = {
    portal: { count: 90, opacity: 0.85, speed: 1.0 },
    feed: { count: 60, opacity: 0.7, speed: 0.7 },
    course: { count: 45, opacity: 0.6, speed: 0.5 },
    lesson: { count: 24, opacity: 0.45, speed: 0.25 },
};

const MODES: Record<
    AmbientMode,
    { palette: string[]; countScale: number; sizeScale: number; blending: THREE.Blending }
> = {
    // Cream/white seeds, fewer and larger, normal blending over the bright meadow
    day: {
        palette: ['#FFFFFF', '#F5F2EB', '#F0EEE4'],
        countScale: 0.55,
        sizeScale: 2.4,
        blending: THREE.NormalBlending,
    },
    // Warm amber-green fireflies, additive glow over the dark field
    night: {
        palette: ['#FFE9A8', '#E8E3A0', '#FFD37A'],
        countScale: 1.0,
        sizeScale: 1.1,
        blending: THREE.AdditiveBlending,
    },
};

const VERTEX = /* glsl */ `
    attribute vec3 aColor;
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uBreath;
    uniform float uSpeed;
    uniform float uScrollY;
    uniform float uMode;      // 0 = day (seeds), 1 = night (fireflies)
    uniform float uSizeScale;
    varying vec3 vColor;
    varying float vAngle;
    varying float vBlink;

    void main() {
        vColor = aColor;
        vec3 pos = position;
        float t = uTime * uSpeed;

        if (uMode < 0.5) {
            // Seeds: steady wind left→right with wraparound, gentle sway, slow tumble
            pos.x = mod(pos.x + 18.0 + t * 0.55 * aSpeed, 36.0) - 18.0;
            pos.y += sin(t * 0.25 * aSpeed + aPhase) * 0.9;
            vAngle = aPhase * 6.2831 + t * 0.35 * (aSpeed - 0.65);
            vBlink = 1.0;
        } else {
            // Fireflies: hovering wander + individual slow blink
            pos.x += sin(t * aSpeed * 0.15 + aPhase) * 0.6;
            pos.y += cos(t * aSpeed * 0.11 + aPhase * 1.7) * 0.6;
            vAngle = 0.0;
            float pulse = 0.5 + 0.5 * sin(t * aSpeed * 1.2 + aPhase * 7.0);
            vBlink = 0.12 + 0.88 * pulse * pulse * pulse; // mostly dim, periodic swells
        }
        pos.y += uScrollY * 0.0006;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * uSizeScale * (1.0 + 0.06 * uBreath) * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const FRAGMENT = /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uOpacity;
    uniform float uBreath;
    varying vec3 vColor;
    varying float vAngle;
    varying float vBlink;

    void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float ca = cos(vAngle);
        float sa = sin(vAngle);
        uv = mat2(ca, -sa, sa, ca) * uv + 0.5;
        vec4 tex = texture2D(uTexture, uv);
        float alpha = tex.a * uOpacity * vBlink * (0.85 + 0.15 * uBreath);
        gl_FragColor = vec4(vColor * tex.rgb, alpha);
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

/** A dandelion seed: pappus umbrella of fine filaments + stalk, drawn once. */
function makeSeedTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.translate(size / 2, size / 2 + 14);
    ctx.strokeStyle = 'rgba(255, 255, 252, 0.95)';
    ctx.lineCap = 'round';

    // Stalk down to the achene
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 30);
    ctx.stroke();
    // The seed itself
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 38);
    ctx.stroke();

    // Pappus: filaments fanning upward
    ctx.lineWidth = 1.2;
    const filaments = 22;
    for (let i = 0; i < filaments; i++) {
        const angle = (i / (filaments - 1)) * Math.PI * 1.25 + Math.PI * -0.125 - Math.PI;
        const len = 40 + (i % 3) * 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        ctx.stroke();
        // Tuft dot at the tip
        ctx.fillStyle = 'rgba(255, 255, 252, 0.8)';
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * len, Math.sin(angle) * len, 1.6, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

/** A firefly: tight bright core inside a soft warm glow. */
function makeGlowTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const half = size / 2;

    const glow = ctx.createRadialGradient(half, half, 0, half, half, half);
    glow.addColorStop(0, 'rgba(255, 255, 240, 1)');
    glow.addColorStop(0.12, 'rgba(255, 250, 220, 0.9)');
    glow.addColorStop(0.35, 'rgba(255, 240, 180, 0.35)');
    glow.addColorStop(1, 'rgba(255, 235, 160, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export function AmbientField({
    variant,
    mode,
    onReady,
}: {
    variant: AmbientVariant;
    mode: AmbientMode;
    onReady?: () => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const variantRef = useRef(variant);
    variantRef.current = variant;
    const modeRef = useRef(mode);
    modeRef.current = mode;

    // Set by the setup effect; used by the mode effect below.
    const sceneRefs = useRef<{
        material: THREE.ShaderMaterial;
        geometry: THREE.BufferGeometry;
        textures: Record<AmbientMode, THREE.CanvasTexture>;
        applyMode: (m: AmbientMode) => void;
    } | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ── Renderer / scene ──
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

        // ── Deterministic scattered field ──
        const rand = mulberry32(0xb1f3);
        const positions = new Float32Array(MAX_POINTS * 3);
        const colors = new Float32Array(MAX_POINTS * 3);
        const sizes = new Float32Array(MAX_POINTS);
        const phases = new Float32Array(MAX_POINTS);
        const speeds = new Float32Array(MAX_POINTS);

        for (let i = 0; i < MAX_POINTS; i++) {
            positions[i * 3] = (rand() * 2 - 1) * 14;
            positions[i * 3 + 1] = (rand() * 2 - 1) * 8;
            positions[i * 3 + 2] = -4 - rand() * 10;
            const isLarge = rand() < 0.06;
            sizes[i] = isLarge ? 3 + rand() * 2 : 0.6 + rand() * 1.8;
            phases[i] = rand() * Math.PI * 2;
            speeds[i] = 0.3 + rand() * 0.7;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        const textures: Record<AmbientMode, THREE.CanvasTexture> = {
            day: makeSeedTexture(),
            night: makeGlowTexture(),
        };

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
                uMode: { value: 0 },
                uSizeScale: { value: 1 },
                uTexture: { value: textures.day },
            },
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // ── Mode application (seeds ↔ fireflies) ──
        const colorScratch = new THREE.Color();
        const applyMode = (m: AmbientMode) => {
            const config = MODES[m];
            const colorAttr = geometry.getAttribute('aColor') as THREE.BufferAttribute;
            const pick = mulberry32(0xc01a);
            for (let i = 0; i < MAX_POINTS; i++) {
                colorScratch.set(config.palette[Math.floor(pick() * config.palette.length)]);
                colorAttr.setXYZ(i, colorScratch.r, colorScratch.g, colorScratch.b);
            }
            colorAttr.needsUpdate = true;
            material.uniforms.uMode.value = m === 'day' ? 0 : 1;
            material.uniforms.uSizeScale.value = config.sizeScale;
            material.uniforms.uTexture.value = textures[m];
            material.blending = config.blending;
            material.needsUpdate = true;
        };
        applyMode(modeRef.current);

        sceneRefs.current = { material, geometry, textures, applyMode };

        // ── Interaction ──
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

        let currentOpacity = VARIANTS[variantRef.current].opacity;
        let currentSpeed = VARIANTS[variantRef.current].speed;
        let currentCount =
            VARIANTS[variantRef.current].count * MODES[modeRef.current].countScale;

        const tick = () => {
            if (!running) return;
            rafId = requestAnimationFrame(tick);

            const t = clock.getElapsedTime();
            material.uniforms.uTime.value = t;
            // 8s full breath cycle — ~4s swell, ~4s release
            material.uniforms.uBreath.value = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 8);

            const target = VARIANTS[variantRef.current];
            const targetCount = target.count * MODES[modeRef.current].countScale;
            const lerp = 0.02; // ≈1.5s to settle at 60fps
            currentOpacity += (target.opacity - currentOpacity) * lerp;
            currentSpeed += (target.speed - currentSpeed) * lerp;
            currentCount += (targetCount - currentCount) * lerp;
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
            sceneRefs.current = null;
            geometry.dispose();
            material.dispose();
            textures.day.dispose();
            textures.night.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
        // Scene is created once; variant/mode changes flow through refs + the effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Theme toggled while mounted → swap seeds ↔ fireflies
    useEffect(() => {
        sceneRefs.current?.applyMode(mode);
    }, [mode]);

    return <div ref={containerRef} className="w-full h-full" />;
}
