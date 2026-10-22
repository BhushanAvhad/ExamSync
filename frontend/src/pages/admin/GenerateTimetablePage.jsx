import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ClockIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_EXAM_SESSIONS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_ROOMS,
  INITIAL_ASSIGNMENTS,
} from '../../data/adminDemoData';
import { sessionsService } from '../../services/sessionsService';
import { academicsService } from '../../services/academicsService';
import { roomsService } from '../../services/roomsService';
import { generatorService } from '../../services/generatorService';
import { inferSubjectYear, inferSubjectDept, cleanSubjectCode } from '../../utils/academicStructure';

export function GenerateTimetablePage({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_EXAM_SESSIONS;
  });
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return 'SESS-2026-02';
  });
  const [subjects, setSubjects] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_subjects');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SUBJECTS;
  });
  const [classes, setClasses] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_classes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CLASSES;
  });
  const [rooms, setRooms] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_rooms');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ROOMS;
  });

  // Step 2: Curriculum & Labs Selection
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_subjects');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set(parsed.map((s) => cleanSubjectCode(s.code)));
        }
      }
    } catch (e) {}
    return new Set(INITIAL_SUBJECTS.map((s) => cleanSubjectCode(s.code)));
  });
  const [curriculumTypeFilter, setCurriculumTypeFilter] = useState('all'); // 'all' | 'theory' | 'lab'
  const [curriculumYearFilter, setCurriculumYearFilter] = useState('all'); // 'all' | 'FE' | 'SE' | 'TE' | 'BE'
  const [curriculumSearch, setCurriculumSearch] = useState('');

  // Generation execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Load live data from Supabase & localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const [sessRes, subRes, clsRes, rmRes] = await Promise.all([
          sessionsService.getExamSessions(),
          academicsService.getSubjects(),
          academicsService.getClasses(),
          roomsService.getRooms(),
        ]);
        if (sessRes.data && sessRes.data.length > 0) {
          setSessions(sessRes.data);
          setSelectedSessionId((prev) => {
            const exists = sessRes.data.some((s) => s.id === prev);
            return exists ? prev : sessRes.data[0].id;
          });
        }
        if (subRes.data && subRes.data.length > 0) {
          setSubjects(subRes.data);
          setSelectedSubjectCodes((prev) => {
            const next = new Set(prev);
            subRes.data.forEach((s) => next.add(cleanSubjectCode(s.code)));
            return next;
          });
        }
        if (clsRes.data) setClasses(clsRes.data);
        if (rmRes.data) setRooms(rmRes.data);
      } catch (err) {
        console.error('Failed to load scheduling wizard data:', err);
      }
    }
    loadData();

    const handleSyncUpdate = () => loadData();
    window.addEventListener('examsync_sessions_updated', handleSyncUpdate);
    window.addEventListener('examsync_classes_updated', handleSyncUpdate);
    window.addEventListener('examsync_subjects_updated', handleSyncUpdate);
    window.addEventListener('examsync_students_updated', handleSyncUpdate);
    window.addEventListener('examsync_rooms_updated', handleSyncUpdate);
    return () => {
      window.removeEventListener('examsync_sessions_updated', handleSyncUpdate);
      window.removeEventListener('examsync_classes_updated', handleSyncUpdate);
      window.removeEventListener('examsync_subjects_updated', handleSyncUpdate);
      window.removeEventListener('examsync_students_updated', handleSyncUpdate);
      window.removeEventListener('examsync_rooms_updated', handleSyncUpdate);
    };
  }, []);

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

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || INITIAL_EXAM_SESSIONS[1];

  const steps = [
    { number: 1, label: 'Select Session' },
    { number: 2, label: 'Curriculum & Labs' },
    { number: 3, label: 'Configure Constraints' },
    { number: 4, label: 'Algorithm Settings' },
    { number: 5, label: 'Preview & Run' },
  ];

  const handleToggleSubject = (code) => {
    setSelectedSubjectCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleSelectCurriculumPreset = (preset) => {
    setSelectedSubjectCodes((prev) => {
      const next = new Set(prev);
      if (preset === 'all') {
        subjects.forEach((s) => next.add(s.code));
      } else if (preset === 'theory') {
        subjects.forEach((s) => {
          const isLab = s.type === 'Lab' || /-L\d+/i.test(s.code);
          if (!isLab) next.add(s.code);
          else next.delete(s.code);
        });
      } else if (preset === 'lab') {
        subjects.forEach((s) => {
          const isLab = s.type === 'Lab' || /-L\d+/i.test(s.code);
          if (isLab) next.add(s.code);
          else next.delete(s.code);
        });
      } else if (preset === 'clear') {
        next.clear();
      }
      return next;
    });
  };

  const filteredCurriculum = useMemo(() => {
    return subjects.filter((s) => {
      const isLab = s.type === 'Lab' || /-L\d+/i.test(s.code);
      if (curriculumTypeFilter === 'theory' && isLab) return false;
      if (curriculumTypeFilter === 'lab' && !isLab) return false;

      if (curriculumYearFilter !== 'all') {
        const itemYear = s.year || inferSubjectYear(s);
        if (itemYear !== curriculumYearFilter) return false;
      }

      if (curriculumSearch) {
        const q = curriculumSearch.toLowerCase().trim();
        const codeMatch = (s.code || '').toLowerCase().includes(q);
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const deptMatch = (s.department || inferSubjectDept(s) || '').toLowerCase().includes(q);
        if (!codeMatch && !nameMatch && !deptMatch) return false;
      }

      return true;
    });
  }, [subjects, curriculumTypeFilter, curriculumYearFilter, curriculumSearch]);

  const curriculumStats = useMemo(() => {
    let theoryCount = 0;
    let labCount = 0;
    const yearCounts = { FE: 0, SE: 0, TE: 0, BE: 0 };

    subjects.forEach((s) => {
      if (selectedSubjectCodes.has(s.code)) {
        const isLab = s.type === 'Lab' || /-L\d+/i.test(s.code);
        if (isLab) labCount++;
        else theoryCount++;

        const yr = s.year || inferSubjectYear(s);
        if (yr && yearCounts[yr] !== undefined) {
          yearCounts[yr]++;
        }
      }
    });

    return {
      totalSelected: selectedSubjectCodes.size,
      totalAvailable: subjects.length,
      theoryCount,
      labCount,
      yearCounts,
    };
  }, [subjects, selectedSubjectCodes]);

  const handleMandatoryToggle = (key) => {
    setMandatoryConstraints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOptionalToggle = (key) => {
    setOptionalPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateClick = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setGenerationResult(null);

      // Prepare active selected subjects & dynamic assignments based on user's curriculum selection
      const asgnRes = await academicsService.getAssignments();
      const currentAssignments = asgnRes.data && asgnRes.data.length > 0 ? asgnRes.data : INITIAL_ASSIGNMENTS;
      const activeSubjects = subjects.filter((s) => selectedSubjectCodes.has(cleanSubjectCode(s.code)));
      const activeAssignments = currentAssignments.map((a) => ({
        ...a,
        subjectCodes: (a.subjectCodes || []).map(cleanSubjectCode).filter((c) => selectedSubjectCodes.has(c)),
      })).filter((a) => a.subjectCodes.length > 0);

      const maxGens = settings.algorithmMode.includes('Fast') ? 80 : 140;
      const response = await generatorService.generate({
        sessionId: selectedSessionId,
        settings: {
          maxGenerations: maxGens,
          populationSize: 60,
          mutationRate: 0.18,
        },
        saveAsDraft: true,
        institutionalData: {
          subjects: activeSubjects,
          assignments: activeAssignments,
          classes,
          rooms,
          sessions,
        },
      });

      if (response.ok && response.data.success) {
        setGenerationResult(response.data);

        if (Array.isArray(response.data.timetable) && response.data.timetable.length > 0) {
          const mapped = response.data.timetable.map((t, idx) => {
            const cleanClass = (t.className || 'FE').replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '').trim();
            const yearMatch = cleanClass.match(/^(FE|SE|TE|BE)\b/i);
            const year = yearMatch ? yearMatch[1].toUpperCase() : 'General';
            const deptPart = cleanClass.replace(/^(FE|SE|TE|BE)\b/i, '').trim();
            const department = deptPart || (year === 'FE' ? 'Applied Sciences' : 'General');

            return {
              id: t.eventId || `TT-GEN-${idx + 1}`,
              date: t.date,
              timeSlot: `${t.startTime} — ${t.endTime}`,
              subjectCode: cleanSubjectCode(t.subjectCode) || '—',
              subjectName: t.subjectName || '—',
              year,
              department,
              className: cleanClass,
              room: t.roomNumber || 'TBD',
              duration: t.durationMinutes ? `${(t.durationMinutes / 60).toFixed(1)} Hours` : '3.0 Hours',
              status: 'Scheduled',
              isPublished: true,
            };
          });

          const sessionKey = selectedSessionId || 'default';
          try {
            localStorage.setItem(`examsync_timetable_data_${sessionKey}`, JSON.stringify(mapped));
            localStorage.setItem('examsync_timetable_data', JSON.stringify(mapped));
            localStorage.setItem(`examsync_session_published_${sessionKey}`, JSON.stringify({
              isPublished: true,
              timestamp: new Date().toISOString(),
            }));
            localStorage.setItem('examsync_session_published_active', JSON.stringify({
              sessionId: selectedSessionId,
              isPublished: true,
            }));
            localStorage.setItem('examsync_active_timetable_published', JSON.stringify({
              sessionId: selectedSessionId,
              isPublished: true,
            }));
          } catch (e) {
            console.error('Failed to save generated timetable to storage:', e);
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('examsync_timetable_updated', {
              detail: { timetable: mapped, sessionId: selectedSessionId },
            }));
            window.dispatchEvent(new CustomEvent('examsync_timetable_published', {
              detail: { sessionId: selectedSessionId, isPublished: true, timestamp: Date.now() },
            }));
          }
        }
      } else {
        setGenerationError(response.data?.error || 'No feasible zero-conflict schedule found within search limits.');
        setGenerationResult(response.data);
      }
      setShowResultModal(true);
    } catch (err) {
      console.error('Generation request failed:', err);
      setGenerationError(`Engine connection failure: ${err.message}. Ensure the Express backend is running on port 5000.`);
      setShowResultModal(true);
    } finally {
      setIsGenerating(false);
    }
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
              {sessions.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>No exam sessions found. Create a session in the Exam Sessions page first.</p>
                  {onNavigate && (
                    <Button variant="outline" style={{ marginTop: '0.75rem' }} onClick={() => onNavigate('sessions')}>
                      Go to Exam Sessions
                    </Button>
                  )}
                </div>
              ) : (
                sessions.map((sess) => {
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
                        {sess.description && <p className="select-card-desc">{sess.description}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 2: CURRICULUM & LABS ================= */}
        {currentStep === 2 && (
          <div className="stepper-pane">
            <div className="pane-header">
              <h3 className="pane-title">Step 2: Select Examination Subjects & Practical Labs</h3>
              <p className="pane-subtitle">
                Select courses and laboratory practicals to schedule for each academic year based on the VIT Wadala catalogue.
              </p>
            </div>

            <div className="curriculum-selector-container">
              {/* Stat & Presets Banner */}
              <div className="curriculum-stat-banner">
                <div className="curriculum-stat-pills">
                  <span className="curriculum-stat-pill active">
                    <strong>{curriculumStats.totalSelected} / {curriculumStats.totalAvailable}</strong> Exams Selected
                  </span>
                  <span className="curriculum-stat-pill">
                    📘 {curriculumStats.theoryCount} Theory
                  </span>
                  <span className="curriculum-stat-pill">
                    🔬 {curriculumStats.labCount} Labs
                  </span>
                  <span className="curriculum-stat-pill">
                    FE: {curriculumStats.yearCounts.FE}
                  </span>
                  <span className="curriculum-stat-pill">
                    SE: {curriculumStats.yearCounts.SE}
                  </span>
                  <span className="curriculum-stat-pill">
                    TE: {curriculumStats.yearCounts.TE}
                  </span>
                  <span className="curriculum-stat-pill">
                    BE: {curriculumStats.yearCounts.BE}
                  </span>
                </div>

                <div className="curriculum-preset-actions">
                  <button
                    type="button"
                    className="curriculum-preset-btn"
                    onClick={() => handleSelectCurriculumPreset('all')}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="curriculum-preset-btn"
                    onClick={() => handleSelectCurriculumPreset('theory')}
                  >
                    Theory Only
                  </button>
                  <button
                    type="button"
                    className="curriculum-preset-btn"
                    onClick={() => handleSelectCurriculumPreset('lab')}
                  >
                    Labs Only
                  </button>
                  <button
                    type="button"
                    className="curriculum-preset-btn"
                    onClick={() => handleSelectCurriculumPreset('clear')}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="curriculum-filter-toolbar">
                <div className="curriculum-filter-group">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Type:</span>
                  {['all', 'theory', 'lab'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`curriculum-pill-btn ${curriculumTypeFilter === t ? 'is-active' : ''}`}
                      onClick={() => setCurriculumTypeFilter(t)}
                    >
                      {t === 'all' ? 'All Types' : t === 'theory' ? 'Theory Only' : 'Labs Only'}
                    </button>
                  ))}
                </div>

                <div className="curriculum-filter-group">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
                  {['all', 'FE', 'SE', 'TE', 'BE'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`curriculum-pill-btn ${curriculumYearFilter === yr ? 'is-active' : ''}`}
                      onClick={() => setCurriculumYearFilter(yr)}
                    >
                      {yr === 'all' ? 'All Years' : yr}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="curriculum-search-input"
                  placeholder="Filter subjects or code..."
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                />
              </div>

              {/* Curriculum Selection Table */}
              <div className="curriculum-table-wrapper">
                <table className="curriculum-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={
                            filteredCurriculum.length > 0 &&
                            filteredCurriculum.every((s) => selectedSubjectCodes.has(s.code))
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedSubjectCodes((prev) => {
                              const next = new Set(prev);
                              filteredCurriculum.forEach((s) => {
                                if (checked) next.add(s.code);
                                else next.delete(s.code);
                              });
                              return next;
                            });
                          }}
                        />
                      </th>
                      <th style={{ width: '160px' }}>Course Code</th>
                      <th>Course / Subject Title</th>
                      <th style={{ width: '120px' }}>Type</th>
                      <th style={{ width: '150px' }}>Cohort / Dept</th>
                      <th style={{ width: '100px' }}>Duration</th>
                      <th style={{ width: '160px' }}>Target Venue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCurriculum.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                          No subjects match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCurriculum.map((sub) => {
                        const isSelected = selectedSubjectCodes.has(sub.code);
                        const isLab = sub.type === 'Lab' || /-L\d+/i.test(sub.code);
                        return (
                          <tr
                            key={sub.id || sub.code}
                            className={isSelected ? 'is-selected' : ''}
                            onClick={() => handleToggleSubject(sub.code)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSubject(sub.code)}
                              />
                            </td>
                            <td>
                              <span className="mono-code">{cleanSubjectCode(sub.code)}</span>
                            </td>
                            <td>
                              <strong>{sub.name}</strong>
                            </td>
                            <td>
                              <span className={`curriculum-type-tag ${isLab ? 'lab' : 'theory'}`}>
                                {isLab ? 'Lab / Practical' : 'Theory / Course'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {sub.year || inferSubjectYear(sub)} • {sub.department || inferSubjectDept(sub)}
                              </span>
                            </td>
                            <td>{sub.duration || (isLab ? '2.0 Hours' : '3.0 Hours')}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {isLab ? 'Computing / Hardware Lab' : 'Lecture Hall / Classroom'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cohorts & Venues Context Footnote */}
              <div className="curriculum-summary-foot">
                <div className="input-summary-box">
                  <div className="box-top">
                    <UsersIcon size={16} className="box-icon indigo" />
                    <h4>Academic Cohorts ({classes.length} Enrolled)</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Examinees will be automatically scheduled across active department cohorts (FE, SE, TE, BE).
                  </p>
                </div>

                <div className="input-summary-box">
                  <div className="box-top">
                    <DoorIcon size={16} className="box-icon violet" />
                    <h4>Available Venues ({rooms.length} Exam Venues)</h4>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Theory papers mapped to Lecture Halls & Classrooms; Practicals mapped to Computing & Electronics Labs.
                  </p>
                </div>
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
                <span className="p-value">{subjects.length} Subjects • {classes.length} Cohorts • {rooms.length} Venues</span>
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
                disabled={isGenerating}
                onClick={handleGenerateClick}
                style={{ minWidth: 240 }}
              >
                {isGenerating ? 'Running Genetic Optimization...' : 'Generate Timetable'}
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
            disabled={currentStep === 1 || isGenerating}
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
              disabled={isGenerating}
              onClick={handleGenerateClick}
            >
              {isGenerating ? 'Optimizing...' : 'Generate Timetable'}
            </Button>
          )}
        </div>
      </div>

      {/* Real Genetic Algorithm Execution & Validation Results Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={generationResult?.success ? 'Genetic Algorithm Optimization — Feasible' : 'Scheduling Engine Diagnostics'}
        maxWidth={620}
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setShowResultModal(false)}>
              Keep Editing Config
            </Button>
            {generationResult?.success && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowResultModal(false);
                  onNavigate('/admin/timetable');
                }}
              >
                Inspect Saved Timetable Draft →
              </Button>
            )}
          </div>
        }
      >
        <div className="demo-engine-notice-content">
          <div className={`demo-engine-icon-box ${generationResult?.success ? 'is-success' : 'is-error'}`}>
            <CpuIcon size={28} />
          </div>
          <div className="demo-engine-text" style={{ width: '100%' }}>
            <h4 className="demo-engine-title">
              {generationResult?.success
                ? 'Optimal Feasible Schedule Generated'
                : 'Scheduling Infeasible with Current Constraints'}
            </h4>
            <p className="demo-engine-body">
              {generationResult?.success
                ? 'The Genetic Algorithm completed constraint-satisfaction optimization and verified 0 hard conflicts. The draft has been saved to your database.'
                : generationError || 'The algorithm could not eliminate all hard constraint collisions within the configured search limits.'}
            </p>

            {/* Metrics Grid */}
            {generationResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '16px 0' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-surface-2, rgba(255,255,255,0.05))', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Generations</div>
                  <strong style={{ fontSize: 16 }}>{generationResult.generationCount || 0}</strong>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-surface-2, rgba(255,255,255,0.05))', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Runtime</div>
                  <strong style={{ fontSize: 16 }}>{generationResult.elapsedMs || 0} ms</strong>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-surface-2, rgba(255,255,255,0.05))', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hard Collisions</div>
                  <strong style={{ fontSize: 16, color: generationResult.hardViolationsCount === 0 ? 'var(--color-success, #10b981)' : 'var(--color-danger, #ef4444)' }}>
                    {generationResult.hardViolationsCount ?? 0}
                  </strong>
                </div>
              </div>
            )}

            {/* Validation Metrics */}
            {generationResult?.validationReport?.metrics && (
              <div className="demo-engine-bullets" style={{ marginTop: 12 }}>
                <div className="bullet-row">
                  <CheckCircleIcon size={15} className="bullet-check" />
                  <span>Total Scheduled: {generationResult.validationReport.metrics.totalExamsScheduled} exams</span>
                </div>
                <div className="bullet-row">
                  <CheckCircleIcon size={15} className="bullet-check" />
                  <span>Window Used: {generationResult.validationReport.metrics.examinationDaysUsed} examination days</span>
                </div>
                <div className="bullet-row">
                  <CheckCircleIcon size={15} className="bullet-check" />
                  <span>Venues Assigned: {generationResult.validationReport.metrics.venuesAssigned} examination rooms</span>
                </div>
                <div className="bullet-row">
                  <InfoIcon size={15} className="bullet-info" />
                  <span>Average Room Utilization: {generationResult.validationReport.metrics.averageRoomUtilizationPercent}%</span>
                </div>
              </div>
            )}

            {/* Violations List if Infeasible */}
            {generationResult?.validationReport?.violations?.length > 0 && (
              <div style={{ marginTop: 14, padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>
                  Detected Bottlenecks ({generationResult.validationReport.violations.length}):
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-muted)' }}>
                  {generationResult.validationReport.violations.slice(0, 4).map((v, i) => (
                    <li key={i}>{v.description}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GenerateTimetablePage;
