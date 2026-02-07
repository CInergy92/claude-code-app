import { useCallback } from 'react'

export function TitleBar(): JSX.Element {
  const handleMinimize = useCallback(() => {
    // Will be wired to IPC when window controls are added
  }, [])

  const handleClose = useCallback(() => {
    window.close()
  }, [])

  return (
    <div className="title-bar">
      <span className="title-bar__text">Claude Code App</span>
      <div className="title-bar__controls">
        <button
          className="title-bar__btn title-bar__btn--minimize"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          &#x2013;
        </button>
        <button
          className="title-bar__btn title-bar__btn--close"
          onClick={handleClose}
          aria-label="Close"
        >
          &#x2715;
        </button>
      </div>
    </div>
  )
}
