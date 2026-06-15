'use client';

import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    createGroupAction,
    createMeetupAction,
    deleteMeetupAction,
    generateUpcomingAction,
    getGroupDetailAction,
    getMyGatheringsAction,
    proposeOptionsAction,
    rsvpAction,
    setLocationAction,
    voteAction,
} from './actions';
import { inviteToGatheringAction } from './invite-actions';
import { LocationPicker } from './location-picker';
import { decideStepForKind } from '@/lib/gatherings/core';
import type {
    Cadence,
    Decision,
    DecisionOption,
    Group,
    GroupKind,
    Headcount,
    MemberRole,
    Meetup,
    RsvpState,
    ScheduleType,
    Tally,
} from '@/lib/gatherings/core';

type DecisionDetail = { decision: Decision; tally: Tally[] };

interface OccurrenceDetail {
    meetup: Meetup;
    headcount: Headcount;
    myRsvp: RsvpState;
    decision: DecisionDetail | null;
    myVote: string | null;
}
interface Detail {
    group: Group;
    role: MemberRole | null;
    upcoming: OccurrenceDetail[];
    past: OccurrenceDetail[];
}

const KINDS: GroupKind[] = ['dinner', 'coffee', 'sport', 'boardgames', 'generic'];
const RSVP_STATES: RsvpState[] = ['yes', 'no', 'maybe'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ordinal = (n: number) => ['', '1st', '2nd', '3rd', '4th'][n] ?? `${n}th`;

const fmt = (d: Date | string) =>
    new Date(d).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

const fmtTime = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

function scheduleInfo(g: Group): { type: string; detail?: string } {
    if (g.scheduleType === 'single') return { type: 'One-time' };
    if (g.scheduleType === 'recurring_flexible') {
        return { type: 'Recurring · Flexible', detail: 'you pick each date' };
    }
    const c = g.defaultCadence;
    if (c.rhythm === 'weekly') {
        return { type: 'Recurring · Fixed', detail: `Weekly · ${c.days.map(cap).join(', ')} · ${fmtTime(c.time)}` };
    }
    if (c.rhythm === 'monthly') {
        return { type: 'Recurring · Fixed', detail: `Monthly · ${ordinal(c.nth)} ${cap(c.weekday)} · ${fmtTime(c.time)}` };
    }
    return { type: 'Recurring' };
}

export function GatheringsClient({ initialGroups }: { initialGroups: Group[] }) {
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<Detail | null>(null);
    const [isPending, startTransition] = useTransition();

    // create form
    const [name, setName] = useState('');
    const [kind, setKind] = useState<GroupKind>('dinner');
    const [timezone, setTimezone] = useState('America/New_York');
    const [mode, setMode] = useState<'single' | 'recurring'>('single');
    const [recurType, setRecurType] = useState<'static' | 'flexible'>('static');
    const [rhythm, setRhythm] = useState<'weekly' | 'monthly'>('weekly');
    const [weekDays, setWeekDays] = useState<string[]>(['thu']);
    const [monthNth, setMonthNth] = useState(1);
    const [monthWeekday, setMonthWeekday] = useState('fri');
    const [timeOfDay, setTimeOfDay] = useState('18:30');
    const [singleAt, setSingleAt] = useState('');

    // detail: schedule a one-off time (single/flexible)
    const [scheduleAt, setScheduleAt] = useState('');
    const [view, setView] = useState<'list' | 'calendar'>('list');

    const isOrganizer = detail?.role === 'owner' || detail?.role === 'co_organizer';

    const loadDetail = useCallback(async (groupId: string) => {
        const res = await getGroupDetailAction(groupId);
        if ('error' in res) {
            toast.error(res.error);
            return;
        }
        const now = Date.now();
        const upcoming = res.meetups.filter((m) => new Date(m.meetup.startsAt).getTime() >= now);
        const past = res.meetups.filter((m) => new Date(m.meetup.startsAt).getTime() < now);
        setDetail({ group: res.group, role: res.role, upcoming, past });
    }, []);

    const selectGroup = (groupId: string) => {
        setSelectedId(groupId);
        setDetail(null);
        startTransition(() => {
            void loadDetail(groupId);
        });
    };

    function buildSchedule(): { scheduleType: ScheduleType; cadence: Cadence } | { error: string } {
        if (mode === 'single') {
            if (!singleAt) return { error: 'Pick a date & time' };
            return { scheduleType: 'single', cadence: { rhythm: 'adhoc' } };
        }
        if (recurType === 'flexible') {
            return { scheduleType: 'recurring_flexible', cadence: { rhythm: 'adhoc' } };
        }
        if (rhythm === 'weekly') {
            if (weekDays.length === 0) return { error: 'Pick at least one day' };
            return { scheduleType: 'recurring_static', cadence: { rhythm: 'weekly', days: weekDays, time: timeOfDay } };
        }
        return {
            scheduleType: 'recurring_static',
            cadence: { rhythm: 'monthly', nth: monthNth, weekday: monthWeekday, time: timeOfDay },
        };
    }

    const handleCreate = () => {
        if (!name.trim()) return toast.error('Please name your gathering');
        const schedule = buildSchedule();
        if ('error' in schedule) return toast.error(schedule.error);

        startTransition(async () => {
            const res = await createGroupAction({
                name,
                kind,
                timezone,
                scheduleType: schedule.scheduleType,
                defaultCadence: schedule.cadence,
            });
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Gathering created');
            setName('');
            const list = await getMyGatheringsAction();
            if ('groups' in list && list.groups) setGroups(list.groups);
            if (res.group) {
                setSelectedId(res.group.id);
                if (mode === 'single' && singleAt) {
                    await createMeetupAction(res.group.id, new Date(singleAt));
                    setSingleAt('');
                }
                await loadDetail(res.group.id);
            }
        });
    };

    const handleSchedule = () => {
        if (!selectedId || !scheduleAt) return toast.error('Pick a date & time');
        startTransition(async () => {
            const res = await createMeetupAction(selectedId, new Date(scheduleAt));
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Scheduled');
            setScheduleAt('');
            await loadDetail(selectedId);
        });
    };

    const handleGenerate = () => {
        if (!selectedId) return;
        startTransition(async () => {
            const res = await generateUpcomingAction(selectedId);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success(res.created > 0 ? `Added ${res.created} upcoming dates` : 'Already up to date');
            await loadDetail(selectedId);
        });
    };

    const handleRsvp = (meetupId: string, state: RsvpState) => {
        startTransition(async () => {
            const res = await rsvpAction(meetupId, state);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`You're ${state}`);
            if (selectedId) await loadDetail(selectedId);
        });
    };

    const handleSetLocation = (meetupId: string, locationText: string, placeId?: string | null) => {
        startTransition(async () => {
            const res = await setLocationAction(meetupId, locationText, placeId);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Location set');
            if (selectedId) await loadDetail(selectedId);
        });
    };

    const handleDelete = (meetupId: string) => {
        startTransition(async () => {
            const res = await deleteMeetupAction(meetupId);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Removed');
            if (selectedId) await loadDetail(selectedId);
        });
    };

    const handleStartPoll = (meetupId: string, options: DecisionOption[]) => {
        startTransition(async () => {
            const res = await proposeOptionsAction(meetupId, options);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Poll opened');
            if (selectedId) await loadDetail(selectedId);
        });
    };

    const handleVote = (decisionId: string, optionId: string) => {
        startTransition(async () => {
            const res = await voteAction(decisionId, optionId);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('Voted');
            if (selectedId) await loadDetail(selectedId);
        });
    };

    // Only venue-vote kinds (dinner/coffee) get the "where next?" poll.
    const canPoll = !!detail && decideStepForKind(detail.group.kind) === 'venue_vote';

    const upcoming = detail?.upcoming ?? [];
    const past = detail?.past ?? [];

    return (
        <div className="space-y-8">
            {/* Create */}
            <Card>
                <CardHeader>
                    <CardTitle>Start a gathering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Thursday Volleyball"
                        className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={kind}
                            onChange={(e) => setKind(e.target.value as GroupKind)}
                            className="bg-background border border-border rounded-lg p-3 capitalize"
                        >
                            {KINDS.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                        <input
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            placeholder="IANA timezone"
                            className="flex-1 min-w-48 bg-background border border-border rounded-lg p-3"
                        />
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3 rounded-lg border border-border p-3">
                        <div className="flex gap-2">
                            <Button size="sm" variant={mode === 'single' ? 'default' : 'outline'} onClick={() => setMode('single')}>
                                One-time
                            </Button>
                            <Button size="sm" variant={mode === 'recurring' ? 'default' : 'outline'} onClick={() => setMode('recurring')}>
                                Recurring
                            </Button>
                        </div>

                        {mode === 'single' && (
                            <input
                                type="datetime-local"
                                value={singleAt}
                                onChange={(e) => setSingleAt(e.target.value)}
                                className="bg-background border border-border rounded-lg p-2"
                            />
                        )}

                        {mode === 'recurring' && (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button size="sm" variant={recurType === 'static' ? 'default' : 'outline'} onClick={() => setRecurType('static')}>
                                        Fixed schedule
                                    </Button>
                                    <Button size="sm" variant={recurType === 'flexible' ? 'default' : 'outline'} onClick={() => setRecurType('flexible')}>
                                        Flexible
                                    </Button>
                                </div>

                                {recurType === 'flexible' && (
                                    <p className="text-xs text-muted-foreground">
                                        Recurs, but you set each date as you go.
                                    </p>
                                )}

                                {recurType === 'static' && (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant={rhythm === 'weekly' ? 'default' : 'outline'} onClick={() => setRhythm('weekly')}>
                                                Weekly
                                            </Button>
                                            <Button size="sm" variant={rhythm === 'monthly' ? 'default' : 'outline'} onClick={() => setRhythm('monthly')}>
                                                Monthly
                                            </Button>
                                        </div>

                                        {rhythm === 'weekly' && (
                                            <div className="flex flex-wrap gap-1">
                                                {WEEKDAYS.map((d) => (
                                                    <Button
                                                        key={d}
                                                        size="sm"
                                                        variant={weekDays.includes(d) ? 'default' : 'outline'}
                                                        onClick={() =>
                                                            setWeekDays((prev) =>
                                                                prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
                                                            )
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {d}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {rhythm === 'monthly' && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <select
                                                    value={monthNth}
                                                    onChange={(e) => setMonthNth(Number(e.target.value))}
                                                    className="bg-background border border-border rounded-lg p-2"
                                                >
                                                    {[1, 2, 3, 4].map((n) => (
                                                        <option key={n} value={n}>{ordinal(n)}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={monthWeekday}
                                                    onChange={(e) => setMonthWeekday(e.target.value)}
                                                    className="bg-background border border-border rounded-lg p-2 capitalize"
                                                >
                                                    {WEEKDAYS.map((d) => (
                                                        <option key={d} value={d}>{cap(d)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            at
                                            <input
                                                type="time"
                                                value={timeOfDay}
                                                onChange={(e) => setTimeOfDay(e.target.value)}
                                                className="bg-background border border-border rounded-lg p-2"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button onClick={handleCreate} disabled={isPending}>Create gathering</Button>
                </CardContent>
            </Card>

            {/* My gatherings */}
            <div className="space-y-3">
                <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Your gatherings</h2>
                {groups.length === 0 ? (
                    <p className="text-muted-foreground text-sm">None yet — start one above.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {groups.map((g) => (
                            <Button
                                key={g.id}
                                variant={selectedId === g.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => selectGroup(g.id)}
                            >
                                {g.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail */}
            {detail && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{detail.group.name}</span>
                            <span className="text-xs font-normal text-muted-foreground capitalize">
                                {detail.group.kind} · {detail.role ?? 'guest'}
                            </span>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-block rounded-full bg-secondary text-secondary-foreground text-xs px-2 py-0.5">
                                {scheduleInfo(detail.group).type}
                            </span>
                            {scheduleInfo(detail.group).detail && (
                                <span className="text-sm text-muted-foreground">
                                    {scheduleInfo(detail.group).detail}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Scheduling controls */}
                        {isOrganizer && (
                            <div className="flex flex-wrap items-center gap-3">
                                {detail.group.scheduleType === 'recurring_static' ? (
                                    <Button variant="secondary" size="sm" onClick={handleGenerate} disabled={isPending}>
                                        Generate upcoming
                                    </Button>
                                ) : (
                                    <>
                                        <input
                                            type="datetime-local"
                                            value={scheduleAt}
                                            onChange={(e) => setScheduleAt(e.target.value)}
                                            className="bg-background border border-border rounded-lg p-2"
                                        />
                                        <Button variant="secondary" size="sm" onClick={handleSchedule} disabled={isPending}>
                                            Schedule a time
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}

                        {isOrganizer && <InvitePanel groupId={detail.group.id} />}

                        {(upcoming.length > 0 || past.length > 0) && (
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-1">
                                    <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
                                        List
                                    </Button>
                                    <Button size="sm" variant={view === 'calendar' ? 'default' : 'outline'} onClick={() => setView('calendar')}>
                                        Calendar
                                    </Button>
                                </div>
                                <a
                                    href={`/api/gatherings/groups/${detail.group.id}/ics`}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Add to calendar
                                </a>
                            </div>
                        )}

                        {upcoming.length === 0 && past.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No dates yet.</p>
                        ) : view === 'calendar' ? (
                            <CalendarView occurrences={[...upcoming, ...past]} />
                        ) : (
                            <>
                                {upcoming.length > 0 && (
                                    <Section title="Upcoming">
                                        {upcoming.map((md) => (
                                            <Occurrence
                                                key={md.meetup.id}
                                                md={md}
                                                canEdit={!!isOrganizer}
                                                canManage={!!isOrganizer}
                                                canPoll={canPoll}
                                                disabled={isPending}
                                                onRsvp={handleRsvp}
                                                onSetLocation={handleSetLocation}
                                                onDelete={handleDelete}
                                                onStartPoll={handleStartPoll}
                                                onVote={handleVote}
                                            />
                                        ))}
                                    </Section>
                                )}

                                {past.length > 0 && (
                                    <Section title="Past">
                                        {past.map((md) => (
                                            <Occurrence
                                                key={md.meetup.id}
                                                md={md}
                                                canEdit={false}
                                                canManage={!!isOrganizer}
                                                canPoll={canPoll}
                                                disabled={isPending}
                                                onRsvp={handleRsvp}
                                                onSetLocation={handleSetLocation}
                                                onDelete={handleDelete}
                                                onStartPoll={handleStartPoll}
                                                onVote={handleVote}
                                            />
                                        ))}
                                    </Section>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function InvitePanel({ groupId }: { groupId: string }) {
    const [open, setOpen] = useState(false);
    const [contact, setContact] = useState('');
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);

    const send = async () => {
        if (!contact.trim() || sending) return;
        setSending(true);
        const res = await inviteToGatheringAction(groupId, contact, note || undefined);
        setSending(false);
        if ('error' in res && res.error) {
            toast.error(res.error);
            return;
        }
        toast.success('Invitation sent');
        setContact('');
        setNote('');
        setOpen(false);
    };

    if (!open) {
        return (
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
                Invite someone
            </Button>
        );
    }

    return (
        <div className="rounded-lg border border-border p-3 space-y-2 w-full max-w-md">
            <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Their email or phone number"
                className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A short note (optional)"
                maxLength={140}
                className="w-full bg-background border border-border rounded-lg p-2 text-sm"
            />
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={send} disabled={sending || !contact.trim()}>
                    {sending ? 'Sending…' : 'Send invite'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function CalendarView({ occurrences }: { occurrences: OccurrenceDetail[] }) {
    const [cursor, setCursor] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const byDay = new Map<number, OccurrenceDetail[]>();
    for (const o of occurrences) {
        const d = new Date(o.meetup.startsAt);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const arr = byDay.get(d.getDate()) ?? [];
            arr.push(o);
            byDay.set(d.getDate(), arr);
        }
    }

    const cells: (number | null)[] = [
        ...Array<null>(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    const today = new Date();
    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const shift = (delta: number) => setCursor(new Date(year, month + delta, 1));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Button size="sm" variant="ghost" onClick={() => shift(-1)} aria-label="Previous month">‹</Button>
                <span className="text-sm font-medium">{monthLabel}</span>
                <Button size="sm" variant="ghost" onClick={() => shift(1)} aria-label="Next month">›</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] uppercase tracking-wide text-muted-foreground py-1">
                        {d}
                    </div>
                ))}
                {cells.map((day, i) => {
                    if (day === null) return <div key={`b${i}`} />;
                    const items = byDay.get(day) ?? [];
                    return (
                        <div
                            key={day}
                            className={`min-h-14 rounded-md border p-1 text-left ${items.length ? 'border-primary/40 bg-primary/5' : 'border-border/40'}`}
                        >
                            <div className={`text-[11px] ${isToday(day) ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                {day}
                            </div>
                            {items.slice(0, 2).map((o) => (
                                <div key={o.meetup.id} className="mt-0.5 flex items-center gap-1">
                                    <span
                                        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${o.myRsvp === 'yes' ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                                    />
                                    <span className="text-[10px] text-foreground/80 truncate">
                                        {new Date(o.meetup.startsAt).toLocaleTimeString(undefined, {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            ))}
                            {items.length > 2 && (
                                <div className="text-[9px] text-muted-foreground">+{items.length - 2}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
            {children}
        </div>
    );
}

function VenuePoll({
    md,
    canManage,
    disabled,
    onStartPoll,
    onVote,
}: {
    md: OccurrenceDetail;
    canManage: boolean;
    disabled: boolean;
    onStartPoll: (meetupId: string, options: DecisionOption[]) => void;
    onVote: (decisionId: string, optionId: string) => void;
}) {
    const [creating, setCreating] = useState(false);
    const [options, setOptions] = useState<string[]>(['', '']);
    const dv = md.decision;

    // Resolved → show the winning spot.
    if (dv && dv.decision.status === 'resolved') {
        const win = dv.decision.options.find((o) => o.id === dv.decision.resolvedOptionId);
        return (
            <div className="border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Where: </span>
                <span className="text-foreground font-medium">
                    {win?.label ?? md.meetup.locationText ?? 'decided'}
                </span>
            </div>
        );
    }

    // Open → everyone votes.
    if (dv && dv.decision.status === 'open') {
        const countFor = (id: string) => dv.tally.find((t) => t.optionId === id)?.count ?? 0;
        return (
            <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Where should we meet?
                </p>
                {dv.decision.options.map((o) => (
                    <button
                        key={o.id}
                        disabled={disabled}
                        onClick={() => onVote(dv.decision.id, o.id)}
                        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${md.myVote === o.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:bg-secondary/50'}`}
                    >
                        <span className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${md.myVote === o.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            {o.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {countFor(o.id)} {countFor(o.id) === 1 ? 'vote' : 'votes'}
                        </span>
                    </button>
                ))}
            </div>
        );
    }

    // No decision yet → an organizer can open one.
    if (!canManage) return null;
    if (!creating) {
        return (
            <div className="border-t border-border pt-3">
                <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
                    Start a “where next?” poll
                </Button>
            </div>
        );
    }

    const submit = () => {
        const opts = options.map((s) => s.trim()).filter(Boolean);
        if (opts.length < 2) {
            toast.error('Add at least two options');
            return;
        }
        onStartPoll(
            md.meetup.id,
            opts.map((label) => ({ id: crypto.randomUUID(), label })),
        );
        setCreating(false);
        setOptions(['', '']);
    };

    return (
        <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Propose places to meet</p>
            {options.map((v, i) => (
                <input
                    key={i}
                    value={v}
                    onChange={(e) =>
                        setOptions((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    placeholder={`Option ${i + 1}`}
                    className="w-full bg-background border border-border rounded-lg p-2 text-sm"
                />
            ))}
            <div className="flex items-center gap-2">
                {options.length < 4 && (
                    <Button size="sm" variant="ghost" onClick={() => setOptions((p) => [...p, ''])}>
                        + Add option
                    </Button>
                )}
                <Button size="sm" onClick={submit} disabled={disabled}>
                    Open poll
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

function Occurrence({
    md,
    canEdit,
    canManage,
    canPoll,
    disabled,
    onRsvp,
    onSetLocation,
    onDelete,
    onStartPoll,
    onVote,
}: {
    md: OccurrenceDetail;
    canEdit: boolean;
    canManage: boolean;
    canPoll: boolean;
    disabled: boolean;
    onRsvp: (meetupId: string, state: RsvpState) => void;
    onSetLocation: (meetupId: string, locationText: string, placeId?: string | null) => void;
    onDelete: (meetupId: string) => void;
    onStartPoll: (meetupId: string, options: DecisionOption[]) => void;
    onVote: (decisionId: string, optionId: string) => void;
}) {
    const [confirming, setConfirming] = useState(false);
    const mapHref = md.meetup.locationPlaceId
        ? `https://www.google.com/maps/place/?q=place_id:${md.meetup.locationPlaceId}`
        : null;

    return (
        <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{fmt(md.meetup.startsAt)}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">{md.meetup.status}</span>
                    {canManage && (
                        confirming ? (
                            <span className="flex items-center gap-1">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={disabled}
                                    onClick={() => onDelete(md.meetup.id)}
                                >
                                    Delete
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                                    Cancel
                                </Button>
                            </span>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
                                Remove
                            </Button>
                        )
                    )}
                </div>
            </div>
            {md.meetup.locationText && (
                <p className="text-sm text-primary">
                    📍{' '}
                    {mapHref ? (
                        <a href={mapHref} target="_blank" rel="noreferrer" className="underline">
                            {md.meetup.locationText}
                        </a>
                    ) : (
                        md.meetup.locationText
                    )}
                </p>
            )}

            <div className="flex items-center gap-2">
                {RSVP_STATES.map((s) => (
                    <Button
                        key={s}
                        size="sm"
                        variant={md.myRsvp === s ? 'default' : 'outline'}
                        onClick={() => onRsvp(md.meetup.id, s)}
                        disabled={disabled}
                        className="capitalize"
                    >
                        {s}
                    </Button>
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                    {md.headcount.yes} in · {md.headcount.maybe} maybe · {md.headcount.no} out
                </span>
            </div>

            {canPoll && (
                <VenuePoll
                    md={md}
                    canManage={canEdit}
                    disabled={disabled}
                    onStartPoll={onStartPoll}
                    onVote={onVote}
                />
            )}

            {canEdit && (
                <div className="border-t border-border pt-3">
                    <LocationPicker
                        disabled={disabled}
                        onSelect={(text, placeId) => onSetLocation(md.meetup.id, text, placeId)}
                    />
                </div>
            )}
        </div>
    );
}
