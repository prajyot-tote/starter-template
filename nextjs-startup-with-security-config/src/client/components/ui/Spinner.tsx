'use client';

// ============================================
// SPINNER COMPONENT
// ============================================
// Framework-agnostic loading spinner using CSS variables

interface SpinnerProps {
  /** Size in pixels (default: 32) */
  size?: number;
  /** Color (default: currentColor) */
  color?: string;
  /** Additional className */
  className?: string;
}

/**
 * Simple loading spinner using inline styles (framework-agnostic)
 *
 * @example
 * <Spinner />
 * <Spinner size={24} color="var(--primary)" />
 */
export function Spinner({ size = 32, color = 'currentColor', className }: SpinnerProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-page loading spinner
 *
 * @example
 * <FullPageSpinner />
 */
export function FullPageSpinner({ size = 32, color }: Omit<SpinnerProps, 'className'>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Spinner size={size} color={color} />
    </div>
  );
}
