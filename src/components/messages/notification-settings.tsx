'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    updateNotificationPrefs,
    sendPhoneOtp,
    confirmPhoneOtp,
    removePhone,
} from '@/app/messages/settings/actions';

type Prefs = {
    dmEmail: boolean;
    dmSms: boolean;
    eventEmail: boolean;
    eventSms: boolean;
    announceEmail: boolean;
    announceSms: boolean;
};

const ROWS: { key: 'dm' | 'event' | 'announce'; label: string; hint: string }[] = [
    { key: 'dm', label: 'Direct messages', hint: 'When a member sends you a message' },
    { key: 'event', label: 'Event reminders', hint: 'Gatherings and events you care about' },
    { key: 'announce', label: 'Announcements', hint: 'Occasional notes from The B Life' },
];

export function NotificationSettings({
    initialPrefs,
    phone,
    phoneVerified,
    smsAvailable,
}: {
    initialPrefs: Prefs;
    phone: string | null;
    phoneVerified: boolean;
    smsAvailable: boolean;
}) {
    const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
    const [saving, setSaving] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const [otpStage, setOtpStage] = useState<'idle' | 'code'>('idle');
    const [busy, setBusy] = useState(false);

    const canSms = phoneVerified;

    const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

    const save = async () => {
        setSaving(true);
        const result = await updateNotificationPrefs(prefs);
        setSaving(false);
        if (result.error) toast.error(result.error);
        else toast.success('Preferences saved');
    };

    const requestCode = async () => {
        setBusy(true);
        const result = await sendPhoneOtp(phoneInput);
        setBusy(false);
        if (result.error) toast.error(result.error);
        else {
            setOtpStage('code');
            toast.success('Code sent — check your phone');
        }
    };

    const verifyCode = async () => {
        setBusy(true);
        const result = await confirmPhoneOtp(codeInput);
        setBusy(false);
        if (result.error) toast.error(result.error);
        else {
            toast.success('Phone verified');
            setOtpStage('idle');
            setCodeInput('');
        }
    };

    const handleRemovePhone = async () => {
        setBusy(true);
        const result = await removePhone();
        setBusy(false);
        if (result.error) toast.error(result.error);
        else toast.success('Phone removed');
    };

    return (
        <div className="space-y-10">
            {/* Channel preferences */}
            <section className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-foreground">Notifications</h2>
                <div className="bg-secondary/30 border border-border/40 rounded-2xl divide-y divide-border/40">
                    <div className="grid grid-cols-[1fr_4rem_4rem] gap-2 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                        <span />
                        <span className="text-center">Email</span>
                        <span className="text-center">Text</span>
                    </div>
                    {ROWS.map(({ key, label, hint }) => (
                        <div key={key} className="grid grid-cols-[1fr_4rem_4rem] gap-2 px-5 py-4 items-center">
                            <div>
                                <p className="font-medium text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground">{hint}</p>
                            </div>
                            <div className="text-center">
                                <input
                                    type="checkbox"
                                    checked={prefs[`${key}Email` as keyof Prefs]}
                                    onChange={() => toggle(`${key}Email` as keyof Prefs)}
                                    className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
                                />
                            </div>
                            <div className="text-center">
                                <input
                                    type="checkbox"
                                    checked={prefs[`${key}Sms` as keyof Prefs]}
                                    onChange={() => toggle(`${key}Sms` as keyof Prefs)}
                                    disabled={!canSms}
                                    title={canSms ? undefined : 'Verify your phone number below first'}
                                    className="w-5 h-5 rounded border-border accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                    {saving ? 'Saving…' : 'Save preferences'}
                </button>
            </section>

            {/* Phone verification */}
            <section className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-foreground">Text messages</h2>
                {phone && phoneVerified ? (
                    <div className="bg-secondary/30 border border-border/40 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="font-medium text-foreground">{phone}</p>
                            <p className="text-xs text-muted-foreground">Verified</p>
                        </div>
                        <button
                            onClick={handleRemovePhone}
                            disabled={busy}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                            Remove
                        </button>
                    </div>
                ) : !smsAvailable ? (
                    <p className="text-sm text-muted-foreground bg-secondary/30 border border-border/40 rounded-2xl p-5">
                        Text notifications are coming soon.
                    </p>
                ) : (
                    <div className="bg-secondary/30 border border-border/40 rounded-2xl p-5 space-y-4">
                        {otpStage === 'idle' ? (
                            <>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="tel"
                                        placeholder="(555) 555-5555"
                                        value={phoneInput}
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                                    />
                                    <button
                                        onClick={requestCode}
                                        disabled={busy || !phoneInput.trim()}
                                        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {busy ? 'Sending…' : 'Send code'}
                                    </button>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    By verifying your number you agree to receive the text notifications you
                                    enable above from The B Life. Msg &amp; data rates may apply, frequency
                                    varies. Reply STOP to opt out, HELP for help. See our{' '}
                                    <a href="/sms" className="underline underline-offset-2 hover:text-foreground">
                                        opt-in details
                                    </a>.
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="6-digit code"
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground tracking-widest"
                                />
                                <button
                                    onClick={verifyCode}
                                    disabled={busy || codeInput.trim().length !== 6}
                                    className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {busy ? 'Verifying…' : 'Verify'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
