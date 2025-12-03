// Haversine formula to calculate distance in miles
export function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; formattedAddress?: string } | null> {
    try {
        const params = new URLSearchParams({
            q: address,
            format: 'json',
            limit: '1',
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: {
                'User-Agent': 'JustBeApp/1.0 (david@justbe.app)', // Must provide valid contact info
                'Referer': 'https://justbe.app'
            }
        });

        if (!response.ok) {
            console.error('Geocoding fetch failed:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                formattedAddress: result.display_name,
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}
