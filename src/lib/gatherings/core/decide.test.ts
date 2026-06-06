import { describe, expect, it } from 'vitest';
import { applyResolution, decideStepForKind, pickWinner, tallyVotes } from './decide';
import type { DecisionOption, Vote } from './entities';

const opts: DecisionOption[] = [
  { id: 'a', label: 'Trattoria' },
  { id: 'b', label: 'Sushi Bar' },
  { id: 'c', label: 'Taco Stand' },
];

const vote = (userId: string, optionId: string): Vote => ({
  id: `v-${userId}`,
  decisionId: 'd1',
  userId,
  optionId,
});

describe('tallyVotes', () => {
  it('counts per option in proposal order', () => {
    const t = tallyVotes(opts, [vote('u1', 'b'), vote('u2', 'b'), vote('u3', 'a')]);
    expect(t).toEqual([
      { optionId: 'a', label: 'Trattoria', count: 1 },
      { optionId: 'b', label: 'Sushi Bar', count: 2 },
      { optionId: 'c', label: 'Taco Stand', count: 0 },
    ]);
  });
});

describe('pickWinner', () => {
  it('picks the plurality winner', () => {
    expect(pickWinner(opts, [vote('u1', 'c'), vote('u2', 'c'), vote('u3', 'a')])).toBe('c');
  });

  it('breaks ties by proposal order', () => {
    // a and b each get 1 → a wins (earlier in the list).
    expect(pickWinner(opts, [vote('u1', 'a'), vote('u2', 'b')])).toBe('a');
  });

  it('resolves to the first option when there are no votes', () => {
    expect(pickWinner(opts, [])).toBe('a');
  });

  it('throws when there are no options', () => {
    expect(() => pickWinner([], [])).toThrow();
  });
});

describe('decideStepForKind', () => {
  it('maps kind to decision type', () => {
    expect(decideStepForKind('dinner')).toBe('venue_vote');
    expect(decideStepForKind('coffee')).toBe('venue_vote');
    expect(decideStepForKind('boardgames')).toBe('host_pick');
    expect(decideStepForKind('sport')).toBe('none');
    expect(decideStepForKind('generic')).toBe('none');
  });
});

describe('applyResolution', () => {
  it('writes the venue label for venue_vote', () => {
    expect(applyResolution('venue_vote', { id: 'a', label: 'Trattoria' })).toEqual({
      locationText: 'Trattoria',
    });
  });
  it('writes a host line for host_pick', () => {
    expect(applyResolution('host_pick', { id: 'h', label: 'Dana' })).toEqual({
      locationText: 'Hosted by Dana',
    });
  });
});
