import type { AvatarSettings, EyeStyle } from '../../shared/types'
import styles from './AvatarCustomizer.module.css'

interface AvatarCustomizerProps {
  settings: AvatarSettings
  onSettingsChange: (settings: AvatarSettings) => void
  apiKey: string
  onApiKeyChange: (key: string) => void
}

const COLOR_PRESETS = [
  '#6c63ff',
  '#ff6b6b',
  '#51cf66',
  '#ffd43b',
  '#22b8cf',
  '#ff922b',
  '#cc5de8',
  '#20c997'
]

const EYE_STYLES: { value: EyeStyle; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'oval', label: 'Oval' },
  { value: 'narrow', label: 'Narrow' }
]

export function AvatarCustomizer({
  settings,
  onSettingsChange,
  apiKey,
  onApiKeyChange
}: AvatarCustomizerProps): JSX.Element {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Avatar Settings</h3>

      <div className={styles.field}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              onSettingsChange({ ...settings, enabled: e.target.checked })
            }
          />
          <span>Show Avatar</span>
        </label>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Accent Color</span>
        <div className={styles.colorRow}>
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              className={`${styles.colorSwatch} ${settings.accentColor === color ? styles.colorActive : ''}`}
              style={{ background: color }}
              onClick={() => onSettingsChange({ ...settings, accentColor: color })}
              aria-label={`Select color ${color}`}
            />
          ))}
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) =>
              onSettingsChange({ ...settings, accentColor: e.target.value })
            }
            className={styles.colorPicker}
            title="Custom color"
          />
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Eye Style</span>
        <div className={styles.radioGroup}>
          {EYE_STYLES.map((style) => (
            <label key={style.value} className={styles.radio}>
              <input
                type="radio"
                name="eyeStyle"
                value={style.value}
                checked={settings.eyeStyle === style.value}
                onChange={() =>
                  onSettingsChange({ ...settings, eyeStyle: style.value })
                }
              />
              <span>{style.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="api-key-input">API Key</label>
        <input
          id="api-key-input"
          type="password"
          className={styles.input}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-ant-..."
        />
        <span className={styles.hint}>Your Anthropic API key for chat</span>
      </div>
    </div>
  )
}
