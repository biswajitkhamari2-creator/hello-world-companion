/**
 * User-controlled processing options.
 * Stored in localStorage so they persist per browser.
 *
 * Defaults follow the product spec: UPSC syllabus tagging and PYQ mapping
 * are OFF by default; the generators preserve and transform the uploaded
 * material faithfully unless the user explicitly enables those layers.
 */

export interface ProcessingPrefs {
  // Optional UPSC layers
  syllabusTagging: boolean; // OFF — when on, every concept is tagged to Prelims/GS-I..IV/Essay
  pyqMapping: boolean;      // OFF — when on, link concepts to actual UPSC PYQs

  // Question generation (master toggle + sub-categories)
  generateQuestions: boolean;
  questionPrelimsMcqs: boolean;
  questionMains: boolean;
  questionEssay: boolean;        // bundled into Mains output when on
  questionEthicsCases: boolean;  // bundled into Mains output when on
  questionInterview: boolean;    // bundled into Mains output when on

  // Other outputs
  generateShortNotes: boolean;
  generateHandwritten: boolean;
  generateInfographics: boolean;
  runFinalChecker: boolean;
}

export const DEFAULT_PREFS: ProcessingPrefs = {
  syllabusTagging: false,
  pyqMapping: false,
  generateQuestions: true,
  questionPrelimsMcqs: true,
  questionMains: true,
  questionEssay: false,
  questionEthicsCases: false,
  questionInterview: false,
  generateShortNotes: true,
  generateHandwritten: true,
  generateInfographics: true,
  runFinalChecker: true,
};

const KEY = "upsc_processing_prefs_v1";
const EVENT = "upsc-prefs-changed";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getProcessingPrefs(): ProcessingPrefs {
  if (!isBrowser()) return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) } as ProcessingPrefs;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function setProcessingPrefs(p: ProcessingPrefs): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch (e) {
    console.warn("[prefs] write failed", e);
  }
}

export function subscribeProcessingPrefs(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Server-fn payload shape for prompt control. */
export interface GenerationOptions {
  syllabusTagging: boolean;
  pyqMapping: boolean;
  mainsCategories?: { essay?: boolean; ethics?: boolean; interview?: boolean };
}

export function prefsToOptions(p: ProcessingPrefs): GenerationOptions {
  return {
    syllabusTagging: p.syllabusTagging,
    pyqMapping: p.pyqMapping,
    mainsCategories: {
      essay: p.questionEssay,
      ethics: p.questionEthicsCases,
      interview: p.questionInterview,
    },
  };
}
