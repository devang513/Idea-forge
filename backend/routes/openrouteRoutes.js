const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY;

const parseCoordinates = (coord) => {
  if (!coord) return null;

  if (Array.isArray(coord) && coord.length === 2) {
    const [first, second] = coord.map(Number);
    if (Number.isFinite(first) && Number.isFinite(second)) {
      // OpenRouteService expects [lng, lat]
      if (Math.abs(first) <= 180 && Math.abs(second) <= 90) {
        return [first, second];
      }
      return [second, first];
    }
    return null;
  }

  if (typeof coord === 'object' && coord !== null && coord.lat != null && coord.lng != null) {
    const lat = Number(coord.lat);
    const lng = Number(coord.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lng, lat];
    }
  }

  return null;
};

router.get('/status', (req, res) => {
  if (!OPENROUTE_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'OPENROUTE_API_KEY is not configured on the server'
    });
  }

  res.json({
    success: true,
    message: 'OpenRouteService API key is configured'
  });
});

router.post('/directions', async (req, res) => {
  if (!OPENROUTE_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTE_API_KEY is not configured on the server' });
  }

  const { start, end, profile = 'driving-car' } = req.body;
  const startCoord = parseCoordinates(start);
  const endCoord = parseCoordinates(end);

  if (!startCoord || !endCoord) {
    return res.status(400).json({
      success: false,
      error: 'Invalid start or end coordinates. Use [lng, lat], [lat, lng], or { lat, lng }.'
    });
  }

  try {
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${encodeURIComponent(profile)}`,
      {
        coordinates: [startCoord, endCoord]
      },
      {
        headers: {
          Authorization: OPENROUTE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      route: response.data
    });
  } catch (error) {
    console.error('OpenRouteService request failed:', error.response?.data || error.message || error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'OpenRouteService request failed' };
    res.status(status).json({ success: false, ...data });
  }
});

module.exports = router;
