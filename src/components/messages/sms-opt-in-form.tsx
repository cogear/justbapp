'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { sendPhoneOtp, confirmPhoneOtp } from '@/app/messages/settings/actions';
import { BUSINESS } from '@/lib/business';

/**
 * Public SMS opt-in form. Renders the phone-number field and the full opt-in
 * disclosure for everyone (this is the consent UI carriers review for 10DLC).
 *
 * - Signed-out visitors see the complete form + language; the CTA routes them to
 *   create/sign in to an account, where the opt-in is completed and confirmed by
 *   a one-time code (verified consent).
 * - Signed-in members can opt in inline: enter number → receive a 6-digit code →
 *   confirm.
 */
export function SmsOptInForm({
    signedIn,
    smsAvailable,
}: {
    signedIn: boolean;
    smsAvailable: boolean;
}) {
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    const [code, setCode] = useState('');
    const [stage, setStage] = useState<'enter' | 'code'>('enter');
    const [busy, setBusy] = useState(false);

    const canSubmit = consent && phone.trim().length > 0 && !busy;

    const requestCode = async () => {
        setBusy(true);
        const result = await sendPhoneOtp(phone);
        setBusy(false);
        if (result.error) toast.error(result.error);
        else {
            setStage('code');
            toast.success('Code sent — check your phone');
        }
    };

    const verifyCode = async () => {
        setBusy(true);
        const result = await confirmPhoneOtp(code);
        setBusy(false);
        if (result.error) toast.error(result.error);
        else {
            toast.success('You’re opted in. Manage texts anytime in Settings.');
            setStage('enter');
            setCode('');
        }
    };

    return (
        <div className="rounded-3xl border border-border/50 bg-secondary/20 p-6 md:p-8 space-y-5">
            <h2 className="text-xl font-serif font-bold text-foreground">Sign up for text updates</h2>

            {stage === 'enter' ? (
                <>
                    <label htmlFor="sms-phone" className="block text-sm font-medium text-foreground">
                        Mobile phone number
                    </label>
                    <input
                        id="sms-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(555) 555-5555"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                    />

                    <label className="flex gap-3 items-start text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer shrink-0"
                        />
                        <span>
                            By checking this box and providing your mobile number, you agree to receive
                            recurring automated text messages from {BUSINESS.brandName} (account verification
                            codes, direct-message alerts, event reminders, and occasional announcements) at the
                            number provided. Consent is not a condition of purchase. Message frequency varies.
                            Message and data rates may apply. Reply STOP to unsubscribe or HELP for help. See
                            our{' '}
                            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
                                Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                                Terms of Service
                            </Link>.
                        </span>
                    </label>

                    {signedIn && smsAvailable ? (
                        <button
                            onClick={requestCode}
                            disabled={!canSubmit}
                            className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {busy ? 'Sending…' : 'Send verification code'}
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                href="/handler/sign-in?after_auth_return_to=/messages/settings"
                                aria-disabled={!consent}
                                className={`inline-block w-full sm:w-auto text-center px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-all ${
                                    consent ? 'hover:bg-primary/90' : 'opacity-40 pointer-events-none'
                                }`}
                            >
                                Sign in to opt in
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                A free {BUSINESS.brandName} account is required so we can verify the number
                                belongs to you. Opt-in is completed and confirmed in your notification settings.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code we just sent to {phone}.
                    </p>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-3 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground tracking-widest"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={verifyCode}
                            disabled={busy || code.trim().length !== 6}
                            className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40"
                        >
                            {busy ? 'Verifying…' : 'Confirm opt-in'}
                        </button>
                        <button
                            onClick={() => setStage('enter')}
                            className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Back
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
