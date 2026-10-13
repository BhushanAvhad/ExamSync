import { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, CpuIcon, LayersIcon, SparklesIcon, CalendarIcon, ShieldCheckIcon } from '../ui/Icons';
import { TablePreview } from './TablePreview';

/**
 * ExamSync How It Works Section
 * 5-Step Process Pipeline + Live Interactive Table Preview:
 * 01 — Ingest Academic Assets
 * 02 — Configure Policy Constraints
 * 03 — Genetic Heuristic Solver
 * 04 — Conflict Audit & Refinement
 * 05 — Publish & Instant Sync
 */
export function HowItWorks() {
  const [activeStep, setActiveStep] = useState('03');

  const steps = [
    {
      num: '01',
      title: 'Ingest Academic Assets',
      short: 'Roster & Room Import',
      icon: <LayersIcon size={18} />,
      description:
        'Upload student course registrations, departmental subjects, venue capacities, and term dates via drag-and-drop CSV or direct administration.',
      details:
        'Supports high-speed batch CSV parsing with pre-flight schema verification, automatic roll-number indexing, and rollback safety.',
    },
    {
      num: '02',
      title: 'Configure Policy Constraints',
      short: 'Rule Calibration',
      icon: <ShieldCheckIcon size={18} />,
      description:
        'Establish hard parameters like zero student double-bookings and room capacity limits alongside soft preferences for gap intervals.',
      details:
        'Weights can be applied to consecutive-day testing limits, morning vs afternoon session preferences, and faculty supervisory caps.',
    },
    {
      num: '03',
      title: 'Run Genetic Heuristic Solver',
      short: 'Autonomous Optimization',
      icon: <CpuIcon size={18} />,
      description:
        'The genetic algorithm models combinations, evaluates fitness scores, and optimizes time-slot allocation in under 60 seconds.',
      details:
        'Performs multi-generation evolutionary search with mutation and crossover operators to converge on global zero-conflict solutions.',
    },
    {
      num: '04',
      title: 'Audit & Visual Tuning',
      short: 'Heatmaps & Inspection',
      icon: <SparklesIcon size={18} />,
      description:
        'Inspect conflict matrices, analyze venue occupancy percentages, and make targeted adjustments if special needs arise.',
      details:
        'Admins can fine-tune shift allocations with real-time constraint validation warning if a manual shift causes a clash.',
    },
    {
      num: '05',
      title: 'Publish & Instant Sync',
      short: 'Live Student Release',
      icon: <CalendarIcon size={18} />,
      description:
        'Release verified schedules directly to student portals, generate print-ready admit cards, and export master Excel sheets.',
      details:
        'Dispatches automated notification alerts to all enrolled students and provides one-click PDF admit card downloads.',
    },
  ];

  const currentStepData = steps.find((s) => s.num === activeStep) || steps[2];

  return (
    <section className="section-wrapper" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Intelligent Workflow</span>
          <h2 className="section-title">How ExamSync Works</h2>
          <p className="section-description">
            A systematic, 5-phase optimization workflow engineered to transform complex institutional requirements
            into dependable, conflict-free examination schedules.
          </p>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="process-timeline" role="tablist" aria-label="Workflow steps">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`process-step-card ${activeStep === step.num ? 'is-active-step' : ''}`}
              onClick={() => setActiveStep(step.num)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveStep(step.num);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="process-step-header">
                <span className="process-step-num">{step.num}</span>
                {idx < steps.length - 1 && (
                  <span className="process-arrow" aria-hidden="true">
                    <ArrowRightIcon size={14} />
                  </span>
                )}
              </div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Selected Step Deep Dive Card */}
        <div
          className="step-detail-card"
          style={{
            marginTop: 24,
            padding: '20px 24px',
            background: 'var(--surface-glass-card)',
            backdropFilter: 'var(--glass-blur-card)',
            WebkitBackdropFilter: 'var(--glass-blur-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-light)',
              }}
            >
              {currentStepData.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Phase {currentStepData.num} Deep Dive — {currentStepData.short}
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                {currentStepData.details}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
            <CheckCircleIcon size={16} />
            <span>Automated & Verified</span>
          </div>
        </div>

        {/* Live Output Demo */}
        <div style={{ marginTop: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span className="section-tag" style={{ color: 'var(--accent)' }}>Live System Output</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '6px 0 10px', color: 'var(--text-primary)' }}>
              Interactive Master Timetable Preview
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
              Experience the generated schedule below — filter by department, examine venue capacity balances, and inspect individual session details in real time.
            </p>
          </div>
          <TablePreview />
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
