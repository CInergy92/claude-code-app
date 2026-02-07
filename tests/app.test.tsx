import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../src/renderer/App'

describe('App', () => {
  it('renders the title bar', () => {
    render(<App />)
    expect(screen.getByText('Claude Code App')).toBeInTheDocument()
  })

  it('renders the voice button', () => {
    render(<App />)
    expect(screen.getByLabelText('Start listening')).toBeInTheDocument()
  })

  it('renders the transcript panel', () => {
    render(<App />)
    expect(screen.getByText('Transcript')).toBeInTheDocument()
  })

  it('shows empty state message in transcript', () => {
    render(<App />)
    expect(
      screen.getByText('Press the microphone button to start listening...')
    ).toBeInTheDocument()
  })
})
