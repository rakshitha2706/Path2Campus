import api from '../api';

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

export function buildCollegeLocationQueries(college, exam) {
  if (exam === 'eapcet') {
    return [
      [college?.institute_name, college?.place, 'Telangana', 'India'],
      [college?.institute_name, college?.place, 'India'],
      [college?.institute_name, 'Telangana', 'India'],
      [college?.institute_name, 'India'],
    ]
      .map((parts) => parts.filter(Boolean).join(', '))
      .filter(Boolean);
  }

  return [
    [college?.institute, 'India'],
    [college?.institute, college?.institute_type, 'India'],
  ]
    .map((parts) => parts.filter(Boolean).join(', '))
    .filter(Boolean);
}

export async function geocodeLocation(queries) {
  const queryList = Array.isArray(queries) ? queries.filter(Boolean) : [queries].filter(Boolean);

  if (!queryList.length) {
    throw new Error('Missing location query');
  }

  const cache = readGeocodeCache();

  for (const query of queryList) {
    if (cache[query]) {
      return cache[query];
    }
  }

  for (const query of queryList) {
    try {
      const response = await api.get('/location/geocode', { params: { query } });
      const coords = {
        latitude: Number(response.data.latitude),
        longitude: Number(response.data.longitude),
        query,
      };

      cache[query] = coords;
      writeGeocodeCache(cache);
      return coords;
    } catch (error) {
      if (error?.response?.status && error.response.status < 500 && error.response.status !== 429) {
        continue;
      }
    }
  }

  throw new Error('No coordinates found');
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

export function getGeolocationErrorMessage(error) {
  if (!error) {
    return 'Could not access your location';
  }

  switch (error.code) {
    case 1:
      return 'Location permission was denied. Please allow location access in your browser.';
    case 2:
      return 'Your location could not be determined right now. Please try again.';
    case 3:
      return 'Location request timed out. Please retry in a moment.';
    default:
      return error.message || 'Could not access your location';
  }
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
