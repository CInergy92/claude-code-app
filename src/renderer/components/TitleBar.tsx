import { useCallback } from 'react'
import styles from './TitleBar.module.css'

export function TitleBar(): JSX.Element {
  const handleMinimize = useCallback(() => {
    window.electronAPI.minimize()
  }, [])

  const handleMaximize = useCallback(() => {
    window.electronAPI.maximize()
  }, [])

  const handleClose = useCallback(() => {
    window.electronAPI.close()
  }, [])

  return (
    <div className={styles.titleBar}>
      <span className={styles.text}>Claude Code App</span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          &#x2013;
        </button>
        <button
          className={styles.btn}
          onClick={handleMaximize}
          aria-label="Maximize"
        >
          &#x25A1;
        </button>
        <button
          className={`${styles.btn} ${styles.btnClose}`}
          onClick={handleClose}
          aria-label="Close"
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}
