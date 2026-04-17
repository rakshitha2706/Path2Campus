const GEOCODE_CACHE_KEY = 'p2c_geocode_cache';

function readGeocodeCache() {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeGeocodeCache(cache) {
  localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
}

export function buildCollegeLocationQuery(college, exam) {
  if (exam === 'eapcet') {
    return [
      college?.institute_name,
      college?.place,
      college?.dist_code,
      'Telangana',
      'India',
    ]
      .filter(Boolean)
      .join(', ');
  }

  return [college?.institute, 'India'].filter(Boolean).join(', ');
}

export async function geocodeLocation(query) {
  if (!query) {
    throw new Error('Missing location query');
  }

  const cache = readGeocodeCache();
  if (cache[query]) {
    return cache[query];
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to geocode location');
  }

  const results = await response.json();
  const match = results?.[0];

  if (!match) {
    throw new Error('No coordinates found');
  }

  const coords = {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
  };

  cache[query] = coords;
  writeGeocodeCache(cache);
  return coords;
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

export function calculateDistanceKm(from, to) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const latDiff = toRadians(to.latitude - from.latitude);
  const lonDiff = toRadians(to.longitude - from.longitude);
  const startLat = toRadians(from.latitude);
  const endLat = toRadians(to.latitude);

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDiff / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
