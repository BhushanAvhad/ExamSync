import { useState } from 'react';
import {
  CalendarIcon,
  AlertTriangleIcon,
  CpuIcon,
  LayersIcon,
  CheckCircleIcon,
  PrinterIcon,
  BellIcon,
  BuildingIcon,
  FileTextIcon
} from '../ui/Icons';

/**
 * ExamSync Features Section
 * 6 High-Impact Institutional Capabilities:
 * 1. Heuristic Evolutionary Engine (Genetic Algorithm)
 * 2. Hard & Soft Clash Prevention (Zero Overlaps)
 * 3. Smart Venue & Seating Balancing (Capacity Guard)
 * 4. Print-Ready Hall Tickets & Passes (Official Passes)
 * 5. Bulk CSV & Spreadsheet Pipelines (RFC-4180 Format)
 * 6. Instant Publication Broadcasts (Real-Time Sync)
 */
export function Features() {
  const [filter, setFilter] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'engine', label: 'Genetic Engine' },
    { id: 'logistics', label: 'Campus Logistics' },
    { id: 'student', label: 'Student Portal' },
  ];

  const featureList = [
    {
      id: 'scheduling',
      category: 'engine',
      tag: 'Genetic Solver',
      title: 'Heuristic Evolutionary Engine',
      description:
        'Processes multi-cohort courses and shifts with an evolutionary genetic algorithm, evaluating thousands of permutations to find a mathematically optimal timetable.',
      icon: <CpuIcon size={22} />,
      metric: '< 60s Global Convergence',
    },
    {
      id: 'conflict',
      category: 'engine',
      tag: 'Zero Overlaps',
      title: 'Hard & Soft Clash Prevention',
      description:
        'Proactively eliminates student double-bookings, consecutive high-fatigue examinations, and instructor shift collisions before publication.',
      icon: <AlertTriangleIcon size={22} />,
      metric: '100% Conflict-Free Guarantee',
    },
    {
      id: 'venues',
      category: 'logistics',
      tag: 'Capacity Guard',
      title: 'Smart Venue & Seating Balancing',
      description:
        'Equitably distributes sittings across auditoriums, exam halls, and computer labs while strictly enforcing physical room capacities and accessibility rules.',
      icon: <BuildingIcon size={22} />,
      metric: 'Auditoriums & Labs Balanced',
    },
    {
      id: 'admit-cards',
      category: 'student',
      tag: 'Official Passes',
      title: 'Print-Ready Hall Tickets & Passes',
      description:
        'Generates institutional admit cards for students complete with roll numbers, assigned venues, exam dates, official guidelines, and barcode verification.',
      icon: <PrinterIcon size={22} />,
      metric: 'Standard PDF / Print Ready',
    },
    {
      id: 'data-pipeline',
      category: 'logistics',
      tag: 'RFC-4180 Format',
      title: 'Bulk CSV & Spreadsheet Pipelines',
      description:
        'Ingest thousands of student enrollments with instant drag-and-drop CSV validation, and export comprehensive university master timetables to Excel.',
      icon: <FileTextIcon size={22} />,
      metric: 'Instant Export & Ingest',
    },
    {
      id: 'notifications',
      category: 'student',
      tag: 'Real-Time Sync',
      title: 'Instant Publication Broadcasts',
      description:
        'Automatically delivers notifications to student portals the moment a new timetable is approved, ensuring no student misses their exam venue or schedule.',
      icon: <BellIcon size={22} />,
      metric: 'Push Sync to All Portals',
    },
  ];

  const displayedFeatures =
    filter === 'all'
      ? featureList
      : featureList.filter((f) => f.category === filter);

  return (
    <section className="section-wrapper" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Enterprise Architecture</span>
          <h2 className="section-title">Designed for High-Stakes Examination Logistics</h2>
          <p className="section-description">
            ExamSync replaces fragile manual processes with an automated,
            conflict-aware system engineered for modern educational institutions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="features-filter-row" role="tablist" aria-label="Feature categories">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`feature-filter-pill ${filter === tab.id ? 'active' : ''}`}
              onClick={() => setFilter(tab.id)}
              role="tab"
              aria-selected={filter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {displayedFeatures.map((item) => (
            <div key={item.id} className="feature-card">
              <div className="feature-card-top">
                <div className="feature-icon-box" aria-hidden="true">
                  {item.icon}
                </div>
                <span className="feature-tag-chip">{item.tag}</span>
              </div>
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-desc">{item.description}</p>
              <div className="feature-metric-badge">
                <CheckCircleIcon size={14} />
                <span>{item.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
