export default function WeatherCard({ weather }) {
  return <article className="weather-card">
    <div className="weather-card-heading"><div><span className="eyebrow">Current conditions</span><h2>{weather.cityName}</h2></div><span className="weather-symbol">☼</span></div>
    <div className="temperature"><strong>{Number(weather.temperature).toFixed(1)}°</strong><span>Celsius</span></div>
    <p className="weather-description">{weather.description || weather.condition}</p>
    <div className="weather-metrics"><div><span>Feels like</span><strong>{Number(weather.feelsLike).toFixed(1)}°C</strong></div><div><span>Humidity</span><strong>{weather.humidity}%</strong></div><div><span>Wind speed</span><strong>{weather.windSpeed} m/s</strong></div></div>
  </article>
}
