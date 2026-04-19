import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, LocateFixed, MapPinned, Route } from 'lucide-react';
import {
  buildCollegeLocationQueries,
  calculateDistanceKm,
  geocodeLocation,
  getGeolocationErrorMessage,
  getCurrentPosition,
} from '../utils/location';

function buildEmbedUrl(latitude, longitude) {
  const latOffset = 0.03;
  const lonOffset = 0.03;
  const bbox = [
    longitude - lonOffset,
    latitude - latOffset,
    longitude + lonOffset,
    latitude + latOffset,
  ]
    .map((value) => value.toFixed(6))
    .join('%2C');

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function buildQueryEmbedUrl(query) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

export default function CollegeMap({ college, exam }) {
  const [coordinates, setCoordinates] = useState(null);
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  const locationQueries = useMemo(() => buildCollegeLocationQueries(college, exam), [college, exam]);
  const primaryLocationQuery = locationQueries[0] || 'College campus, India';

  useEffect(() => {
    let cancelled = false;

    const loadCoordinates = async () => {
      setLoadingMap(true);
      setError('');
      setCoordinates(null);

      try {
        const result = await geocodeLocation(locationQueries);
        if (!cancelled) {
          setCoordinates(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to estimate distance');
        }
      } finally {
        if (!cancelled) {
          setLoadingMap(false);
        }
      }
    };

    loadCoordinates();

    return () => {
      cancelled = true;
    };
  }, [locationQueries]);

  const handleUseMyLocation = async () => {
    setLoadingUserLocation(true);
    setLocationError('');

    try {
      const result = await getCurrentPosition();
      setUserCoordinates(result);
    } catch (err) {
      setLocationError(getGeolocationErrorMessage(err));
    } finally {
      setLoadingUserLocation(false);
    }
  };

  const distanceKm =
    userCoordinates && coordinates ? calculateDistanceKm(userCoordinates, coordinates) : null;
  const hasDistance = Number.isFinite(distanceKm);

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    primaryLocationQuery
  )}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    primaryLocationQuery
  )}${userCoordinates ? `&origin=${userCoordinates.latitude},${userCoordinates.longitude}` : ''}&travelmode=driving`;

  const mapEmbedUrl = coordinates
    ? buildEmbedUrl(coordinates.latitude, coordinates.longitude)
    : buildQueryEmbedUrl(primaryLocationQuery);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPinned size={18} className="text-emerald-500" />
            College Location
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View the campus area and estimate travel distance from your current location.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loadingUserLocation}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingUserLocation ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
            Use My GPS
          </button>
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ExternalLink size={15} />
            Open in Maps
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden">
        {loadingMap ? (
          <div className="h-[320px] flex items-center justify-center text-slate-500">
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-emerald-500" />
              <span>Finding the campus on the map...</span>
            </div>
          </div>
        ) : (
          <iframe
            title={`${primaryLocationQuery} map`}
            src={mapEmbedUrl}
            className="h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Search Query</div>
          <div className="mt-1 text-sm font-medium text-slate-700">{coordinates?.query || primaryLocationQuery}</div>
        </div>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Distance</div>
          <div className="mt-1 text-sm font-semibold text-emerald-800">
            {hasDistance
              ? `${distanceKm.toFixed(1)} km from you`
              : loadingUserLocation
                ? 'Locating you...'
                : userCoordinates && loadingMap
                  ? 'Calculating distance...'
                  : 'Enable GPS to estimate'}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-slate-500">Distance estimate is unavailable for this college right now, but the map search still works.</p>}
      {locationError && <p className="mt-3 text-sm text-amber-600">{locationError}</p>}

      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
      >
        <Route size={15} />
        Get Directions
      </a>
    </div>
  );
}
