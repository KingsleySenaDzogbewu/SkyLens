require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.WEATHER_API_KEY;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const weatherResponse = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      }
    );

    res.json(weatherResponse.data);

  } catch (error) {
    res.status(500).json({ error: 'Could not fetch weather data' });
  }
});

app.get('/weather-by-coords', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Coords Error:", error.message);
    res.status(500).json({ error: "Failed to fetch by coordinates" });
  }
});

app.get('/forecast', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const forecastResponse = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      }
    );

    res.json(forecastResponse.data);

  } catch (error) {
    res.status(500).json({ error: 'Could not fetch forecast data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
