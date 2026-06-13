'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

interface Props {
    disabled?: boolean;
    onSelect: (locationText: string, placeId?: string | null) => void;
}

/**
 * Set a location. When NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is present, renders Google's
 * Places autocomplete (businesses + addresses). Otherwise falls back to a plain
 * text input, so the feature works before the key is configured.
 */
export function LocationPicker({ disabled, onSelect }: Props) {
    if (!API_KEY) return <TextFallback disabled={disabled} onSelect={onSelect} />;
    return <PlacesAutocomplete onSelect={onSelect} />;
}

function TextFallback({ disabled, onSelect }: Props) {
    const [value, setValue] = useState('');
    return (
        <div className="flex gap-2">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Set a location"
                className="flex-1 bg-background border border-border rounded-lg p-2 text-sm"
            />
            <Button
                size="sm"
                variant="secondary"
                disabled={disabled || !value.trim()}
                onClick={() => {
                    onSelect(value.trim());
                    setValue('');
                }}
            >
                Set
            </Button>
        </div>
    );
}

function PlacesAutocomplete({ onSelect }: { onSelect: Props['onSelect'] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onSelectRef = useRef(onSelect);

    // Keep the latest callback without re-running the mount-only effect below.
    useEffect(() => {
        onSelectRef.current = onSelect;
    });

    useEffect(() => {
        let cancelled = false;
        let element: HTMLElement | null = null;

        // Loaded lazily (client-only): the loader touches `window` at import time,
        // which would crash during server-side rendering of this client component.
        (async () => {
            const { importLibrary, setOptions } = await import('@googlemaps/js-api-loader');
            setOptions({ key: API_KEY!, v: 'weekly' });
            const places = await importLibrary('places');
            if (cancelled || !containerRef.current) return;

            const el = new places.PlaceAutocompleteElement({});
            element = el as unknown as HTMLElement;
            containerRef.current.appendChild(element);

            element.addEventListener('gmp-select', async (event) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const place = (event as any).placePrediction?.toPlace?.();
                if (!place) return;
                await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'id'] });
                const name: string | undefined = place.displayName;
                const address: string | undefined = place.formattedAddress;
                const text = name && address ? `${name} — ${address}` : name || address || '';
                if (text) onSelectRef.current(text, place.id ?? null);
            });
        })().catch((e) => console.error('[gatherings] Places load failed:', e));

        return () => {
            cancelled = true;
            element?.remove();
        };
    }, []);

    return (
        <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Set a location</p>
            <div ref={containerRef} className="text-sm [&_gmp-place-autocomplete]:w-full" />
        </div>
    );
}
