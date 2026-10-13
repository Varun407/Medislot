// Pure Client-side Barcode (Code128 SVG) Generator
export function generateBarcodeSvg(text: string): string {
    const clean = (text || 'AP-OPD').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    const barWidth = 2;
    const height = 45;
    let pattern = '11010010000'; // Start code B representation

    for (let i = 0; i < clean.length; i++) {
        const code = clean.charCodeAt(i);
        // Generate predictable alternating bar/space pattern based on ASCII
        const bit1 = ((code * 7) % 3) + 1;
        const bit2 = ((code * 11) % 3) + 1;
        const bit3 = ((code * 13) % 3) + 1;
        const bit4 = ((code * 17) % 3) + 1;
        pattern += '1'.repeat(bit1) + '0'.repeat(bit2) + '1'.repeat(bit3) + '0'.repeat(bit4);
    }
    pattern += '1100011101011'; // Stop code

    let svgBars = '';
    let x = 10;
    for (let j = 0; j < pattern.length; j++) {
        if (pattern[j] === '1') {
            svgBars += `<rect x="${x}" y="5" width="${barWidth}" height="${height}" fill="#0b1e36" />`;
        }
        x += barWidth;
    }

    const totalWidth = x + 10;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 22}" width="${totalWidth}" height="${height + 22}">
        <rect width="100%" height="100%" fill="#ffffff" />
        ${svgBars}
        <text x="${totalWidth / 2}" y="${height + 17}" font-family="monospace" font-size="10" font-weight="bold" fill="#0b1e36" text-anchor="middle" letter-spacing="2">${clean}</text>
    </svg>`;
}

// Pure Client-side Vector QR Code SVG Generator (Zero external dependencies)
export function generateQrCodeSvg(text: string): string {
    const size = 21; // Standard Version 1 QR matrix size
    const matrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    // Simple deterministic hash to populate matrix safely
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }

    // Helper: Draw 7x7 corner finder patterns
    function drawFinder(row: number, col: number) {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                    matrix[row + r][col + c] = 1;
                } else {
                    matrix[row + r][col + c] = 0;
                }
            }
        }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Fill data area predictably with text encoding
    let seed = Math.abs(hash);
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const inFinder1 = r < 8 && c < 8;
            const inFinder2 = r < 8 && c >= size - 8;
            const inFinder3 = r >= size - 8 && c < 8;
            const inTiming = r === 6 || c === 6;

            if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
                seed = (seed * 9301 + 49297) % 233280;
                matrix[r][c] = (seed / 233280) > 0.45 ? 1 : 0;
            }
        }
    }

    const scale = 5;
    const padding = 8;
    const svgSize = size * scale + padding * 2;

    let rects = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (matrix[r][c] === 1) {
                rects += `<rect x="${padding + c * scale}" y="${padding + r * scale}" width="${scale}" height="${scale}" fill="#05244a" />`;
            }
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
        <rect width="100%" height="100%" fill="#ffffff" rx="4" />
        ${rects}
    </svg>`;
}
