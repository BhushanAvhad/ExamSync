import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import {
  SparklesIcon,
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  BuildingIcon
} from '../components/ui/Icons';

/**
 * ExamSync Design System Showcase (Section 25)
 * Visual reference guide for all centralized tokens, buttons, inputs, badges, cards, and tables.
 */
export function DesignSystemShowcase() {
  const [sampleInputVal, setSampleInputVal] = useState('Fall 2026 Mid-Semester');
  const [selectedDemoRow, setSelectedDemoRow] = useState('demo-2');

  const colorTokens = [
    { name: '--background', hex: '#080C18', role: 'Midnight Base' },
    { name: '--background-secondary', hex: '#0D1326', role: 'Elevated Canvas' },
    { name: '--surface', hex: '#12192F', role: 'Card / Panel' },
    { name: '--surface-glass', hex: 'rgba(18,25,47,0.65)', role: 'Glass Surfaces' },
    { name: '--primary', hex: '#6366F1', role: 'Brand Indigo' },
    { name: '--accent-violet', hex: '#8B5CF6', role: 'Vibrant Violet' },
    { name: '--accent', hex: '#38BDF8', role: 'Cyan / Sky' },
    { name: '--success', hex: '#10B981', role: 'Available / Passed' },
    { name: '--warning', hex: '#F59E0B', role: 'Pending Review' },
    { name: '--danger', hex: '#EF4444', role: 'Collision Alert' },
    { name: '--optimized', hex: '#A855F7', role: 'Algorithmic Optimal' },
    { name: '--border', hex: 'rgba(255,255,255,0.08)', role: 'Structure Lines' },
  ];

  const demoColumns = [
    { key: 'code', label: 'Unit Code' },
    { key: 'title', label: 'Course Unit' },
    { key: 'slot', label: 'Assigned Interval' },
    {
      key: 'status',
      label: 'Badge State',
      render: (val, row) => <Badge variant={val}>{row.statusLabel}</Badge>,
    },
  ];

  const demoData = [
    { id: 'demo-1', code: 'CS-401', title: 'Algorithmic Graph Theory', slot: '09:00 — 12:00', status: 'optimized', statusLabel: 'Optimized' },
    { id: 'demo-2', code: 'EE-205', title: 'Signals & Frequency Systems', slot: '13:00 — 16:00', status: 'scheduled', statusLabel: 'Scheduled' },
    { id: 'demo-3', code: 'MATH-302', title: 'Matrix Algebra & Decompositions', slot: '09:00 — 12:00', status: 'pending', statusLabel: 'Pending' },
    { id: 'demo-4', code: 'AI-420', title: 'Deep Reinforcement Learning', slot: '17:00 — 20:00', status: 'conflict', statusLabel: 'Conflict' },
  ];

  return (
    <div className="showcase-wrapper">
      <div className="container">
        {/* Showcase Header */}
        <div style={{ textAlign: 'left', marginBottom: 44 }}>
          <div className="hero-pill-tag" style={{ marginBottom: 12 }}>
            <SparklesIcon size={14} />
            <span>Design Specification Reference</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 10px' }}>
            ExamSync Design Tokens & Foundations
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 720, margin: 0 }}>
            Centralized design token documentation and reusable UI components constructed
            strictly to support future Admin, Student, and Scheduling matrix modules.
          </p>
        </div>

        {/* 1. Color Palette Tokens */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
            1. Color Tokens (Section 10)
          </h2>
          <div className="tokens-color-grid">
            {colorTokens.map((t) => (
              <div key={t.name} className="token-color-card">
                <div
                  className="token-swatch"
                  style={{
                    background: t.hex.startsWith('rgba') ? t.hex : t.hex,
                    borderBottom: '1px solid var(--border)',
                  }}
                />
                <div className="token-meta">
                  <span className="token-name">{t.name}</span>
                  <span className="token-hex">{t.hex}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Hierarchy */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            2. Typography Hierarchy (Section 9)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Hero Display — 800 Weight</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Algorithmic Timetable Optimization
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Section Heading — 700 Weight</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-Department Constraint Satisfier
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Body Text — Regular 400</span>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                ExamSync coordinates venues, student enrollments, invigilators, and academic calendars
                to guarantee collision-free timetables across all institutional departments.
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Monospace Code & Numbers</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--accent)' }}>
                MATH-201 // HALL-A // 2026-10-18T09:00:00Z // LOAD: 96.8%
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-light)' }} />
            3. Buttons & Interactive Controls (Section 18)
          </h2>
          <div className="component-demo-row">
            <Button variant="primary" size="md">
              Primary Action
            </Button>
            <Button variant="primary" size="md" icon={<SparklesIcon size={16} />}>
              With Icon
            </Button>
            <Button variant="secondary" size="md">
              Secondary Glass
            </Button>
            <Button variant="danger" size="md" icon={<AlertTriangleIcon size={16} />}>
              Danger Action
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large Hero
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled State
            </Button>
          </div>
        </section>

        {/* 4. Badges / Status */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            4. Reusable Badges & Status Indicators (Section 20)
          </h2>
          <div className="component-demo-row">
            <Badge variant="scheduled">Scheduled</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="conflict">Conflict</Badge>
            <Badge variant="optimized">Optimized</Badge>
            <Badge variant="available">Available</Badge>
            <Badge variant="unavailable">Unavailable</Badge>
            <Badge variant="completed">Completed</Badge>
          </div>
        </section>

        {/* 5. Inputs */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
            5. Form Inputs (Section 19)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, padding: 24, background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Input
              label="Standard Field"
              placeholder="e.g. Computer Science"
              value={sampleInputVal}
              onChange={(e) => setSampleInputVal(e.target.value)}
              helperText="Institutional curriculum code"
            />
            <Input
              label="With Prefix Icon"
              placeholder="Filter by date..."
              prefixIcon={<CalendarIcon size={16} />}
              value="2026-10-18"
              onChange={() => {}}
            />
            <Input
              label="Input with Error Validation"
              placeholder="Required identifier"
              value=""
              onChange={() => {}}
              error="Department code cannot be blank"
            />
          </div>
        </section>

        {/* 6. Card Hierarchy */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--optimized)' }} />
            6. Card Hierarchy (Section 7)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <Card variant="primary">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircleIcon size={18} style={{ color: 'var(--primary-light)' }} />
                <strong>Primary Card</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                Standard elevated surface container with subtle border and controlled depth shadow.
              </p>
            </Card>

            <Card variant="secondary">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ClockIcon size={18} style={{ color: 'var(--text-muted)' }} />
                <strong>Secondary Card</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                Background-secondary tone for secondary groupings, metadata blocks, and sub-items.
              </p>
            </Card>

            <Card variant="glass">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <SparklesIcon size={18} style={{ color: 'var(--accent)' }} />
                <strong>Glassmorphism Card</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                Translucent background with backdrop blur layer and soft ambient border.
              </p>
            </Card>

            <Card variant="info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BuildingIcon size={18} style={{ color: 'var(--info)' }} />
                <strong>Informational Card</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>
                Tinted informational surface for system announcements and constraint guidelines.
              </p>
            </Card>
          </div>
        </section>

        {/* 7. Glass Table */}
        <section className="showcase-section">
          <h2 className="showcase-section-title">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            7. Floating Glass Header Table (Section 6)
          </h2>
          <Table
            columns={demoColumns}
            data={demoData}
            selectedId={selectedDemoRow}
            onRowClick={(row) => setSelectedDemoRow(row.id)}
            stickyHeader={true}
          />
        </section>
      </div>
    </div>
  );
}

export default DesignSystemShowcase;
