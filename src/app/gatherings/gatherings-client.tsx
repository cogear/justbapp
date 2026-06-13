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
    rsvpAction,
    setLocationAction,
} from './actions';
import { inviteToGatheringAction } from './invite-actions';
import { LocationPicker } from './location-picker';
import type {
    Cadence,
    Group,
    GroupKind,
    Headcount,
    MemberRole,
    Meetup,
    RsvpState,
    ScheduleType,
} from '@/lib/gatherings/core';

interface OccurrenceDetail {
    meetup: Meetup;
    headcount: Headcount;
    myRsvp: RsvpState;
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

                        {upcoming.length === 0 && past.length === 0 && (
                            <p className="text-muted-foreground text-sm">No dates yet.</p>
                        )}

                        {upcoming.length > 0 && (
                            <Section title="Upcoming">
                                {upcoming.map((md) => (
                                    <Occurrence
                                        key={md.meetup.id}
                                        md={md}
                                        canEdit={!!isOrganizer}
                                        canManage={!!isOrganizer}
                                        disabled={isPending}
                                        onRsvp={handleRsvp}
                                        onSetLocation={handleSetLocation}
                                        onDelete={handleDelete}
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
                                        disabled={isPending}
                                        onRsvp={handleRsvp}
                                        onSetLocation={handleSetLocation}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h3>
            {children}
        </div>
    );
}

function Occurrence({
    md,
    canEdit,
    canManage,
    disabled,
    onRsvp,
    onSetLocation,
    onDelete,
}: {
    md: OccurrenceDetail;
    canEdit: boolean;
    canManage: boolean;
    disabled: boolean;
    onRsvp: (meetupId: string, state: RsvpState) => void;
    onSetLocation: (meetupId: string, locationText: string, placeId?: string | null) => void;
    onDelete: (meetupId: string) => void;
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
