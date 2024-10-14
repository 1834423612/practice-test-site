export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatRationale(rationale: string): string {
    if (!rationale) return '';

    const parts = rationale.split(/Choice [A-D] is /);
    let formattedRationale = '<div class="space-y-4">';

    parts.forEach((part, index) => {
        if (index === 0) {
            formattedRationale += `<p class="font-semibold">${part.trim()}</p>`;
        } else {
            const choiceLetter = String.fromCharCode(64 + index);
            formattedRationale += `
            <div class="pl-4 border-l-4 ${index === 1 ? 'border-green-500' : 'border-red-500'}">
                <p><span class="font-semibold">Choice ${choiceLetter} is </span>${part.trim()}</p>
            </div>
        `;
        }
    });

    formattedRationale += '</div>';
    return formattedRationale;
}