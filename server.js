require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.static(path.join(__dirname, 'public')));

app.get('/weather', async (req, res) => {
  // Gets city from user
=======

const PORT = 3000;

app.use(cors()); 
app.use(express.static(path.join(__dirname, 'frontend')));

const API_KEY = process.env.WEATHER_API_KEY;

app.get('/weather', async (req, res) => {
  
>>>>>>> c58b1ad (updated features)
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
<<<<<<< HEAD
    //This allows backend talk to weather API
=======
>>>>>>> c58b1ad (updated features)
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

    
<<<<<<< HEAD

  const data = weatherResponse.data;

    //  Sends response to frontend
    res.json({
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].description, 
      windSpeed: data.wind.speed,
      feelsLike: data.main.feels_like,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      humidity: data.main.humidity,
      iconCode: data.weather[0].icon,
      lastUpdate: Math.floor(Date.now() / 1000)
    });
=======
  const data = weatherResponse.data;

    res.json(data);
>>>>>>> c58b1ad (updated features)


  } catch (error) {
    res.status(500).json({ error: 'Could not fetch weather data' });
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

app.get('/weather-by-coords', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Lat and lon are required' });
  }

  try {
    const weatherResponse = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat: lat,
          lon: lon,
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



