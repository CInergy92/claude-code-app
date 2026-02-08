import type { VisualizerMode } from '../../shared/types'
import styles from './SettingsBar.module.css'

interface SettingsBarProps {
  language: string
  onLanguageChange: (lang: string) => void
  visualizerMode: VisualizerMode
  onVisualizerModeChange: (mode: VisualizerMode) => void
  showCustomizer: boolean
  onToggleCustomizer: () => void
}

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (BR)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
]

const VISUALIZER_MODES: { value: VisualizerMode; label: string }[] = [
  { value: 'bars', label: 'Bars' },
  { value: 'waveform', label: 'Waveform' },
  { value: 'circular', label: 'Circular' },
]

export function SettingsBar({
  language,
  onLanguageChange,
  visualizerMode,
  onVisualizerModeChange,
  showCustomizer,
  onToggleCustomizer,
}: SettingsBarProps): JSX.Element {
  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <span className={styles.label}>Language</span>
        <select
          className={styles.select}
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Visualizer</span>
        <select
          className={styles.select}
          value={visualizerMode}
          onChange={(e) => onVisualizerModeChange(e.target.value as VisualizerMode)}
        >
          {VISUALIZER_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className={`${styles.avatarBtn} ${showCustomizer ? styles.avatarBtnActive : ''}`}
        onClick={onToggleCustomizer}
        title="Avatar settings"
      >
        Avatar
      </button>
    </div>
  )
}
