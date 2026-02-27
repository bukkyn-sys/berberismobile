// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm by Piotr Wozniak

export interface SM2Progress {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
}

/**
 * Update SM-2 progress after a review.
 * @param progress - Current progress record
 * @param quality - User's self-rating: 1=Again, 2=Hard, 3=Okay, 4=Good, 5=Easy
 */
export function sm2Update(progress: SM2Progress, quality: 1 | 2 | 3 | 4 | 5): SM2Progress {
  let { ease_factor, interval_days, repetitions } = progress;

  if (quality < 3) {
    // Failed — reset streak
    repetitions = 0;
    interval_days = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease_factor = Math.max(1.3, ease_factor);
    repetitions++;
  }

  const next = new Date();
  next.setDate(next.getDate() + interval_days);

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review_at: next.toISOString(),
  };
}

export function sm2Initial(): SM2Progress {
  return {
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review_at: new Date().toISOString(),
  };
}
