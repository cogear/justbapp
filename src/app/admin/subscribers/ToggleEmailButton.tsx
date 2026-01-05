'use client';

import { useState } from 'react';
import { toggleSubscriberEmailStatus } from './actions';
import { Ban, CheckCircle } from 'lucide-react';

interface ToggleEmailButtonProps {
    userId: string;
    currentStatus: boolean;
    userEmail: string;
}

export function ToggleEmailButton({ userId, currentStatus, userEmail }: ToggleEmailButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        const action = currentStatus ? 'disable' : 'enable';
        if (!confirm(`Are you sure you want to ${action} emails for ${userEmail}?`)) {
            return;
        }

        setIsLoading(true);
        const result = await toggleSubscriberEmailStatus(userId, currentStatus);

        if (result.success) {
            window.location.reload(); // Refresh to show updated status
        } else {
            alert(`Failed to update status: ${result.error}`);
        }
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${currentStatus
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
        >
            {currentStatus ? (
                <>
                    <Ban size={12} />
                    Disable
                </>
            ) : (
                <>
                    <CheckCircle size={12} />
                    Enable
                </>
            )}
        </button>
    );
}
