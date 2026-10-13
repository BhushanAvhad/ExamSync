/**
 * ExamSync Institutional Settings & Display Preferences Store
 * Persists Vidyalankar Institute of Technology (VIT) institutional branding,
 * exam authority metadata, and visual formatting options.
 */

const INSTITUTION_KEY = 'examsync_institution_settings';
const PREFERENCES_KEY = 'examsync_preferences';

export const DEFAULT_INSTITUTION_SETTINGS = {
  universityName: 'Vidyalankar Institute of Technology',
  shortName: 'VIT',
  subHeading: 'An Autonomous Engineering Institute | Wadala, Mumbai',
  affiliation: 'Affiliated to University of Mumbai & Approved by AICTE',
  location: 'Wadala, Mumbai, Maharashtra, India',
  website: 'https://vit.edu.in/',
  logoUrl: 'https://vit.edu.in/wp-content/uploads/2023/05/VIT.png',
  examOffice: 'Office of the Controller of Examinations',
  controllerName: 'Controller of Examinations',
  controllerTitle: 'Controller of Examinations, VIT',
  deanName: 'Dean of Academic Operations',
  deanTitle: 'Dean (Academic Affairs), VIT',
  term: 'Spring 2026 Final Examinations',
  academicYear: '2025–2026',
  campus: 'Vidyalankar Educational Campus, Vidyalankar College Marg, Wadala (East), Mumbai 400037',
};

export const DEFAULT_PREFERENCES = {
  timeFormat: '12h', // '12h' | '24h'
  dateFormat: 'YYYY-MM-DD',
  tableDensity: 'normal', // 'compact' | 'normal' | 'spacious'
  emailNotifications: true,
};

export function getInstitutionSettings() {
  try {
    const raw = localStorage.getItem(INSTITUTION_KEY);
    if (!raw) return { ...DEFAULT_INSTITUTION_SETTINGS };
    const parsed = JSON.parse(raw);
    // Gracefully migrate if old placeholder college was stored
    if (
      !parsed.universityName ||
      parsed.universityName.includes('Metropolitan') ||
      parsed.universityName === 'State Technical University'
    ) {
      const updated = {
        ...DEFAULT_INSTITUTION_SETTINGS,
        ...parsed,
        universityName: DEFAULT_INSTITUTION_SETTINGS.universityName,
        shortName: DEFAULT_INSTITUTION_SETTINGS.shortName,
        subHeading: DEFAULT_INSTITUTION_SETTINGS.subHeading,
        location: DEFAULT_INSTITUTION_SETTINGS.location,
        website: DEFAULT_INSTITUTION_SETTINGS.website,
        logoUrl: DEFAULT_INSTITUTION_SETTINGS.logoUrl,
        campus: DEFAULT_INSTITUTION_SETTINGS.campus,
        affiliation: DEFAULT_INSTITUTION_SETTINGS.affiliation,
      };
      localStorage.setItem(INSTITUTION_KEY, JSON.stringify(updated));
      return updated;
    }
    return { ...DEFAULT_INSTITUTION_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse institution settings from localStorage:', err);
    return { ...DEFAULT_INSTITUTION_SETTINGS };
  }
}

export function saveInstitutionSettings(settings) {
  try {
    const merged = { ...getInstitutionSettings(), ...settings };
    localStorage.setItem(INSTITUTION_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('examsync-settings-updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.error('Failed to save institution settings to localStorage:', err);
    return settings;
  }
}

export function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to parse preferences from localStorage:', err);
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences) {
  try {
    const merged = { ...getPreferences(), ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('examsync-preferences-updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.error('Failed to save preferences to localStorage:', err);
    return preferences;
  }
}
