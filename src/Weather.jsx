import { useState, useEffect } from 'react'

const WEATHER_CODES = {
  0:  { label: '맑음',          icon: '☀️' },
  1:  { label: '대체로 맑음',   icon: '🌤️' },
  2:  { label: '부분 흐림',     icon: '⛅' },
  3:  { label: '흐림',          icon: '☁️' },
  45: { label: '안개',          icon: '🌫️' },
  48: { label: '안개',          icon: '🌫️' },
  51: { label: '가벼운 이슬비', icon: '🌦️' },
  53: { label: '이슬비',        icon: '🌦️' },
  55: { label: '강한 이슬비',   icon: '🌧️' },
  61: { label: '가벼운 비',     icon: '🌧️' },
  63: { label: '비',            icon: '🌧️' },
  65: { label: '강한 비',       icon: '🌧️' },
  71: { label: '가벼운 눈',     icon: '🌨️' },
  73: { label: '눈',            icon: '❄️' },
  75: { label: '강한 눈',       icon: '❄️' },
  77: { label: '싸락눈',        icon: '🌨️' },
  80: { label: '소나기',        icon: '🌦️' },
  81: { label: '소나기',        icon: '🌦️' },
  82: { label: '강한 소나기',   icon: '⛈️' },
  85: { label: '눈 소나기',     icon: '🌨️' },
  86: { label: '강한 눈 소나기',icon: '🌨️' },
  95: { label: '뇌우',          icon: '⛈️' },
  96: { label: '우박 동반 뇌우',icon: '⛈️' },
  99: { label: '강한 뇌우',     icon: '⛈️' },
}

export default function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast' +
          '?latitude=37.5665&longitude=126.9780' +
          '&current_weather=true'
        )
        if (!res.ok) throw new Error('날씨 정보를 불러오지 못했습니다.')
        const data = await res.json()
        setWeather(data.current_weather)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getWeatherInfo = (code) =>
    WEATHER_CODES[code] ?? { label: '알 수 없음', icon: '🌡️' }

  if (loading) {
    return (
      <div className="weather-box weather-loading">
        <span className="weather-spinner" />
        날씨 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-box weather-error">
        ⚠️ {error}
      </div>
    )
  }

  const { label, icon } = getWeatherInfo(weather.weathercode)

  return (
    <div className="weather-box">
      <div className="weather-location">📍 서울</div>
      <div className="weather-main">
        <span className="weather-icon">{icon}</span>
        <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
      </div>
      <div className="weather-label">{label}</div>
    </div>
  )
}
