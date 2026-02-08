import type { AvatarEmotion, AvatarAnimationState, EyeStyle } from '../../shared/types'
import styles from './Avatar.module.css'

interface AvatarProps {
  emotion: AvatarEmotion
  animationState: AvatarAnimationState
  accentColor: string
  eyeStyle: EyeStyle
  mouthOpenness: number
}

interface ExpressionConfig {
  eyeScaleY: number
  eyeOffsetX: number
  browRotateLeft: number
  browRotateRight: number
  browOffsetY: number
  mouthPath: string
  mouthScaleY: number
}

function getExpression(emotion: AvatarEmotion): ExpressionConfig {
  switch (emotion) {
    case 'happy':
      return {
        eyeScaleY: 0.85,
        eyeOffsetX: 0,
        browRotateLeft: -5,
        browRotateRight: 5,
        browOffsetY: -3,
        mouthPath: 'M 70 130 Q 100 155 130 130',
        mouthScaleY: 1
      }
    case 'sad':
      return {
        eyeScaleY: 0.9,
        eyeOffsetX: 0,
        browRotateLeft: 10,
        browRotateRight: -10,
        browOffsetY: 2,
        mouthPath: 'M 75 140 Q 100 125 125 140',
        mouthScaleY: 1
      }
    case 'confused':
      return {
        eyeScaleY: 1.1,
        eyeOffsetX: 3,
        browRotateLeft: 12,
        browRotateRight: -5,
        browOffsetY: -1,
        mouthPath: 'M 80 135 Q 100 135 115 132',
        mouthScaleY: 1
      }
    case 'excited':
      return {
        eyeScaleY: 1.2,
        eyeOffsetX: 0,
        browRotateLeft: -10,
        browRotateRight: 10,
        browOffsetY: -5,
        mouthPath: 'M 70 128 Q 100 160 130 128',
        mouthScaleY: 1.2
      }
    default:
      return {
        eyeScaleY: 1,
        eyeOffsetX: 0,
        browRotateLeft: 0,
        browRotateRight: 0,
        browOffsetY: 0,
        mouthPath: 'M 80 133 Q 100 140 120 133',
        mouthScaleY: 1
      }
  }
}

function getEyeRadii(eyeStyle: EyeStyle): { rx: number; ry: number } {
  switch (eyeStyle) {
    case 'oval':
      return { rx: 7, ry: 10 }
    case 'narrow':
      return { rx: 8, ry: 5 }
    default:
      return { rx: 7, ry: 7 }
  }
}

export function Avatar({
  emotion,
  animationState,
  accentColor,
  eyeStyle,
  mouthOpenness
}: AvatarProps): JSX.Element {
  const expr = getExpression(emotion)
  const eyeRadii = getEyeRadii(eyeStyle)

  const stateClass = styles[animationState] || ''
  const speakingOpen = animationState === 'speaking' ? mouthOpenness * 8 : 0

  return (
    <div
      className={`${styles.container} ${stateClass}`}
      style={{ '--avatar-accent': accentColor } as React.CSSProperties}
    >
      <svg viewBox="0 0 200 200" className={styles.svg}>
        {/* Pulse ring for listening state */}
        {animationState === 'listening' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            className={styles.pulseRing}
            opacity="0.4"
          />
        )}

        {/* Head */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="var(--bg-secondary)"
          stroke={accentColor}
          strokeWidth="2.5"
        />

        {/* Left eyebrow */}
        <g
          className={styles.brow}
          style={{
            transform: `rotate(${expr.browRotateLeft}deg) translateY(${expr.browOffsetY}px)`,
            transformOrigin: '75px 72px'
          }}
        >
          <line
            x1="60"
            y1="72"
            x2="88"
            y2="72"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Right eyebrow */}
        <g
          className={styles.brow}
          style={{
            transform: `rotate(${expr.browRotateRight}deg) translateY(${expr.browOffsetY}px)`,
            transformOrigin: '125px 72px'
          }}
        >
          <line
            x1="112"
            y1="72"
            x2="140"
            y2="72"
            stroke="var(--text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Left eye */}
        <g className={styles.eye}>
          <ellipse
            cx={75 + expr.eyeOffsetX}
            cy="90"
            rx={eyeRadii.rx}
            ry={eyeRadii.ry * expr.eyeScaleY}
            fill="var(--text-primary)"
            className={styles.eyeball}
          />
          {/* Blink lid */}
          <rect
            x={75 + expr.eyeOffsetX - eyeRadii.rx - 1}
            y={90 - eyeRadii.ry * expr.eyeScaleY - 1}
            width={(eyeRadii.rx + 1) * 2}
            height={(eyeRadii.ry * expr.eyeScaleY + 1) * 2}
            fill="var(--bg-secondary)"
            className={styles.eyelid}
          />
        </g>

        {/* Right eye */}
        <g className={styles.eye}>
          <ellipse
            cx={125 + expr.eyeOffsetX}
            cy="90"
            rx={eyeRadii.rx}
            ry={eyeRadii.ry * expr.eyeScaleY}
            fill="var(--text-primary)"
            className={styles.eyeball}
          />
          {/* Blink lid */}
          <rect
            x={125 + expr.eyeOffsetX - eyeRadii.rx - 1}
            y={90 - eyeRadii.ry * expr.eyeScaleY - 1}
            width={(eyeRadii.rx + 1) * 2}
            height={(eyeRadii.ry * expr.eyeScaleY + 1) * 2}
            fill="var(--bg-secondary)"
            className={styles.eyelid}
          />
        </g>

        {/* Mouth */}
        <g className={styles.mouth}>
          {speakingOpen > 0 ? (
            <ellipse
              cx="100"
              cy="135"
              rx={12}
              ry={speakingOpen}
              fill="var(--bg-primary)"
              stroke="var(--text-primary)"
              strokeWidth="2"
            />
          ) : (
            <path
              d={expr.mouthPath}
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* Thinking dots */}
        {animationState === 'thinking' && (
          <g className={styles.thinkingDots}>
            <circle cx="85" cy="160" r="4" fill={accentColor} className={styles.dot1} />
            <circle cx="100" cy="160" r="4" fill={accentColor} className={styles.dot2} />
            <circle cx="115" cy="160" r="4" fill={accentColor} className={styles.dot3} />
          </g>
        )}
      </svg>
    </div>
  )
}
