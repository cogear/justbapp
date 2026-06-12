import 'server-only';

/**
 * Extract just the new reply text from an inbound email body,
 * stripping quoted history and signatures.
 */
export function extractReplyText(raw: string): string {
    let text = raw;

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require('email-reply-parser');
        const EmailReplyParser = mod.default || mod; // ESM-interop: class lives on .default
        const parsed = new EmailReplyParser().read(raw);
        const visible = parsed.getVisibleText();
        if (visible && visible.trim()) text = visible;
    } catch (e) {
        console.error('email-reply-parser failed, falling back to heuristics:', e);
    }

    // Heuristic fallbacks / second pass for patterns the parser misses
    const cutMarkers = [
        /^On .{1,200} wrote:\s*$/m, // Gmail/Apple Mail
        /^-{2,}\s*Original Message\s*-{2,}/im, // Outlook
        /^_{10,}\s*$/m, // Outlook divider
        /^From:\s.+$/m, // Forwarded/Outlook header block
        /^Sent from my (iPhone|iPad|Android)/im,
    ];
    for (const marker of cutMarkers) {
        const match = text.match(marker);
        if (match && match.index !== undefined && match.index > 0) {
            text = text.slice(0, match.index);
        }
    }

    // Drop any remaining fully-quoted lines
    text = text
        .split('\n')
        .filter((line) => !line.startsWith('>'))
        .join('\n');

    return text.trim();
}
