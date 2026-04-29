/**
 * LessonComplete — Duolingo-style lesson completion celebration overlay.
 * Shows confetti burst, SAGE celebration, XP earned, streak, and hearts.
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SAGEOwl from './SAGEOwl';
import HeartsBar from './HeartsBar';
import useXP from '../hooks/useXP';
import { ArrowRight, RotateCcw } from 'lucide-react';

// Generate random confetti particles
function Confetti() {
  const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#f43f5e', '#a78bfa', '#f97316'];
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${0.8 + Math.random() * 0.6}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 720}deg`,
    shape: Math.random() > 0.5 ? '50%' : '2px',
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function LessonComplete({ score, total, earnedXP = 0, onContinue, onRetry, lessonName = 'Lesson' }) {
  const { xpState } = useXP();
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getMessage = () => {
    if (percentage === 100) return { headline: 'Perfect! 🎯', sub: 'You got every single one right!', sage: 'celebrating' };
    if (percentage >= 70) return { headline: 'Well Done! ⭐', sub: `You got ${score} out of ${total} correct.`, sage: 'happy' };
    return { headline: 'Keep Going! 💪', sub: `You got ${score} out of ${total}. Practice makes perfect!`, sage: 'sad' };
  };

  const { headline, sub, sage } = getMessage();

  return (
    <div className="lesson-complete-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 800,
      background: 'rgba(2, 6, 23, 0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      animation: 'fade-in 0.3s ease',
    }}>
      <Confetti />

      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '28px',
        padding: '40px 36px',
        maxWidth: '420px',
        width: '90vw',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        {/* SAGE owl */}
        <div style={{ marginBottom: '16px' }}>
          <SAGEOwl state={sage} size={72} />
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {headline}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>{sub}</p>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px', marginBottom: '28px',
        }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '14px 8px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}>+{earnedXP}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>XP Earned</div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '14px 8px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#f97316' }}>🔥 {xpState.streak}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Day Streak</div>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '14px 8px' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#3b82f6' }}>{percentage}%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Score</div>
          </div>
        </div>

        {/* Hearts remaining */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
          <HeartsBar />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {onRetry && (
            <button className="btn btn-ghost" onClick={onRetry} style={{ flex: 1 }}>
              <RotateCcw size={15} /> Try Again
            </button>
          )}
          <button className="btn btn-primary" onClick={onContinue} style={{ flex: 2, padding: '14px', fontSize: '16px', fontWeight: '700' }}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

LessonComplete.propTypes = {
  score: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  earnedXP: PropTypes.number,
  onContinue: PropTypes.func.isRequired,
  onRetry: PropTypes.func,
  lessonName: PropTypes.string,
};

export default LessonComplete;
