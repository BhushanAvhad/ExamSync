/**
 * Academic Hierarchy & Cohort Structuring Utility
 * Vidyalankar Institute of Technology (VIT), Mumbai
 *
 * Provides standardized parsing and grouping for examination schedules
 * by Academic Year (FE, SE, TE, BE) and Department (CMPN, INFT, EXTC, etc.)
 * strictly eliminating division-wise segregation for institutional scheduling.
 */

export const YEAR_LABELS = {
  FE: 'First Year (FE)',
  SE: 'Second Year (SE)',
  TE: 'Third Year (TE)',
  BE: 'Final Year (BE)',
};

export const DEPARTMENT_LABELS = {
  CMPN: 'Computer Engineering (CMPN)',
  INFT: 'Information Technology (INFT)',
  EXTC: 'Electronics & Telecommunication (EXTC)',
  ETRX: 'Electronics Engineering (ETRX)',
  BIOM: 'Biomedical Engineering (BIOM)',
  FE: 'Applied Sciences & Humanities',
  'APPLIED SCIENCES': 'Applied Sciences & Humanities',
  GENERAL: 'General Engineering',
};

const YEAR_ORDER = {
  FE: 1,
  SE: 2,
  TE: 3,
  BE: 4,
  OTHER: 5,
};

const DEPT_ORDER = {
  'APPLIED SCIENCES': 1,
  FE: 1,
  CMPN: 2,
  INFT: 3,
  EXTC: 4,
  ETRX: 5,
  BIOM: 6,
  GENERAL: 7,
};

/**
 * Parses any class/cohort string (e.g. "SE CMPN", "FE", "TE INFT (A)", "BE CMPN")
 * into normalized year and department components.
 */
export function parseYearAndDept(className = '') {
  // Strip out division suffixes like (A), (B), (A & B), etc.
  const clean = (className || '')
    .replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '')
    .trim();

  // Match leading year code: FE, SE, TE, or BE
  const match = clean.match(/^(FE|SE|TE|BE)\b\s*(.*)$/i);
  if (match) {
    const yrCode = match[1].toUpperCase();
    const rest = match[2].trim().toUpperCase();

    let deptCode = rest;
    if (!deptCode || deptCode === 'A' || deptCode === 'B') {
      deptCode = yrCode === 'FE' ? 'Applied Sciences' : 'General';
    }

    const yrLabel = YEAR_LABELS[yrCode] || `${yrCode} Engineering`;
    const deptUpper = deptCode.toUpperCase();
    const deptLabel = DEPARTMENT_LABELS[deptUpper] || (deptCode === 'Applied Sciences' ? 'Applied Sciences & Humanities' : deptCode);

    return {
      year: yrCode,
      yearLabel: yrLabel,
      department: deptCode,
      departmentLabel: deptLabel,
      cohortLabel: deptCode === 'Applied Sciences' ? yrLabel : `${yrCode} — ${deptLabel}`,
      sortRank: (YEAR_ORDER[yrCode] || 99) * 100 + (DEPT_ORDER[deptUpper] || 50),
    };
  }

  // Fallback for non-standard labels
  return {
    year: 'General',
    yearLabel: 'General Engineering',
    department: clean || 'General',
    departmentLabel: clean || 'General Engineering',
    cohortLabel: clean || 'All Departments',
    sortRank: 9999,
  };
}

/**
 * Groups an array of timetable items strictly Year-wise and Department-wise.
 * Sorts sections sequentially (FE -> SE -> TE -> BE), and items within each section chronologically.
 */
export function groupTimetableByYearAndDept(items = []) {
  const groupMap = new Map();

  for (const item of items) {
    const { year, yearLabel, department, departmentLabel, cohortLabel, sortRank } = parseYearAndDept(
      item.className || item.cohort || ''
    );

    const groupKey = `${year}___${department}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        key: groupKey,
        year,
        yearLabel,
        department,
        departmentLabel,
        cohortLabel,
        sortRank,
        title: `${yearLabel.toUpperCase()} • ${departmentLabel.toUpperCase()}`,
        items: [],
      });
    }

    // Attach normalized attributes to row for clean template rendering
    groupMap.get(groupKey).items.push({
      ...item,
      normalizedYear: year,
      normalizedDept: department,
    });
  }

  // Sort groups by academic hierarchy (FE -> SE -> TE -> BE)
  const sortedGroups = Array.from(groupMap.values()).sort((a, b) => a.sortRank - b.sortRank);

  // Sort items in each group by Date then Time Slot
  for (const grp of sortedGroups) {
    grp.items.sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });
  }

  return sortedGroups;
}

/**
 * Filter options for Year dropdown.
 */
export const YEAR_FILTER_OPTIONS = [
  { label: 'All Academic Years', value: 'all' },
  { label: 'First Year (FE)', value: 'FE' },
  { label: 'Second Year (SE)', value: 'SE' },
  { label: 'Third Year (TE)', value: 'TE' },
  { label: 'Final Year (BE)', value: 'BE' },
];

/**
 * Extracts unique department options from a timetable dataset.
 */
export function getDepartmentFilterOptions(items = []) {
  const depts = new Set();
  for (const item of items) {
    const { department, departmentLabel } = parseYearAndDept(item.className || '');
    if (department) {
      depts.add(JSON.stringify({ code: department, label: departmentLabel }));
    }
  }

  const list = Array.from(depts)
    .map((s) => JSON.parse(s))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [
    { label: 'All Departments', value: 'all' },
    ...list.map((d) => ({ label: d.label, value: d.code })),
  ];
}

/**
 * Strips obsolete DEMO prefix from subject codes.
 */
export function cleanSubjectCode(code = '') {
  if (!code) return '';
  return code.replace(/^DEMO-/i, '').trim();
}

/**
 * Accurately infers academic year (FE, SE, TE, BE) for any subject object.
 */
export function inferSubjectYear(sub = {}) {
  if (!sub) return 'FE';
  if (sub.year && ['FE', 'SE', 'TE', 'BE'].includes(sub.year.toUpperCase())) {
    return sub.year.toUpperCase();
  }

  // Check applicableClasses
  if (Array.isArray(sub.applicableClasses)) {
    for (const cls of sub.applicableClasses) {
      if (typeof cls === 'string') {
        const m = cls.match(/^(FE|SE|TE|BE)\b/i);
        if (m) return m[1].toUpperCase();
      }
    }
  }

  // Check className
  if (sub.className) {
    const m = sub.className.match(/^(FE|SE|TE|BE)\b/i);
    if (m) return m[1].toUpperCase();
  }

  const rawCode = (sub.code || '').toUpperCase();
  const cleanCode = cleanSubjectCode(rawCode);

  if (cleanCode.startsWith('FE') || cleanCode.includes('-FE-') || cleanCode.includes('-1-') || cleanCode.includes('-2-')) {
    return 'FE';
  }
  if (cleanCode.startsWith('SE') || cleanCode.includes('-SE-') || cleanCode.includes('-3-') || cleanCode.includes('-4-')) {
    return 'SE';
  }
  if (cleanCode.startsWith('TE') || cleanCode.includes('-TE-') || cleanCode.includes('-5-') || cleanCode.includes('-6-')) {
    return 'TE';
  }
  if (cleanCode.startsWith('BE') || cleanCode.includes('-BE-') || cleanCode.includes('-7-') || cleanCode.includes('-8-')) {
    return 'BE';
  }

  return 'FE';
}

/**
 * Accurately infers engineering department for any subject object.
 */
export function inferSubjectDept(sub = {}) {
  if (!sub) return 'General';
  if (sub.department && sub.department !== 'General') {
    return sub.department;
  }

  const rawCode = (sub.code || '').toUpperCase();
  const cleanCode = cleanSubjectCode(rawCode);

  if (cleanCode.includes('CMPN') || cleanCode.includes('CS') || cleanCode.includes('CP')) return 'CMPN';
  if (cleanCode.includes('INFT') || cleanCode.includes('IT')) return 'INFT';
  if (cleanCode.includes('EXTC') || cleanCode.includes('EX') || cleanCode.includes('ETRX')) return 'EXTC';
  if (cleanCode.includes('BIOM') || cleanCode.includes('BM')) return 'BIOM';
  if (cleanCode.includes('FE') || cleanCode.includes('APPLIED')) return 'Applied Sciences';

  if (sub.className) {
    const parsed = parseYearAndDept(sub.className);
    if (parsed.department && parsed.department !== 'General') return parsed.department;
  }

  return 'General';
}

