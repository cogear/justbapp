// @blife/gatherings core — the decide-step. Pure voting rules + the pluggable mapping
// from a group's kind to its decision type. No IO. See ARCHITECTURE.md.

import type { DecisionOption, DecisionType, GroupKind, Vote } from './entities';

/**
 * Which decide-step a group uses, keyed off its kind. This is the "plugin" wiring:
 * dinner/coffee vote on a venue, boardgames vote on a host, the rest skip deciding.
 */
export const DECIDE_STEP_BY_KIND: Record<GroupKind, DecisionType> = {
  dinner: 'venue_vote',
  coffee: 'venue_vote',
  boardgames: 'host_pick',
  sport: 'none',
  generic: 'none',
};

export function decideStepForKind(kind: GroupKind): DecisionType {
  return DECIDE_STEP_BY_KIND[kind];
}

export interface Tally {
  optionId: string;
  label: string;
  count: number;
}

/** Vote counts per option, in the original proposal order. */
export function tallyVotes(options: DecisionOption[], votes: Vote[]): Tally[] {
  const counts = new Map<string, number>();
  for (const v of votes) counts.set(v.optionId, (counts.get(v.optionId) ?? 0) + 1);
  return options.map((o) => ({ optionId: o.id, label: o.label, count: counts.get(o.id) ?? 0 }));
}

/**
 * Plurality winner. Ties are broken by proposal order (the earlier option wins),
 * and a decision with zero votes resolves to the first option so the meetup still
 * gets a venue/host rather than stalling. Throws if there are no options.
 */
export function pickWinner(options: DecisionOption[], votes: Vote[]): string {
  if (options.length === 0) throw new Error('decision has no options');
  const tally = tallyVotes(options, votes);
  let best = tally[0];
  for (const t of tally) {
    if (t.count > best.count) best = t; // strict > preserves proposal-order tie-break
  }
  return best.optionId;
}

/** What a resolved decision writes onto its meetup, by decision type. */
export function applyResolution(
  type: DecisionType,
  option: DecisionOption,
): { locationText: string } {
  switch (type) {
    case 'host_pick':
      return { locationText: `Hosted by ${option.label}` };
    case 'venue_vote':
    case 'none':
    default:
      return { locationText: option.label };
  }
}
