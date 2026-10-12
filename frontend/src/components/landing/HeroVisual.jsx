import { SparklesIcon, CpuIcon, LayersIcon } from '../ui/Icons';

/**
 * ExamSync Hero Visual (Section 4 - Revised)
 * An abstract conceptual visual representing:
 * - scheduling
 * - organization
 * - optimization
 * - connected data
 * - intelligent decision making
 * Strictly NO fake dashboards, fake timetables, or fake application UI.
 */
export function HeroVisual() {
  return (
    <div className="hero-abstract-container">
      {/* Background ambient lighting for the visual */}
      <div className="hero-abstract-glow" />

      {/* Abstract Connected Scheduling Matrix Canvas */}
      <div className="hero-abstract-canvas">
        {/* SVG Interconnecting Vector Paths */}
        <svg
          className="hero-vector-network"
          viewBox="0 0 900 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="netGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="netGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connection Lines from Nodes to Central Solver */}
          <path
            d="M 180 140 C 300 140, 340 240, 450 240"
            stroke="url(#netGrad1)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="vector-dash-pulse"
          />
          <path
            d="M 180 340 C 300 340, 350 240, 450 240"
            stroke="url(#netGrad1)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d="M 450 240 C 560 240, 600 140, 720 140"
            stroke="url(#netGrad2)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="vector-dash-pulse"
          />
          <path
            d="M 450 240 C 560 240, 600 340, 720 340"
            stroke="url(#netGrad2)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* Orbital Flow Rings */}
          <circle cx="450" cy="240" r="80" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
          <circle cx="450" cy="240" r="130" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="450" cy="240" r="60" fill="url(#nodeGlow)" />
        </svg>

        {/* Floating Abstract Node 1: Academic Constraints */}
        <div className="abstract-card abstract-node-top-left">
          <div className="abstract-node-header">
            <span className="abstract-node-indicator blue" />
            <span className="abstract-node-title">Cohort Constraints</span>
          </div>
          <div className="abstract-node-bars">
            <div className="abstract-bar" style={{ width: '85%' }} />
            <div className="abstract-bar" style={{ width: '60%' }} />
          </div>
          <div className="abstract-node-meta">Non-Overlapping Sets</div>
        </div>

        {/* Floating Abstract Node 2: Temporal Windows */}
        <div className="abstract-card abstract-node-bottom-left">
          <div className="abstract-node-header">
            <span className="abstract-node-indicator violet" />
            <span className="abstract-node-title">Temporal Intervals</span>
          </div>
          <div className="abstract-geometric-slots">
            <span className="abstract-slot-pill active" />
            <span className="abstract-slot-pill" />
            <span className="abstract-slot-pill active" />
            <span className="abstract-slot-pill" />
          </div>
          <div className="abstract-node-meta">Equidistant Spacing</div>
        </div>

        {/* Central Core: Intelligent Scheduling & Optimization Engine */}
        <div className="abstract-center-core">
          <div className="abstract-core-pulse" />
          <div className="abstract-core-icon">
            <CpuIcon size={28} />
          </div>
          <div className="abstract-core-label">
            <strong>Optimization Core</strong>
            <span>Multi-Constraint Engine</span>
          </div>
          <div className="abstract-core-badge">
            <SparklesIcon size={12} />
            <span>Mathematical Precision</span>
          </div>
        </div>

        {/* Floating Abstract Node 3: Venue Allocation */}
        <div className="abstract-card abstract-node-top-right">
          <div className="abstract-node-header">
            <span className="abstract-node-indicator cyan" />
            <span className="abstract-node-title">Venue Topology</span>
          </div>
          <div className="abstract-node-bars">
            <div className="abstract-bar cyan" style={{ width: '92%' }} />
            <div className="abstract-bar cyan" style={{ width: '70%' }} />
          </div>
          <div className="abstract-node-meta">Capacity Harmonization</div>
        </div>

        {/* Floating Abstract Node 4: Unified Timetable Result */}
        <div className="abstract-card abstract-node-bottom-right">
          <div className="abstract-node-header">
            <span className="abstract-node-indicator emerald" />
            <span className="abstract-node-title">Coordinated Schedule</span>
          </div>
          <div className="abstract-geometric-slots">
            <span className="abstract-slot-pill emerald active" />
            <span className="abstract-slot-pill emerald active" />
            <span className="abstract-slot-pill emerald active" />
          </div>
          <div className="abstract-node-meta">Conflict-Free Resolution</div>
        </div>
      </div>

      {/* Sub-strip: Core Pillars */}
      <div className="hero-abstract-pillars">
        <div className="pillar-item">
          <LayersIcon size={15} />
          <span>Algorithmic Balance</span>
        </div>
        <div className="pillar-divider">•</div>
        <div className="pillar-item">
          <SparklesIcon size={15} />
          <span>Zero Schedule Clashes</span>
        </div>
        <div className="pillar-divider">•</div>
        <div className="pillar-item">
          <CpuIcon size={15} />
          <span>Automated Facility Distribution</span>
        </div>
      </div>
    </div>
  );
}

export default HeroVisual;
