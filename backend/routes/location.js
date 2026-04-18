const express = require('express');

const router = express.Router();

router.get('/geocode', async (req, res) => {
  const query = req.query.query?.trim();

  if (!query) {
    return res.status(400).json({ message: 'Location query is required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'Path2Campus/1.0 (college location lookup)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to geocode location' });
    }

    const results = await response.json();
    const match = results?.[0];

    if (!match) {
      return res.status(404).json({ message: 'No coordinates found' });
    }

    return res.json({
      latitude: Number(match.lat),
      longitude: Number(match.lon),
      displayName: match.display_name || query,
      query,
    });
  } catch (error) {
    console.error('Geocode error:', error.message);
    return res.status(500).json({ message: 'Geocoding failed' });
  }
});

module.exports = router;
