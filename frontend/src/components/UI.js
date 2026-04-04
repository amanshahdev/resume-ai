/**
 * components/UI.js - Shared UI Primitives
 *
 * WHAT: Button, Card, Badge, ProgressBar, Spinner, Input, ScoreRing — all the
 *       design-system building blocks used by every page.
 * HOW:  Pure React functional components styled entirely with inline styles +
 *       CSS variables so they work without any CSS-in-JS library.
 * WHY:  Centralised UI primitives keep pages focused on business logic,
 *       ensure visual consistency, and eliminate copy-paste styling.
 */

import React from 'react';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, fullWidth = false, type = 'button', style = {},
}) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', borderRadius: 'var(--radius-md)', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'all var(--transition)',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.01em',
    position: 'relative', overflow: 'hidden',
  };

  const sizes = {
    sm:  { padding: '8px 14px', fontSize: '0.8rem' },
    md:  { padding: '11px 22px', fontSize: '0.9rem' },
    lg:  { padding: '14px 28px', fontSize: '1rem' },
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      color: '#fff',
      boxShadow: '0 4px 15px var(--primary-glow)',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-light)',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--danger), #e05555)',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    accent: {
      background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
      color: '#0B0E1A',
    },
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, glow = false, hover = false }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-light)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        transition: 'all var(--transition)',
        boxShadow: glow ? 'var(--shadow-glow)' : hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover && hovered ? 'translateY(-2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default:  { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border)' },
    primary:  { bg: 'var(--primary-glow)', color: 'var(--primary-light)', border: 'var(--primary)' },
    success:  { bg: 'rgba(0,212,170,0.15)', color: 'var(--success)', border: 'rgba(0,212,170,0.3)' },
    warning:  { bg: 'rgba(255,184,48,0.15)', color: 'var(--warning)', border: 'rgba(255,184,48,0.3)' },
    danger:   { bg: 'rgba(255,107,107,0.15)', color: 'var(--danger)', border: 'rgba(255,107,107,0.3)' },
    info:     { bg: 'rgba(79,195,247,0.15)', color: 'var(--info)', border: 'rgba(79,195,247,0.3)' },
  };
  const v = variants[variant] || variants.default;
  const fontSize = size === 'xs' ? '0.65rem' : size === 'sm' ? '0.72rem' : '0.8rem';
  const padding  = size === 'xs' ? '2px 6px' : size === 'sm' ? '3px 8px' : '5px 12px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
      borderRadius: 'var(--radius-full)',
      fontSize, fontWeight: 600, padding,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, max = 100, label, showValue = true, color, height = 8, animated = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const getColor = (p) => {
    if (color) return color;
    if (p >= 80) return 'var(--success)';
    if (p >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>}
          {showValue && <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>{value}</span>}
        </div>
      )}
      <div style={{
        height, background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${getColor(pct)}, ${getColor(pct)}cc)`,
          borderRadius: 'var(--radius-full)',
          transition: animated ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          boxShadow: `0 0 8px ${getColor(pct)}66`,
        }} />
      </div>
    </div>
  );
};

// ── Score Ring (circular progress) ───────────────────────────────────────────
export const ScoreRing = ({ score = 0, size = 160, strokeWidth = 10 }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const getColor = (s) => {
    if (s >= 80) return '#00D4AA';
    if (s >= 60) return '#FFB830';
    return '#FF6B6B';
  };

  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const color = getColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="var(--bg-elevated)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: size > 120 ? '2.2rem' : '1.5rem',
          color, lineHeight: 1, animation: 'countUp 0.5s ease forwards',
        }}>
          {score}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>/ 100</div>
        <div style={{
          marginTop: 4, background: color + '22', color,
          border: `1px solid ${color}55`, borderRadius: 'var(--radius-full)',
          padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
        }}>
          {grade}
        </div>
      </div>
    </div>
  );
};

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({
  label, type = 'text', value, onChange, placeholder,
  error, required, icon, style = {},
}) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.02em',
        }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex',
          }}>
            {icon}
          </div>
        )}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            background: 'var(--bg-elevated)',
            border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontSize: '0.9rem', fontFamily: 'var(--font-body)',
            transition: 'border-color var(--transition)',
            outline: 'none',
            boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(255,107,107,0.15)' : 'var(--primary-glow)'}` : 'none',
            ...style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = 'var(--primary)', delta }) => (
  <Card hover style={{ padding: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        {delta !== undefined && (
          <div style={{ fontSize: '0.78rem', marginTop: 6, color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} from last
          </div>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)',
        background: color + '22', color, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// ── Tag cloud ─────────────────────────────────────────────────────────────────
export const TagCloud = ({ tags = [], color = 'primary', max = 20 }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {tags.slice(0, max).map((tag, i) => (
      <Badge key={i} variant={color}>{tag}</Badge>
    ))}
    {tags.length > max && (
      <Badge variant="default">+{tags.length - max} more</Badge>
    )}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h2 style={{ marginBottom: 4 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div style={{
    textAlign: 'center', padding: '48px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2rem',
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto' }}>{description}</p>
    </div>
    {action}
  </div>
);
