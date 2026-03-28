  const inputCity = document.querySelector('.input-city');

let currentTempCelsius = 0; 
let isCelsius = true;
let cityTimeTimer = null;

function getStatusMessageEl() {
  return document.querySelector('.status-message');
}

function setStatusMessage(text, isError = false) {
  const el = getStatusMessageEl();
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#ffadad' : '#fee75c';
}

function getRecentCities() {
  try {
    const saved = localStorage.getItem('recentCities');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveRecentCity(city) {
  if (!city) return;

  const normalized = city.trim();
  let cities = getRecentCities();

  cities = cities.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
  cities.unshift(normalized);
  cities = cities.slice(0, 6);

  localStorage.setItem('recentCities', JSON.stringify(cities));
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = document.querySelector('.search-history');
  if (!container) return;

  const cities = getRecentCities();
  container.innerHTML = '';

  if (cities.length === 0) {
    container.textContent = 'No recent searches yet.';
    return;
  }

  cities.forEach((city) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = city;
    button.addEventListener('click', () => {
      inputCity.value = city;
      fetchWeatherInfo();
    });
    container.appendChild(button);
  });
}

async function fetchForecast(city) {
  if (!city) return;
  const url = `/forecast?city=${encodeURIComponent(city)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const forecastContainer = document.querySelector('.forecast-container');
    if (!forecastContainer) return; 
    forecastContainer.innerHTML = ''; 

    // IMPROVED FILTER: Gets the 12:00 PM slot (or nearest) for each day
    // We pick every 8th item (since data is every 3 hours, 8 * 3 = 24 hours)
    const tzOffset = data.city?.timezone || 0;
    const dailyData = data.list.filter((item, index) => index % 8 === 0);

    dailyData.forEach(day => {
      const date = new Date((day.dt + tzOffset) * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      const temp = Math.round(day.main.temp);
      const icon = day.weather[0].icon;

      const card = `
        <div class="forecast-card">
          <div class="forecast-date">${date}</div>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
          <div class="forecast-temp">${temp}°C</div>
        </div>
      `;
      forecastContainer.insertAdjacentHTML('beforeend', card);
    });
  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
}

function startCityTimeUpdater() { // Removed tzOffset parameter as we don't need it
  const lastUpdateEl = document.querySelector('.last-update');
  if (!lastUpdateEl) return;

  if (cityTimeTimer) clearInterval(cityTimeTimer);
  
  cityTimeTimer = setInterval(() => {
    // 1. Just get the standard time from your browser/computer
    const actualLocalTime = new Date().toLocaleString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // 2. Update the text
    lastUpdateEl.textContent = `Last Updated: ${actualLocalTime}`;
  }, 1000);
}

function stopCityTimeUpdater() {
  if (cityTimeTimer) {
    clearInterval(cityTimeTimer);
    cityTimeTimer = null;
  }
}


// This handles all the "putting data on the screen" logic
function updateUI(weatherInfo) {
  setStatusMessage('');
  
  currentTempCelsius = weatherInfo.main.temp; // Save the raw number
  displayTemp(); 
  const country = weatherInfo.sys.country;
  const cityName = weatherInfo.name;
  const temperature = weatherInfo.main.temp;
  const description = weatherInfo.weather[0].description;
  const windSpeed = weatherInfo.wind.speed;
  const iconCode = weatherInfo.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
  const tzOffset = weatherInfo.timezone || 0;

  function formatCityTime(offsetSeconds) {
    return new Date(Date.now() + offsetSeconds * 1000).toLocaleString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const newTime = formatCityTime(tzOffset);

  const humid = weatherInfo.main.humidity;
  const sunriseTime = new Date((weatherInfo.sys.sunrise + tzOffset) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const sunsetTime = new Date((weatherInfo.sys.sunset + tzOffset) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const feelsLike = weatherInfo.main.feels_like;


  
    const currentTime = weatherInfo.dt;
  const sunrise = weatherInfo.sys.sunrise;
  const sunset = weatherInfo.sys.sunset;

  const videoElement = document.getElementById('bg-video');
  const videoSource = document.querySelector('#bg-video source');

  const dayVideo = '182288-868067168.mp4'; 
  const nightVideo = '100823-video-720.mp4';

  // DEBUG: Check the values in your console (F12)
  console.log("Current:", currentTime, "Rise:", sunrise, "Set:", sunset);

  if (currentTime >= sunrise && currentTime < sunset) {
      console.log("Setting Day Video");
      if (videoSource.getAttribute('src') !== dayVideo) {
          videoSource.setAttribute('src', dayVideo);
          videoElement.load();
          videoElement.play().catch(e => console.log("Playback error:", e));
      }
  } else {
      console.log("Setting Night Video");
      // Use getAttribute here too for a fair comparison!
      if (videoSource.getAttribute('src') !== nightVideo) {
          videoSource.setAttribute('src', nightVideo);
          videoElement.load();
          videoElement.play().catch(e => console.log("Playback error:", e));
      }
  }

  

  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('loader-hidden');

  // Show the main background with smooth blending and hide input header
  const background = document.querySelector('.background');
  if (background) {
    background.classList.remove('hidden');
    window.requestAnimationFrame(() => {
      background.classList.add('visible');
    });
  }
  const inputHeader = document.querySelector('.input-header');
  if (inputHeader) {
    inputHeader.classList.add('hidden');
  }

  // Update DOM
  document.querySelector('.country').textContent = country;
  document.querySelector('.city-name').textContent = cityName;
  document.querySelector('.temp').textContent = `${Math.round(temperature)}°C`;
  document.querySelector('.description').textContent = description;
  document.querySelector('.wind-speed').textContent = `WindSpeed: ${windSpeed} m/s`;
  document.querySelector('.weather-icon').src = iconUrl;
  const lastUpdateEl = document.querySelector('.last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Last updated: ${newTime}`;
  }
  startCityTimeUpdater(tzOffset);

  document.querySelector('.weather-humidity').textContent = `Humidity: ${humid}%`;
  document.querySelector('.sunrise').textContent = `Sunrise: ${sunriseTime}`;
  document.querySelector('.sunset').textContent = `Sunset: ${sunsetTime}`;
  document.querySelector('.feels-Like').textContent = `Feels like: ${feelsLike}°C`;

  saveRecentCity(cityName);
}

// --- FEATURE 1: Auto-Detect on Load ---
window.onload = () => {
  renderSearchHistory()

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        const url = `/weather-by-coords?lat=${lat}&lon=${lon}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          updateUI(data); 
          // NEW: This gets the forecast for your current city automatically!
          fetchForecast(data.name); 
        }
      } catch (error) {
        console.error("Auto-detect failed:", error);
        setStatusMessage('Location detection failed. Please search manually.', true);
      }
    }, (error) => {
      console.log("Location access denied.");
      setStatusMessage('Location access denied. Search by city.', true);
    });
  }
};


function displayTemp() {
  const tempElement = document.querySelector('.temp');
  const btn = document.getElementById('convert-btn');

  if (isCelsius) {
    tempElement.textContent = `${Math.round(currentTempCelsius)}°C`;
    btn.textContent = "Switch to °F";
  } else {
    const fahrenheit = (currentTempCelsius * 9/5) + 32;
    tempElement.textContent = `${Math.round(fahrenheit)}°F`;
    btn.textContent = "Switch to °C";
  }
}

document.getElementById('convert-btn').addEventListener('click', () => {
  isCelsius = !isCelsius; // Flip the switch
  displayTemp(); // Update the screen
});

window.addEventListener("load", () => {
  setTimeout(() => {
    const intro = document.getElementById("intro");
    if (intro) {
      intro.style.transition = "opacity 1s ease";
      intro.style.opacity = "0";
    }

    setTimeout(() => {
      if (intro) {
        intro.style.display = "none";
      }
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.style.display = "block";
        window.requestAnimationFrame(() => {
          mainContent.classList.add('active');
        });
      }
    }, 1000);
  }, 3500);
});

function fetchWeatherInfo() {
  const city = inputCity.value.trim();
  if (!city) return alert('Please enter a city');

  fetch(`/weather?city=${encodeURIComponent(city)}`)
    .then((res) => res.json())
    .then((weatherInfo) => {
      if (weatherInfo.error) {
        alert(weatherInfo.error);
        return;
      }

      // Keep UI mapping consistent with auto-detect path
      updateUI(weatherInfo);
      fetchForecast(weatherInfo.name);
    })
    .catch((error) => {
      console.error('Error fetching weather:', error);
      setStatusMessage('Could not fetch weather. Try again.', true);
    });
}

document.querySelector('.search-icon-button').addEventListener('click', () => {
  fetchWeatherInfo();
});

inputCity.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    fetchWeatherInfo();
  }
});


