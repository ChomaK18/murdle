import { useLayoutEffect, useState } from 'react'

type ThemePreference = 'system' | 'light' | 'dark'

const THEME_STORAGE_KEY = 'murdle-theme'

function getInitialThemePreference(): ThemePreference {
  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY)
    return storedPreference === 'light' || storedPreference === 'dark'
      ? storedPreference
      : 'system'
  } catch (error) {
    console.error('Nie udało się odczytać preferencji motywu.', error)
    return 'system'
  }
}

function Brand() {
  const [themePreference, setThemePreference] = useState(getInitialThemePreference)
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const isDark = themePreference === 'system' ? systemPrefersDark : themePreference === 'dark'

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateSystemPreference = () => setSystemPrefersDark(mediaQuery.matches)

    mediaQuery.addEventListener('change', updateSystemPreference)
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content',
      isDark ? '#171b18' : '#2e4136',
    )

    return () => mediaQuery.removeEventListener('change', updateSystemPreference)
  }, [isDark])

  function toggleTheme() {
    const nextPreference = isDark ? 'light' : 'dark'
    setThemePreference(nextPreference)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference)
    } catch (error) {
      console.error('Nie udało się zapisać preferencji motywu.', error)
    }
  }

  return (
    <div className="brand-controls">
      <a className="brand" href="#" aria-label="Murdle — plansza detektywa">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span className="brand-name">murdle<span>.</span></span>
      </a>
      <button
        className="theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
        title={isDark ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
      >
        <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
      </button>
    </div>
  )
}

export default Brand
