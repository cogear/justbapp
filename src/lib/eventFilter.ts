export interface RawEvent {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface FilteredEvent extends RawEvent {
  matchScore: number;
  reason: string;
}

// Logic Gate: Community, Not Competition
const COMPETITIVE_KEYWORDS = [
  "contest",
  "competition",
  "hustle",
  "networking",
  "vip",
  "exclusive",
  "win",
  "prize",
  "rank",
  "leaderboard",
  "hackathon", // Usually high stress
  "pitch",
  "investor",
];

// Logic Gate: Nourishing & Slow
const NOURISHING_KEYWORDS = [
  "garden",
  "nature",
  "walk",
  "silent",
  "meditation",
  "workshop",
  "beginner",
  "community",
  "volunteer",
  "rest",
  "yoga",
  "tea",
  "book",
  "art",
  "craft",
];

/**
 * Filters a list of raw events based on "b." principles.
 * Excludes competitive/status-driven events.
 * Prioritizes nourishing/community-driven events.
 */
export function filterEvents(events: RawEvent[]): FilteredEvent[] {
  return events
    .map((event) => {
      const text = (event.title + " " + event.description + " " + event.tags.join(" ")).toLowerCase();
      
      // 1. Exclusion Criteria (The Gatekeeper)
      const hasCompetitiveKeyword = COMPETITIVE_KEYWORDS.some((keyword) => text.includes(keyword));
      if (hasCompetitiveKeyword) {
        return null; // Exclude entirely
      }

      // 2. Scoring (The Curator)
      let score = 0;
      NOURISHING_KEYWORDS.forEach((keyword) => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });

      // Boost for explicit "Beginner" friendly events (Inclusivity)
      if (text.includes("beginner") || text.includes("intro")) {
        score += 2;
      }

      return {
        ...event,
        matchScore: score,
        reason: score > 0 ? "Matches nourishing criteria" : "Neutral event",
      };
    })
    .filter((event): event is FilteredEvent => event !== null) // Remove excluded
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by relevance
}
