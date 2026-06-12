'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { inviteMember } from '@/app/community/invite-actions';
import { UserPlus, X } from 'lucide-react';

/** Inline (dialog-free) invite form for a space. */
export function InviteMemberForm({ spaceId }: { spaceId: string }) {
    const [open, setOpen] = useState(false);
    const [contact, setContact] = useState('');
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;

        setSending(true);
        const result = await inviteMember(spaceId, contact, note || undefined);
        setSending(false);

        if ('error' in result && result.error) {
            toast.error(result.error);
            return;
        }
        if ('kind' in result) {
            toast.success(
                result.kind === 'dm_sent'
                    ? 'They are already on The B Life — we sent them a message instead.'
                    : 'Invitation sent.'
            );
            setContact('');
            setNote('');
            setOpen(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-foreground text-sm font-medium hover:bg-secondary transition-all"
            >
                <UserPlus size={16} />
                Invite someone
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-secondary/30 border border-border/40 rounded-2xl p-5 space-y-3 max-w-md animate-in fade-in slide-in-from-top-2 duration-300"
        >
            <div className="flex items-center justify-between">
                <p className="font-medium text-foreground text-sm">Invite someone to this space</p>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
                    aria-label="Close invite form"
                >
                    <X size={16} />
                </button>
            </div>
            <input
                type="text"
                placeholder="Their email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={sending}
                className="w-full px-4 py-2.5 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm disabled:opacity-50"
            />
            <input
                type="text"
                placeholder="A short personal note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
                disabled={sending}
                className="w-full px-4 py-2.5 rounded-full bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm disabled:opacity-50"
            />
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-muted-foreground">
                    One quiet invitation — never a follow-up.
                </p>
                <button
                    type="submit"
                    disabled={sending || !contact.trim()}
                    className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                    {sending ? 'Sending…' : 'Send invite'}
                </button>
            </div>
        </form>
    );
}
