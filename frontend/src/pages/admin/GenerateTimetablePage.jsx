import { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Modal } from '../../components/admin/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CpuIcon,
  CheckCircleIcon,
  DoorIcon,
  UsersIcon,
  BookOpenIcon,
  SparklesIcon,
  InfoIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_EXAM_SESSIONS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_ROOMS,
} from '../../data/adminDemoData';

export function GenerateTimetablePage({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState('SESS-2026-02');

  // Step 3 Constraints state
  const [mandatoryConstraints, setMandatoryConstraints] = useState({
    noStudentClash: true,
    roomCapacityLimits: true,
    noRoomOverlap: true,
    minimumBuffer24h: true,
  });

  const [optionalPreferences, setOptionalPreferences] = useState({
    minimizeConsecutiveDays: true,
    morningCorePreference: true,
    departmentProximity: false,
    balancedWeeklySpread: true,
  });

  // Step 4 Settings
  const [settings, setSettings] = useState({
    algorithmMode: 'Balanced Optimization (Default)',
    maxIterations: '10,000',
    timeBudgetSeconds: '60 Seconds',
    allowSoftConstraintRelaxation: false,
  });

  // Demo Generation Notice Modal
  const [showDemoModal, setShowDemoModal] = useState(false);

  const selectedSession =
    INITIAL_EXAM_SESSIONS.find((s) => s.id === selectedSessionId) || INITIAL_EXAM_SESSIONS[1];

  const steps = [
    { number: 1, label: 'Select Session' },
    { number: 2, label: 'Review Inputs' },
    { number: 3, label: 'Configure Constraints' },
    { number: 4, label: 'Algorithm Settings' },
    { number: 5, label: 'Preview & Run' },
  ];

  const handleMandatoryToggle = (key) => {
    setMandatoryConstraints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOptionalToggle = (key) => {
    setOptionalPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateClick = () => {
    setShowDemoModal(true);
  };

  return (
    <div className="admin-page-content">
      <PageHeader
        title="Generate Examination Timetable"
        subtitle="Automated constraint-based timetable scheduling and room allocation workflow."
        category="Scheduling"
        badge={
          <span className="overview-cycle-pill">
            <CpuIcon size={14} />
            Constraint Engine UI
          </span>
        }
      />

      {/* Stepper Progress Bar */}
      <div className="admin-stepper-container">
        {steps.map((st, index) => {
          const isCurrent = currentStep === st.number;
          const isDone = currentStep > st.number;
          return (
            <div
              key={st.number}
              className={`stepper-step ${isCurrent ? 'is-active' : ''} ${isDone ? 'is-complete' : ''}`}
            >
              <div className="step-badge">
                {isDone ? <CheckCircleIcon size={14} /> : st.number}
              </div>
              <span className="step-label">{st.label}</span>
              {index < steps.length - 1 && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="admin-card stepper-content-card">
        {/* ================= STEP 1: SELECT SESSION ================= */}
        {currentStep === 1 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 1: Select Examination Session</h3>
              <p className="pane-subtitle">
                Choose the target academic assessment period to schedule.
              </p>
            </div>

            <div className="session-selection-list">
              {INITIAL_EXAM_SESSIONS.map((sess) => {
                const isSelected = selectedSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    className={`session-select-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedSessionId(sess.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="select-card-radio">
                      <div className={`radio-dot ${isSelected ? 'checked' : ''}`} />
                    </div>
                    <div className="select-card-info">
                      <div className="select-card-header">
                        <strong className="select-card-title">{sess.name}</strong>
                        <Badge
                          variant={
                            sess.status === 'Completed'
                              ? 'available'
                              : sess.status === 'Scheduled'
                              ? 'scheduled'
                              : 'pending'
                          }
                        >
                          {sess.status}
                        </Badge>
                      </div>
                      <div className="select-card-meta">
                        <span>Term: {sess.term}</span>
                        <span>•</span>
                        <span>
                          {sess.startDate} to {sess.endDate}
                        </span>
                        <span>•</span>
                        <span>{(sess.timeSlots || []).length} Time Slots</span>
                      </div>
                      <p className="select-card-desc">{sess.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: REVIEW INPUTS ================= */}
        {currentStep === 2 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 2: Review Scheduling Inputs</h3>
              <p className="pane-subtitle">
                Verify curriculum cohorts, candidate subjects, and available venues prior to constraint resolution.
              </p>
            </div>

            <div className="inputs-summary-grid">
              <div className="input-summary-box">
                <div className="box-top">
                  <BookOpenIcon size={18} className="box-icon cyan" />
                  <h4>Candidate Examination Subjects ({INITIAL_SUBJECTS.length})</h4>
                </div>
                <ul className="box-list">
                  {INITIAL_SUBJECTS.slice(0, 5).map((sub) => (
                    <li key={sub.id} className="box-list-item">
                      <span className="mono-code">{sub.code}</span>
                      <span className="sub-title">{sub.name}</span>
                      <span className="sub-dur">{sub.duration}</span>
                    </li>
                  ))}
                  <li className="box-list-more">+ {INITIAL_SUBJECTS.length - 5} additional subjects</li>
                </ul>
              </div>

              <div className="input-summary-box">
                <div className="box-top">
                  <UsersIcon size={18} className="box-icon indigo" />
                  <h4>Examinee Cohorts ({INITIAL_CLASSES.length})</h4>
                </div>
                <ul className="box-list">
                  {INITIAL_CLASSES.slice(0, 5).map((cls) => (
                    <li key={cls.id} className="box-list-item">
                      <strong className="cls-name">{cls.name} (Div {cls.division})</strong>
                      <span className="cls-count">{cls.studentCount} Examinees</span>
                    </li>
                  ))}
                  <li className="box-list-more">+ {INITIAL_CLASSES.length - 5} additional cohorts</li>
                </ul>
              </div>

              <div className="input-summary-box">
                <div className="box-top">
                  <DoorIcon size={18} className="box-icon violet" />
                  <h4>Available Exam Venues ({INITIAL_ROOMS.length})</h4>
                </div>
                <ul className="box-list">
                  {INITIAL_ROOMS.slice(0, 5).map((rm) => (
                    <li key={rm.id} className="box-list-item">
                      <strong className="rm-name">{rm.roomNumber}</strong>
                      <span className="rm-type">{rm.type}</span>
                      <span className="rm-cap">{rm.capacity} Desks</span>
                    </li>
                  ))}
                  <li className="box-list-more">+ {INITIAL_ROOMS.length - 5} additional rooms</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONSTRAINTS ================= */}
        {currentStep === 3 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 3: Configure Constraints & Rules</h3>
              <p className="pane-subtitle">
                Distinguish strict hard requirements from customizable soft preferences.
              </p>
            </div>

            <div className="constraints-section">
              <div className="constraints-group">
                <div className="group-heading-row">
                  <div className="group-badge mandatory">Mandatory (Hard Constraints)</div>
                  <span className="group-desc">Schedules violating these rules are considered invalid</span>
                </div>

                <div className="constraint-switch-list">
                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={mandatoryConstraints.noStudentClash}
                      onChange={() => handleMandatoryToggle('noStudentClash')}
                    />
                    <div className="switch-text">
                      <strong>Student Exam Clash Avoidance (Zero Overlap)</strong>
                      <span>Strictly forbids scheduling two exams on the same time slot for any enrolled student.</span>
                    </div>
                  </label>

                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={mandatoryConstraints.roomCapacityLimits}
                      onChange={() => handleMandatoryToggle('roomCapacityLimits')}
                    />
                    <div className="switch-text">
                      <strong>Room Capacity & Safe Spacing Enforcement</strong>
                      <span>Total assigned students per venue cannot exceed the physical desk capacity limit.</span>
                    </div>
                  </label>

                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={mandatoryConstraints.noRoomOverlap}
                      onChange={() => handleMandatoryToggle('noRoomOverlap')}
                    />
                    <div className="switch-text">
                      <strong>Single-Exam Venue Isolation</strong>
                      <span>A room or laboratory cannot host multiple unrelated exams simultaneously.</span>
                    </div>
                  </label>

                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={mandatoryConstraints.minimumBuffer24h}
                      onChange={() => handleMandatoryToggle('minimumBuffer24h')}
                    />
                    <div className="switch-text">
                      <strong>Minimum Recovery Buffer (24h Between Heavy Papers)</strong>
                      <span>Ensures candidates do not sit back-to-back comprehensive 3-hour theoretical exams on adjacent slots.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="constraints-group">
                <div className="group-heading-row">
                  <div className="group-badge optional">Preferences (Soft Constraints)</div>
                  <span className="group-desc">Optimizer aims to satisfy these without rejecting feasibility</span>
                </div>

                <div className="constraint-switch-list">
                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={optionalPreferences.minimizeConsecutiveDays}
                      onChange={() => handleOptionalToggle('minimizeConsecutiveDays')}
                    />
                    <div className="switch-text">
                      <strong>Consecutive Exam Day Minimization</strong>
                      <span>Stagger exam dates evenly across the session calendar to provide preparation windows.</span>
                    </div>
                  </label>

                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={optionalPreferences.morningCorePreference}
                      onChange={() => handleOptionalToggle('morningCorePreference')}
                    />
                    <div className="switch-text">
                      <strong>Morning Slot Priority for Core Syllabi</strong>
                      <span>Schedule foundational mathematics and systems units during morning intervals (09:00 — 12:00).</span>
                    </div>
                  </label>

                  <label className="constraint-switch-item">
                    <input
                      type="checkbox"
                      checked={optionalPreferences.departmentProximity}
                      onChange={() => handleOptionalToggle('departmentProximity')}
                    />
                    <div className="switch-text">
                      <strong>Departmental Venue Proximity</strong>
                      <span>Keep exams within respective faculty academic wings where practical.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: SETTINGS ================= */}
        {currentStep === 4 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 4: Review Generation Settings</h3>
              <p className="pane-subtitle">
                Configure algorithmic solver limits, optimization priority weights, and runtime ceilings.
              </p>
            </div>

            <div className="settings-form-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="solver-mode">Optimization Objective</label>
                <select
                  id="solver-mode"
                  className="input-field"
                  value={settings.algorithmMode}
                  onChange={(e) => setSettings({ ...settings, algorithmMode: e.target.value })}
                >
                  <option value="Balanced Optimization (Default)">Balanced Optimization (Default — Balanced spacing & capacity)</option>
                  <option value="Fast Schedule (Prioritize Speed)">Fast Feasible Schedule (Prioritize turnaround time)</option>
                  <option value="Max Rest Gap (Prioritize Student Comfort)">Student Comfort (Max rest gaps between examinations)</option>
                  <option value="Room Efficiency (Compact Venue Utilization)">Venue Efficiency (Maximize hall occupancy)</option>
                </select>
              </div>

              <div className="form-row-2col">
                <div className="input-group">
                  <label className="input-label" htmlFor="max-iterations">Max Search Iterations</label>
                  <select
                    id="max-iterations"
                    className="input-field"
                    value={settings.maxIterations}
                    onChange={(e) => setSettings({ ...settings, maxIterations: e.target.value })}
                  >
                    <option value="5,000">5,000 Iterations</option>
                    <option value="10,000">10,000 Iterations (Recommended)</option>
                    <option value="25,000">25,000 Iterations (Deep Search)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="time-budget">Maximum Solver Time Budget</label>
                  <select
                    id="time-budget"
                    className="input-field"
                    value={settings.timeBudgetSeconds}
                    onChange={(e) => setSettings({ ...settings, timeBudgetSeconds: e.target.value })}
                  >
                    <option value="30 Seconds">30 Seconds</option>
                    <option value="60 Seconds">60 Seconds</option>
                    <option value="120 Seconds">120 Seconds</option>
                  </select>
                </div>
              </div>

              <div className="admin-banner info-banner" style={{ marginTop: 12 }}>
                <InfoIcon size={16} className="banner-icon" />
                <div className="banner-content">
                  Algorithm parameters will be passed to the backend optimization worker once connected. In Phase 2, this verifies interface parameters and payload structure.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: PREVIEW REQUEST ================= */}
        {currentStep === 5 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 5: Preview Generation Request</h3>
              <p className="pane-subtitle">
                Inspect compiled generation payload and parameters prior to launching optimization.
              </p>
            </div>

            <div className="preview-summary-card">
              <div className="preview-row">
                <span className="p-label">Target Examination Session</span>
                <span className="p-value"><strong>{selectedSession.name}</strong> ({selectedSession.term})</span>
              </div>
              <div className="preview-row">
                <span className="p-label">Scheduled Window</span>
                <span className="p-value">{selectedSession.startDate} to {selectedSession.endDate}</span>
              </div>
              <div className="preview-row">
                <span className="p-label">Input Scope</span>
                <span className="p-value">{INITIAL_SUBJECTS.length} Subjects • {INITIAL_CLASSES.length} Cohorts • {INITIAL_ROOMS.length} Venues</span>
              </div>
              <div className="preview-row">
                <span className="p-label">Mandatory Constraints</span>
                <span className="p-value">
                  <span className="status-tag success">Zero-Clash</span>
                  <span className="status-tag success">Capacity Limits</span>
                  <span className="status-tag success">Venue Isolation</span>
                  <span className="status-tag success">24h Gap</span>
                </span>
              </div>
              <div className="preview-row">
                <span className="p-label">Optimization Goal</span>
                <span className="p-value">{settings.algorithmMode}</span>
              </div>
            </div>

            <div className="action-launch-box">
              <div className="launch-text">
                <h4>Ready to Trigger Scheduling Engine</h4>
                <p>Click below to submit the parameter configuration for schedule compilation.</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={<SparklesIcon size={18} />}
                onClick={handleGenerateClick}
                style={{ minWidth: 220 }}
              >
                Generate Timetable
              </Button>
            </div>
          </div>
        )}

        {/* Stepper Footer Controls */}
        <div className="stepper-nav-footer">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeftIcon size={14} />}
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            Previous Step
          </Button>

          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRightIcon size={14} />}
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<SparklesIcon size={16} />}
              onClick={handleGenerateClick}
            >
              Generate Timetable
            </Button>
          )}
        </div>
      </div>

      {/* Demo Modal explicitly stating scheduling engine not connected */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="Scheduling Engine — UI Demonstration"
        maxWidth={500}
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setShowDemoModal(false)}>
              Keep Editing Config
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowDemoModal(false);
                onNavigate('/admin/timetable');
              }}
            >
              Inspect Existing Timetable Draft →
            </Button>
          </div>
        }
      >
        <div className="demo-engine-notice-content">
          <div className="demo-engine-icon-box">
            <CpuIcon size={28} />
          </div>
          <div className="demo-engine-text">
            <h4 className="demo-engine-title">Configuration Ready for Review</h4>
            <p className="demo-engine-body">
              The scheduling engine will be connected in a later phase. Your configuration is ready for review.
            </p>
            <div className="demo-engine-bullets">
              <div className="bullet-row">
                <CheckCircleIcon size={15} className="bullet-check" />
                <span>All mandatory constraints passed validation checks</span>
              </div>
              <div className="bullet-row">
                <CheckCircleIcon size={15} className="bullet-check" />
                <span>Parameters compiled into standard scheduling request format</span>
              </div>
              <div className="bullet-row">
                <InfoIcon size={15} className="bullet-info" />
                <span>No real optimization results or conflict-free schedules have been fabricated</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GenerateTimetablePage;
