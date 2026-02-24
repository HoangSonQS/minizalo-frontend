export function formatTime(isoString: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
        if (diffHours < 1) {
            const diffMin = Math.round(diffMs / (1000 * 60));
            if (diffMin < 1) return "Vừa xong";
            return `${diffMin} phút`;
        }
        return `${Math.floor(diffHours)} giờ`;
    }

    // Check if same week
    const dayOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    if (diffHours < 24 * 7) {
        return dayOfWeek[date.getDay()];
    }

    return `${date.getDate()}/${date.getMonth() + 1}`;
}
