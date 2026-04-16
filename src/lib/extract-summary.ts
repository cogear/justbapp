export function extractSummary(content: string | null): string {
    if (!content) return '';
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
            return line.replace(/^\*+|\*+$/g, '');
        }
    }
    for (const line of lines) {
        if (line.startsWith('## ')) {
            return line.replace(/^##\s+/, '');
        }
    }
    for (const line of lines) {
        if (!line.startsWith('#') && !line.startsWith('*') && line.length > 20) {
            return line.length > 150 ? line.substring(0, 147) + '...' : line;
        }
    }
    return '';
}
