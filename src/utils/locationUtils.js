const DEFAULT_REVERSE_GEOCODE_URL =
    process.env.REACT_APP_REVERSE_GEOCODE_URL?.trim() || "https://nominatim.openstreetmap.org/reverse";

export function normalizeCoordinate(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "string" && !value.trim()) {
        return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function hasCoordinates(value) {
    return normalizeCoordinate(value?.latitude) !== null && normalizeCoordinate(value?.longitude) !== null;
}

export function formatGpsCoordinates(latitude, longitude) {
    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);

    if (normalizedLatitude === null || normalizedLongitude === null) {
        return "";
    }

    return `Lat: ${normalizedLatitude.toFixed(6)}, Lng: ${normalizedLongitude.toFixed(6)}`;
}

function buildAddressFromParts(address = {}) {
    return [
        address.house_number,
        address.road,
        address.neighbourhood,
        address.suburb,
        address.city || address.town || address.village,
        address.state_district,
        address.state,
        address.postcode,
        address.country,
    ]
        .filter(Boolean)
        .join(", ");
}

function getGeolocationErrorMessage(error) {
    switch (error?.code) {
        case 1:
            return "Location permission was denied. Please allow GPS access and try again.";
        case 2:
            return "Current location could not be detected. Try moving to an open area.";
        case 3:
            return "Location request timed out. Please try again.";
        default:
            return "Unable to access GPS on this device.";
    }
}

export function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            reject(new Error("GPS is not supported on this device."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(new Error(getGeolocationErrorMessage(error))),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
                ...options,
            }
        );
    });
}

export async function reverseGeocodeCoordinates(latitude, longitude, options = {}) {
    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);

    if (normalizedLatitude === null || normalizedLongitude === null) {
        throw new Error("Invalid GPS coordinates.");
    }

    const requestUrl = new URL(DEFAULT_REVERSE_GEOCODE_URL);
    requestUrl.search = new URLSearchParams({
        format: "jsonv2",
        lat: String(normalizedLatitude),
        lon: String(normalizedLongitude),
        addressdetails: "1",
        zoom: "18",
        "accept-language": options.language || "en-IN",
    }).toString();

    const response = await fetch(requestUrl.toString(), {
        method: "GET",
        signal: options.signal,
    });

    if (!response.ok) {
        throw new Error("Could not fetch the address for this location.");
    }

    const payload = await response.json();
    const formattedAddress =
        typeof payload?.display_name === "string" && payload.display_name.trim()
            ? payload.display_name.trim()
            : buildAddressFromParts(payload?.address);

    if (!formattedAddress) {
        throw new Error("Address details were not available for this location.");
    }

    return {
        address: formattedAddress,
        raw: payload,
    };
}
