import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import CityTable from '../components/CityTable'
import ConfirmDialog from '../components/ConfirmDialog'
import WeatherCard from '../components/WeatherCard'
import { EmptyMessage, ErrorMessage, LoadingMessage } from '../components/StatusMessage'
import { addCity, deactivateCity, deleteCity, getAllCities, searchCities } from '../api/cityApi'
import { getWeather } from '../api/weatherApi'
import { normalizeApiError } from '../api/axios'

export default function AdminDashboard() {
  const [cities, setCities] = useState([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [action, setAction] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [weather, setWeather] = useState(null)
  const [weatherCity, setWeatherCity] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const searchId = useRef(0)

  async function loadCities() {
    setLoading(true)
    try {
      const { data } = await getAllCities()
      setCities(data)
    } catch (requestError) {
      setError(normalizeApiError(requestError).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCities() }, [])

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return undefined
    }
    const id = ++searchId.current
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await searchCities(query.trim())
        if (id === searchId.current) setSuggestions(data)
      } catch {
        if (id === searchId.current) setError('Unable to search cities.')
      } finally {
        if (id === searchId.current) setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  function chooseSuggestion(city) {
    setSelected(city)
    setSuggestions([])
    setQuery(city.name)
  }

  async function handleAdd() {
    setAction('add')
    setError('')
    try {
      await addCity({ name: selected.name, state: selected.state, country: selected.country, latitude: selected.latitude, longitude: selected.longitude })
      setNotice('City added successfully.')
      setSelected(null)
      setQuery('')
      await loadCities()
    } catch (requestError) {
      const normalized = normalizeApiError(requestError)
      setError(normalized.status === 409 ? 'City already exists.' : normalized.message)
    } finally {
      setAction(null)
    }
  }

  async function handleWeather(city) {
    setWeatherCity(city)
    setWeather(null)
    setWeatherError('')
    setWeatherLoading(true)
    try {
      const { data } = await getWeather(city.id)
      setWeather(data)
    } catch (requestError) {
      setWeatherError(requestError.response?.status === 404 ? 'City not found.' : requestError.response?.status === 502 ? 'Weather information is temporarily unavailable.' : 'Unable to load weather for this city.')
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleConfirm() {
    const { city, type } = dialog
    setAction(`${type}-${city.id}`)
    try {
      if (type === 'deactivate') {
        await deactivateCity(city.id)
        setNotice('City deactivated successfully.')
        if (weatherCity?.id === city.id) { setWeather(null); setWeatherCity(null) }
      } else {
        await deleteCity(city.id)
        setNotice('City deleted successfully.')
      }
      setDialog(null)
      await loadCities()
    } catch (requestError) {
      setError(normalizeApiError(requestError).message)
    } finally {
      setAction(null)
    }
  }

  return <div className="app-shell"><Navbar admin /><main className="page-content admin-page">
    <section className="page-heading"><div><span className="eyebrow">Administration</span><h1>Keep the map useful.</h1><p>Configure cities and check their current conditions.</p></div><span className="admin-stamp">ADMIN<br /><small>CONTROL ROOM</small></span></section>
    {(notice || error) && <div className={notice ? 'notice' : 'form-error page-alert'}>{notice || error}<button onClick={() => { setNotice(''); setError('') }}>×</button></div>}
    <section className="admin-tools"><div className="section-heading"><div><span className="eyebrow">OpenWeather geocoding</span><h2>Add a city</h2></div></div><div className="search-box"><span>⌕</span><input value={query} onChange={event => { setQuery(event.target.value); setSelected(null) }} placeholder="Search by city name..." /><small>{query.length < 3 ? 'Type 3+ characters' : searching ? 'Searching...' : 'Select a result'}</small></div>
      {suggestions.length > 0 && <div className="suggestions">{suggestions.map((city, index) => <button key={`${city.name}-${index}`} onClick={() => chooseSuggestion(city)}><span><strong>{city.name}</strong><small>{city.state ? `${city.state}, ` : ''}{city.country}</small></span><span>↗</span></button>)}</div>}
      {query.length >= 3 && !searching && suggestions.length === 0 && !selected && <p className="search-empty">No matching cities found.</p>}
      {selected && <div className="selected-city"><div><span className="eyebrow">Selected city</span><h3>{selected.name}, {selected.state || selected.country}</h3><p>{selected.country} · {Number(selected.latitude).toFixed(4)}, {Number(selected.longitude).toFixed(4)}</p></div><button className="button button-primary" disabled={action === 'add'} onClick={handleAdd}>{action === 'add' ? 'Adding city...' : 'Add city'} <span>+</span></button></div>}
    </section>
    <section className="admin-weather"><div className="section-heading"><div><span className="eyebrow">Admin preview</span><h2>Check city weather</h2></div>{weatherCity && <span className="count-badge">{weatherCity.name}</span>}</div><label className="admin-city-picker">Choose an active city<select value={weatherCity?.id || ''} onChange={event => { const city = cities.find(item => String(item.id) === event.target.value); if (city) handleWeather(city) }}><option value="">Select a city...</option>{cities.filter(city => city.active ?? city.isActive).map(city => <option key={city.id} value={city.id}>{city.name}{city.state ? `, ${city.state}` : ''} ({city.country})</option>)}</select></label>{weatherLoading ? <div className="weather-placeholder"><LoadingMessage>Loading weather...</LoadingMessage></div> : weather ? <WeatherCard weather={weather} /> : weatherError ? <ErrorMessage>{weatherError}</ErrorMessage> : <div className="weather-placeholder"><span className="weather-placeholder-icon">☁</span><p>Select a city to view its current weather.</p></div>}</section>
    <section className="admin-table-section"><div className="section-heading"><div><span className="eyebrow">The current list</span><h2>Configured cities</h2></div><span className="count-badge">{cities.length} total</span></div>{loading ? <LoadingMessage>Loading cities...</LoadingMessage> : error && !cities.length ? <ErrorMessage onRetry={loadCities}>Unable to load cities. Please try again.</ErrorMessage> : cities.length ? <CityTable cities={cities} busyId={action?.split('-')[1]} onWeather={handleWeather} onDeactivate={city => setDialog({ city, type: 'deactivate' })} onDelete={city => setDialog({ city, type: 'delete' })} /> : <EmptyMessage>No cities are currently configured.</EmptyMessage>}</section>
  </main>{dialog && <ConfirmDialog title={dialog.type === 'delete' ? `Delete ${dialog.city.name} permanently?` : `Deactivate ${dialog.city.name}?`} message={dialog.type === 'delete' ? 'Deleting this city cannot be undone.' : 'Users will no longer see this city in their dashboard.'} confirmLabel={dialog.type === 'delete' ? 'Delete permanently' : 'Deactivate'} danger={dialog.type === 'delete'} busy={Boolean(action)} onCancel={() => setDialog(null)} onConfirm={handleConfirm} />}</div>
}
