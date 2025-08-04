// Array para almacenar las ciudades
let cities = [];

// Configuración de la API
const API_BASE_URL = 'http://localhost:8000';

// Función para agregar una nueva ciudad
async function addCity() {
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim();
    
    if (cityName === '') {
        alert('Por favor ingresa el nombre de una ciudad');
        return;
    }

    // Verificar si la ciudad ya existe
    if (cities.find(city => city.name.toLowerCase() === cityName.toLowerCase())) {
        alert('Esta ciudad ya está en la lista');
        return;
    }

    // Mostrar estado de carga
    const addBtn = document.querySelector('.add-btn');
    const originalText = addBtn.textContent;
    addBtn.textContent = 'Agregando...';
    addBtn.disabled = true;

    try {
        // Obtener datos reales de la API
        const weatherData = await getWeatherData(cityName);
        cities.push(weatherData);
        cityInput.value = '';
        renderWeatherCards();
// ------------------------ Faltaba guardadar en la base de datos ------------------------ //
        // 💾 Guardar en la base de datos
        try{
          await fetch(`${API_BASE_URL}/weather`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ciudad: weatherData.name,
              pais: weatherData.country,
              temperatura: weatherData.temperature,
              sensacion_termica: weatherData.feelsLike,
              temp_min: weatherData.tempMin,
              temp_max: weatherData.tempMax,
              humedad: weatherData.humidity,
              presion: weatherData.pressure,
              descripcion: weatherData.description,
              icono: weatherData.icon,
              nubosidad: weatherData.cloudiness,
              viento_velocidad: parseFloat(weatherData.windSpeed),
              viento_direccion: 0,
              visibilidad: weatherData.visibility * 1000,
              amanecer: weatherData.sunrise,
              atardecer: weatherData.sunset,
              coordenadas: {
                latitud: weatherData.coordinates.latitud,
                longitud: weatherData.coordinates.longitud
                },
                timestamp: new Date().toISOString()
              })
            });
          }
        catch (e) {
          console.warn("⚠️ No se pudo guardar el clima en la base de datos:", e.message);
        }
// ------------------------ Fin ------------------------ //

        
        // Mostrar mensaje de éxito
        showNotification(`✅ ${weatherData.name} agregada exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error al agregar ciudad:', error);
        showNotification(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        addBtn.textContent = originalText;
        addBtn.disabled = false;
    }
}

// Función para obtener datos del clima desde la API
async function getWeatherData(cityName) {
    try {
        const response = await fetch(`${API_BASE_URL}/weather_api/${encodeURIComponent(cityName)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ciudad no encontrada');
            } else if (response.status === 408) {
                throw new Error('Tiempo de espera agotado');
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        }
        
        const data = await response.json();
        
        // Formatear datos para el frontend
        return {
            name: data.ciudad,
            country: data.pais,
            temperature: Math.round(data.temperatura),
            description: capitalizeFirstLetter(data.descripcion),
            feelsLike: Math.round(data.sensacion_termica),
            humidity: data.humedad,
            windSpeed: data.viento_velocidad.toFixed(1),
            pressure: data.presion,
            visibility: Math.round(data.visibilidad / 1000), // Convertir de metros a kilómetros
            icon: data.icono,
            tempMin: Math.round(data.temp_min),
            tempMax: Math.round(data.temp_max),
            cloudiness: data.nubosidad,
            sunrise: data.amanecer,
            sunset: data.atardecer,
            coordinates: data.coordenadas,
            timestamp: new Date(data.timestamp).toLocaleString()
        };
        
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new Error('No se pudo conectar con el servidor. Verifica que la API esté corriendo.');
        }
        throw error;
    }
}

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para obtener icono del clima desde OpenWeatherMap
function getWeatherIcon(iconCode) {
    if (iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
    return '☁️';
}

// Función para obtener emoji del clima
function getWeatherEmoji(description, iconCode) {
    const desc = description.toLowerCase();
    if (iconCode) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '⛅',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌦️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[iconCode] || '☁️';
    }
    if (desc.includes('despejado') || desc.includes('clear')) return '☀️';
    if (desc.includes('lluvia') || desc.includes('rain')) return '🌧️';
    if (desc.includes('tormenta') || desc.includes('storm')) return '⛈️';
    if (desc.includes('nieve') || desc.includes('snow')) return '❄️';
    if (desc.includes('niebla') || desc.includes('mist')) return '🌫️';
    return '☁️';
}

// Función para obtener clase CSS del clima
function getWeatherClass(description, iconCode) {
    if (iconCode) {
        if (iconCode.includes('01') || iconCode.includes('02')) return 'sunny';
        if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) return 'rainy';
    }
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('despejado')) return 'sunny';
    if (desc.includes('rain') || desc.includes('lluvia') || desc.includes('storm')) return 'rainy';
    return 'cloudy';
}

// Función para renderizar las tarjetas del clima
function renderWeatherCards() {
    const weatherGrid = document.getElementById('weatherGrid');
    if (cities.length === 0) {
        weatherGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌤️</div>
                <div class="empty-state-text">No cities added yet</div>
                <div class="empty-state-subtext">Add a city to start tracking weather</div>
            </div>
        `;
        return;
    }
    weatherGrid.innerHTML = cities.map(city => `
        <div class="weather-card ${getWeatherClass(city.description, city.icon)}">
            <div class="weather-header">
                <div class="city-info">
                    <span class="city-name">${city.name}</span>
                    <span class="country-tag">${city.country}</span>
                </div>
                <div class="weather-icon-container">
                    <img src="${getWeatherIcon(city.icon)}" alt="${city.description}" class="weather-icon-img">
                    <span class="weather-icon-emoji">${getWeatherEmoji(city.description, city.icon)}</span>
                </div>
            </div>
            <div class="temperature-section">
                <div class="temperature">${city.temperature}°C</div>
                <div class="temp-range">
                    <span class="temp-min">${city.tempMin}°</span> / 
                    <span class="temp-max">${city.tempMax}°</span>
                </div>
            </div>
            <div class="weather-description">${city.description}</div>
            <div class="feels-like">Feels like ${city.feelsLike}°C</div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-icon">💧</span>
                    <span>Humidity: ${city.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💨</span>
                    <span>Wind: ${city.windSpeed} m/s</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🌡️</span>
                    <span>Pressure: ${city.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">👁️</span>
                    <span>Visibility: ${city.visibility} km</span>
                </div>
            </div>
            <div class="extra-info">
                <div class="sun-times">
                    <span class="sunrise">🌅 ${city.sunrise}</span>
                    <span class="sunset">🌇 ${city.sunset}</span>
                </div>
                <div class="last-updated">
                    <small>Updated: ${city.timestamp}</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function fetchCleanedData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cleaned`);
        if (!response.ok) throw new Error("Error al cargar datos limpios");

        const data = await response.json();
        renderCleanedWeatherCards(data);
    } catch (error) {
        showNotification(`❌ Error cargando datos limpios: ${error.message}`, 'error');
    }
}

function renderCleanedWeatherCards(data) {
    const cleanedGrid = document.getElementById("cleanedWeatherGrid");
    if (!cleanedGrid) return;

    if (!data || data.length === 0) {
        cleanedGrid.innerHTML = `<div class="empty-state"><div class="empty-state-text">Sin datos limpios</div></div>`;
        return;
    }

    cleanedGrid.innerHTML = data.map(entry => `
        <div class="weather-card cloudy">
            <div class="weather-header">
                <div class="city-info">
                    <span class="city-name">${entry.ciudad}</span>
                    <span class="country-tag">${entry.pais}</span>
                </div>
            </div>
            <div class="temperature-section">
                <div class="temperature">${Math.round(entry.temperatura)}°C</div>
            </div>
            <div class="weather-description">${entry.descripcion}</div>
            <div class="weather-details">
                <div class="detail-item">💨 Viento: ${entry.viento_clasificacion || '–'}</div>
                <div class="detail-item">🌡️ Temperatura: ${entry.temperatura_clasificacion || '–'}</div>
                <div class="detail-item">👁️ Visibilidad: ${entry.visibilidad_clasificacion || '–'}</div>
            </div>
            <div class="last-updated">
                <small>Actualizado: ${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}


// Función para filtrar ciudades
function filterCities() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const temperatureFilter = document.getElementById('temperatureFilter').value;
    const weatherFilter = document.getElementById('weatherFilter').value;
    
    let filteredCities = cities;

    // Filtrar por búsqueda
    if (searchTerm) {
        filteredCities = filteredCities.filter(city => 
            city.name.toLowerCase().includes(searchTerm)
        );
    }

    // Filtrar por temperatura
    if (temperatureFilter !== 'all') {
        filteredCities = filteredCities.filter(city => {
            const temp = city.temperature;
            switch (temperatureFilter) {
                case 'hot': return temp > 25;
                case 'warm': return temp >= 15 && temp <= 25;
                case 'cold': return temp < 15;
                default: return true;
            }
        });
    }

    // Filtrar por clima
    if (weatherFilter !== 'all') {
        filteredCities = filteredCities.filter(city => {
            const desc = city.description.toLowerCase();
            switch (weatherFilter) {
                case 'clear': return desc.includes('clear') || desc.includes('despejado');
                case 'clouds': return desc.includes('cloud') || desc.includes('nube');
                case 'rain': return desc.includes('rain') || desc.includes('lluvia');
                case 'snow': return desc.includes('snow') || desc.includes('nieve');
                default: return true;
            }
        });
    }

    // Renderizar ciudades filtradas
    renderFilteredCities(filteredCities);
}

// Función para renderizar ciudades filtradas
function renderFilteredCities(filteredCities) {
    const weatherGrid = document.getElementById('weatherGrid');
    if (filteredCities.length === 0) {
        weatherGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No cities match your filters</div>
                <div class="empty-state-subtext">Try adjusting your search criteria</div>
            </div>
        `;
        return;
    }
    weatherGrid.innerHTML = filteredCities.map(city => `
        <div class="weather-card ${getWeatherClass(city.description, city.icon)}">
            <div class="weather-header">
                <div class="city-info">
                    <span class="city-name">${city.name}</span>
                    <span class="country-tag">${city.country}</span>
                </div>
                <div class="weather-icon-container">
                    <img src="${getWeatherIcon(city.icon)}" alt="${city.description}" class="weather-icon-img">
                    <span class="weather-icon-emoji">${getWeatherEmoji(city.description, city.icon)}</span>
                </div>
            </div>
            <div class="temperature-section">
                <div class="temperature">${city.temperature}°C</div>
                <div class="temp-range">
                    <span class="temp-min">${city.tempMin}°</span> / 
                    <span class="temp-max">${city.tempMax}°</span>
                </div>
            </div>
            <div class="weather-description">${city.description}</div>
            <div class="feels-like">Feels like ${city.feelsLike}°C</div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-icon">💧</span>
                    <span>Humidity: ${city.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💨</span>
                    <span>Wind: ${city.windSpeed} m/s</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🌡️</span>
                    <span>Pressure: ${city.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">👁️</span>
                    <span>Visibility: ${city.visibility} km</span>
                </div>
            </div>
            <div class="extra-info">
                <div class="sun-times">
                    <span class="sunrise">🌅 ${city.sunrise}</span>
                    <span class="sunset">🌇 ${city.sunset}</span>
                </div>
                <div class="last-updated">
                    <small>Updated: ${city.timestamp}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para actualizar todos los datos
async function refreshAll() {
    if (cities.length === 0) {
        showNotification('No hay ciudades para actualizar', 'warning');
        return;
    }
    
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = 'Actualizando...';
    refreshBtn.disabled = true;
    refreshBtn.classList.add('loading');
    
    try {
        // Actualizar todas las ciudades en paralelo
        const promises = cities.map(async (city, index) => {
            try {
                const updatedData = await getWeatherData(city.name);
                cities[index] = updatedData;
                return { success: true, city: city.name };
            } catch (error) {
                console.error(`Error actualizando ${city.name}:`, error);
                return { success: false, city: city.name, error: error.message };
            }
        });
        
        const results = await Promise.all(promises);
        
        // Contar éxitos y fallos
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        renderWeatherCards();
        
        if (failed === 0) {
            showNotification(`✅ ${successful} ciudades actualizadas exitosamente`, 'success');
        } else {
            showNotification(`⚠️ ${successful} exitosas, ${failed} fallidas`, 'warning');
        }
        
    } catch (error) {
        console.error('Error general en actualización:', error);
        showNotification('❌ Error al actualizar ciudades', 'error');
    } finally {
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
    }
}

// Función para limpiar todas las ciudades
function clearAllCities() {
    if (cities.length === 0) {
        showNotification('No hay ciudades para eliminar', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar todas las ciudades?')) {
        cities = [];
        renderWeatherCards();
        showNotification('🗑️ Todas las ciudades eliminadas', 'info');
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para probar la conectividad con la API
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API conectada:', data);
            showNotification('🔗 API conectada correctamente', 'success');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error conectando con API:', error);
        showNotification('❌ Error conectando con API. Verifica que esté corriendo en localhost:8000', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Probar conexión con API al cargar
    testAPIConnection();
    
    // Listener para agregar ciudad con Enter
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addCity();
        }
    });

    // Listeners para filtros
    document.getElementById('searchInput').addEventListener('input', filterCities);
    document.getElementById('temperatureFilter').addEventListener('change', filterCities);
    document.getElementById('weatherFilter').addEventListener('change', filterCities);

    // Renderizar inicial (vacío)
    renderWeatherCards();
    fetchCleanedData();
});

// Función para manejar el envío del formulario de ingreso de entradas
document.addEventListener("DOMContentLoaded", () => {
  const entradaForm = document.getElementById("entradaForm");
  if (!entradaForm) return;

  entradaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Cambiado para usar FormData para el archivo imagen
    const formData = new FormData();
    formData.append("nombre", entradaForm.nombre.value);
    formData.append("ciudad", entradaForm.ciudad.value);
    formData.append("clima", entradaForm.clima.value);
    formData.append("descripcion", entradaForm.descripcion.value);

    // imagen es tipo file, debe ser entradaForm.imagen.files[0]
    if (entradaForm.imagen.files.length > 0) {
      formData.append("imagen", entradaForm.imagen.files[0]);
    } else {
      // Si no hay archivo seleccionado, puedes decidir qué hacer (opcional)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/entradas`, {
        method: "POST",
        // No setear Content-Type, el navegador lo hace automáticamente con FormData
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al enviar la entrada");
      }

      alert("Entrada enviada exitosamente");
      entradaForm.reset();
    } catch (error) {
      alert("Error al enviar la entrada: " + error.message);
    }
  });
});

// ---------------------------------------------------
// PUNTO 4 - Mostrar en pestaña nueva la tabla con entradas
// ---------------------------------------------------

async function openEntriesTab() {
  try {
    const response = await fetch(`${API_BASE_URL}/entradas`);
    if (!response.ok) {
      throw new Error("Error al obtener las entradas");
    }

    const entradas = await response.json();

    const newTab = window.open('', '_blank');
    if (!newTab) {
      alert("No se pudo abrir la nueva pestaña. Verifica que no esté bloqueada por el navegador.");
      return;
    }

    const tableRows = entradas.map((entrada, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${entrada.nombre}</td>
        <td>${entrada.ciudad}</td>
        <td>${entrada.clima}</td>
        <td>${entrada.descripcion}</td>
        <td><img src="data:image/png;base64,${entrada.imagen}" alt="Imagen" width="80"/></td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Listado de Entradas</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #4CAF50;
              color: white;
            }
            img {
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <h2>Entradas del Clima</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Ciudad</th>
                <th>Clima</th>
                <th>Descripción</th>
                <th>Imagen</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    newTab.document.write(htmlContent);
    newTab.document.close();
  } catch (error) {
    showNotification(`❌ No se pudieron cargar las entradas: ${error.message}`, 'error');
  }
}

// Crear botón para abrir pestaña con entradas
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.createElement('button');
  btn.textContent = '📄 Ver Entradas';
  btn.className = 'view-entries-btn';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #3b82f6;
    color: white;
    padding: 12px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 999;
  `;
  btn.onclick = openEntriesTab;
  document.body.appendChild(btn);
});


// ---------------------------------------------------
// PUNTO 5 - Mostrar registros de la base de datos en el formulario

window.addEventListener("DOMContentLoaded", fetchEntradas);

// Elementos del DOM
const ciudadInput = document.getElementById("filterCiudad");
const climaSelect = document.getElementById("filterClima");
const origenFiltro = document.getElementById("origenFiltro");  // ← este ID debe coincidir con el <select>
const registrosContainer = document.getElementById("registrosContainer");

let currentPage = 1;
const cardsPerPage = 4;

// Estilo en grid para tarjetas si no está ya aplicado
if (registrosContainer && !registrosContainer.classList.contains("weather-grid-show")) {
  registrosContainer.classList.add("weather-grid-show");
}

// Listeners de filtros
if (ciudadInput && climaSelect && origenFiltro) {
  ciudadInput.addEventListener("input", () => {
    currentPage = 1;
    fetchEntradas();
  });
  climaSelect.addEventListener("change", () => {
    currentPage = 1;
    fetchEntradas();
  });
  origenFiltro.addEventListener("change", () => {
    currentPage = 1;
    fetchEntradas();
  });
}

async function fetchEntradas() {
  try {
    const res = await fetch("http://127.0.0.1:8000/entradas");
    const data = await res.json();

    const ciudadFiltro = ciudadInput.value.toLowerCase();
    const climaFiltro = climaSelect.value;
    const origenSeleccionado = origenFiltro ? origenFiltro.value : "all";

    const filtrados = data.filter(entry => {
      const ciudadOk = entry.ciudad.toLowerCase().includes(ciudadFiltro);
      const climaOk = climaFiltro === "all" || entry.clima.toLowerCase() === climaFiltro;
      const origenOk = origenSeleccionado === "all" || entry.origen === origenSeleccionado;
      return ciudadOk && climaOk && origenOk;
    });

    renderEntradas(filtrados);
  } catch (err) {
    registrosContainer.innerHTML = "<p>Error al cargar registros</p>";
  }
}

function renderEntradas(entradas) {
  registrosContainer.innerHTML = "";

  if (entradas.length === 0) {
    registrosContainer.innerHTML = "<p>No hay registros coincidentes</p>";
    return;
  }

  const totalPages = Math.ceil(entradas.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = entradas.slice(startIndex, endIndex);

  currentCards.forEach(entry => {
    const clima = (entry.clima || "").toLowerCase();
    const climaClass = clima.includes("lluv") ? "rainy" :
                       clima.includes("nublado") ? "cloudy" : "sunny";

    const card = document.createElement("div");
    card.className = `weather-card ${climaClass}`;
    card.innerHTML = `
      <div class="weather-header">
        <div class="city-info">
          <span class="city-name">${entry.nombre}</span>
          <span class="country-tag">${entry.ciudad}</span>
        </div>
      </div>
      <div class="temperature">${entry.clima}</div>
      <div class="weather-description">${entry.descripcion || "Sin descripción"}</div>
      ${entry.imagen ? `<img src="data:image/*;base64,${entry.imagen}" alt="Imagen" class="card-img">` : ""}
    `;
    registrosContainer.appendChild(card);
  });

  // Controles de paginación centrados abajo
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "pagination-wrapper";
  paginationDiv.innerHTML = `
    <div class="pagination">
      <button ${currentPage === 1 ? "disabled" : ""} onclick="changePage(-1)">◀ Anterior</button>
      <span>Página ${currentPage} de ${totalPages}</span>
      <button ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(1)">Siguiente ▶</button>
    </div>
  `;
  registrosContainer.appendChild(paginationDiv);
}

// Controlador global para paginación
window.changePage = function (delta) {
  currentPage += delta;
  fetchEntradas();
};

