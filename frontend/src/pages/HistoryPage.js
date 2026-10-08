/**
 * pages/HistoryPage.js - Analysis History
 *
 * WHAT: Lists all past resume analyses for the logged-in user with scores,
 *       grades, dates, and quick links to the full results page.
 * HOW:  Fetches from GET /api/analysis/history on mount and renders each
 *       analysis as a card with a score indicator and score breakdown preview.
 * WHY:  Users need to track progress across multiple uploads and iterations
 *       of their resume — the history page makes improvement visible over time.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetHistory, apiDeleteResume } from '../utils/api';
import { Card, Button, Badge, ProgressBar, SectionHeader, EmptyState, Spinner } from '../components/UI';
import toast from 'react-hot-toast';

const GradeCircle = ({ score }) => {
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
      border: `3px solid ${color}`, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: color + '15',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color, lineHeight: 1 }}>
        {score}
      </div>
      <div style={{ fontSize: '0.65rem', color, fontWeight: 700 }}>{grade}</div>
    </div>
  );
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetHistory()
      .then(data => setAnalyses(data.analyses || []))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length)
    : 0;

  const bestScore = analyses.length ? Math.max(...analyses.map(a => a.overallScore)) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, gap: 16 }}>
        <Spinner size={28} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)' }}>Loading history…</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader
        title="Analysis History"
        subtitle={`${analyses.length} analysis${analyses.length !== 1 ? 'es' : ''} across all your resumes`}
        action={
          <Button onClick={() => navigate('/upload')}>↑ Upload New Resume</Button>
        }
      />

      {/* ── Summary strip ────────────────────────────────────────── */}
      {analyses.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 28,
        }}>
          {[
            { label: 'Total Analyses', value: analyses.length, icon: '📊' },
            { label: 'Average Score', value: `${avgScore}/100`, icon: '⭐' },
            { label: 'Best Score',    value: `${bestScore}/100`, icon: '🏆' },
            { label: 'Improvement',   value: analyses.length > 1 ? `+${Math.max(0, analyses[0].overallScore - analyses[analyses.length-1].overallScore)} pts` : '—', icon: '📈' },
          ].map(({ label, value, icon }) => (
            <Card key={label} style={{ padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                {value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Analysis list ─────────────────────────────────────────── */}
      {analyses.length === 0 ? (
        <Card>
          <EmptyState
            icon="📊"
            title="No analysis history yet"
            description="Upload and analyze your first resume to start tracking your progress over time."
            action={<Button onClick={() => navigate('/upload')}>↑ Upload Resume</Button>}
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {analyses.map((a, idx) => (
            <Card key={a._id} hover style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                {/* Grade circle */}
                <GradeCircle score={a.overallScore} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h4 style={{ fontSize: '0.95rem', margin: 0 }}>
                      {a.resume?.originalName || 'Resume'}
                    </h4>
                    {idx === 0 && <Badge variant="primary">Latest</Badge>}
                    {a.overallScore === bestScore && analyses.length > 1 && <Badge variant="success">🏆 Best</Badge>}
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    {a.detectedJobTitle !== 'Not detected' && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        🎯 {a.detectedJobTitle}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      👤 {a.experienceLevel}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ⚡ {a.skillsFound?.length || 0} skills
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📅 {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Mini score bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {[
                      ['Formatting', a.scoreBreakdown?.formatting],
                      ['Keywords',   a.scoreBreakdown?.keywords],
                      ['Experience', a.scoreBreakdown?.experience],
                      ['Skills',     a.scoreBreakdown?.skills],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-primary)', fontWeight: 700 }}>{val ?? 0}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${val ?? 0}%`,
                            background: (val ?? 0) >= 70 ? 'var(--success)' : (val ?? 0) >= 50 ? 'var(--warning)' : 'var(--danger)',
                            borderRadius: 2, transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <Button size="sm" onClick={() => navigate(`/results/${a.resume?._id || a.resume}`)}>
                    View Report →
                  </Button>
                  {a.overallFeedback && (
                    <p style={{
                      fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200,
                      textAlign: 'right', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      "{a.overallFeedback.substring(0, 80)}…"
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Progress encouragement */}
      {analyses.length > 1 && (
        <Card style={{ marginTop: 24, textAlign: 'center', border: '1px solid var(--border)', background: 'transparent' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            🚀 You've run <strong style={{ color: 'var(--primary-light)' }}>{analyses.length} analyses</strong>.
            Keep iterating — each revision brings you closer to a perfect resume!
          </p>
        </Card>
      )}
    </div>
  );
}
