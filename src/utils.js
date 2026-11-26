import confetti from 'canvas-confetti';

export const getSafeKey = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0); // Use noon to prevent DST hours shifting days
};

/**
 * Returns true when a habit is currently active (not in archivedHabits) AND
 * dateKey does not fall inside any historical [from, to) archived range.
 */
export const isHabitActiveOnDate = (habit, dateKey, archivedHabits = [], habitConfigs = {}) => {
  if (archivedHabits.includes(habit)) return false;
  const ranges = habitConfigs?.[habit]?.archivedRanges;
  if (!Array.isArray(ranges) || ranges.length === 0) return true;
  return !ranges.some(r => r && r.from && dateKey >= r.from && (r.to == null || dateKey < r.to));
};

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Filter out trashed habit entries whose 30-day retention window has elapsed. */
export const purgeExpiredTrash = (trashedHabits = [], now = Date.now()) => {
  if (!Array.isArray(trashedHabits)) return [];
  return trashedHabits.filter(
    (item) => item && typeof item.name === 'string' && item.name.trim() && (now - (Number(item.deletedAt) || 0)) < TRASH_RETENTION_MS
  );
};

export const loadConfettiScript = (callback) => {
  if (typeof window !== 'undefined' && !window.confetti) {
    window.confetti = confetti;
  }
  if (typeof callback === 'function') callback();
};

export const solveFluidPath = (points) => {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]; const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2; const cp2x = curr.x + (next.x - curr.x) / 2;
    d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
  }
  return d;
};

export const getLevenshteinDistance = (a = '', b = '') => {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;
  const dp = Array.from({ length: s1.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= s2.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[s1.length][s2.length];
};

export const findClosestSuggestion = (query = '', candidates = []) => {
  const q = query.toLowerCase().trim();
  if (!q || !Array.isArray(candidates) || candidates.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const item of candidates) {
    if (!item) continue;
    const target = String(item).trim();
    const tLower = target.toLowerCase();
    if (tLower.includes(q) || q.includes(tLower)) return target;
    const dist = getLevenshteinDistance(q, tLower);
    const maxAllowed = Math.max(2, Math.floor(target.length * 0.45));
    if (dist < bestDist && dist <= maxAllowed) {
      bestDist = dist;
      best = target;
    }
  }
  return best;
};
