export interface Coordinates {
    lat: number;
    lng: number;
}

interface GoogleGeocodeResult {
    results: Array<{
        geometry: {
            location: {
                lat: number;
                lng: number;
            }
        }
    }>;
    status: string;
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not found, returning null coordinates');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Maps API error: ${response.statusText}`);
        }

        const data = (await response.json()) as GoogleGeocodeResult;

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].geometry.location;
        }

    } catch (error) {
        console.error('Error geocoding address:', error);
    }

    return null;
}
