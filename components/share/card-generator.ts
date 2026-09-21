import { toBlob } from "html-to-image";

export interface PoemCardOptions {
    title: string;
    authorName: string;
    verses: string[];
    collectionTitle?: string;
    publicationYear?: number | null;
    url?: string;
    element?: HTMLElement | null;
}

/**
 * Découpe une ligne de texte si elle dépasse la largeur maximale
 */
function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
}

/**
 * Nettoie et formate élégamment le recueil et l'année sans répétition ni guillemets superflus
 */
function formatCollectionAndYear(
    collectionTitle?: string,
    publicationYear?: number | null
): string | null {
    if (!collectionTitle && !publicationYear) return null;

    let cleanCollection = collectionTitle?.trim();
    if (cleanCollection) {
        cleanCollection = cleanCollection.replace(/^[«"'\s]+|[»"'\s]+$/g, "");
        if (publicationYear) {
            cleanCollection = cleanCollection.replace(
                new RegExp(`\\s*\\(${publicationYear}\\)$`),
                ""
            );
        }
    }

    const parts: string[] = [];
    if (cleanCollection) parts.push(cleanCollection);
    if (publicationYear) parts.push(String(publicationYear));

    return parts.join("  •  ");
}

/**
 * Dessine le logo calligraphique manuscrit officiel d'Ode
 */
function drawOdeLogo(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    targetWidth = 240
) {
    const pathO = new Path2D(
        "M 360 140 C 320 80, 240 120, 250 230 C 260 340, 350 350, 380 270 C 395 210, 375 160, 355 160 C 335 160, 330 200, 350 240 C 360 260, 380 270, 410 250"
    );
    const pathDE = new Path2D(
        "M 480 220 C 450 180, 410 190, 410 250 C 410 310, 460 320, 485 260 C 500 180, 510 100, 510 70 C 505 120, 495 200, 490 280 C 485 330, 520 330, 550 280 C 570 230, 550 200, 535 220 C 520 240, 525 300, 555 310 C 585 320, 620 300, 650 270"
    );

    const scale = targetWidth / 410;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-445, -210);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.stroke(pathO);
    ctx.stroke(pathDE);

    ctx.restore();
}

/**
 * Génère un Canvas 1080x1080 avec la carte poétique définitive (Édition Blanche)
 */
export async function renderPoemCardCanvas(options: PoemCardOptions): Promise<HTMLCanvasElement> {
    const {
        title,
        authorName,
        verses,
        collectionTitle,
        publicationYear,
    } = options;

    // Attente du chargement complet des polices système/web (Playfair Display)
    if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Impossible d'initialiser le contexte Canvas 2D");
    }

    // 1. Fond Crème Papier Vélin Noble
    ctx.fillStyle = "#FFFCF2";
    ctx.fillRect(0, 0, 1080, 1080);

    // Dégradé radial subtil simulant la profondeur du papier
    const paperGradient = ctx.createRadialGradient(540, 540, 120, 540, 540, 750);
    paperGradient.addColorStop(0, "rgba(255, 255, 255, 0.65)");
    paperGradient.addColorStop(1, "rgba(238, 233, 218, 0.3)");
    ctx.fillStyle = paperGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Double Filet Éditorial Gallimard (Carmin extérieur + Charbon intérieur)
    const mOuter = 38;
    ctx.strokeStyle = "rgba(184, 84, 80, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mOuter, mOuter, 1080 - mOuter * 2, 1080 - mOuter * 2);

    const mInner = 48;
    ctx.strokeStyle = "rgba(26, 26, 26, 0.16)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mInner, mInner, 1080 - mInner * 2, 1080 - mInner * 2);

    // 3. En-tête : Logo ode agrandi (targetWidth = 240)
    drawOdeLogo(ctx, 540, 130, 240);

    // 4. Zone des Vers avec Guillemets Carmin Fonctionnels
    const cleanVerses = verses.filter((v) => v.trim().length > 0);
    const totalLinesCount = cleanVerses.length || 1;

    let fontSize = 34;
    let lineHeight = 58;

    if (totalLinesCount <= 2) {
        fontSize = 42;
        lineHeight = 70;
    } else if (totalLinesCount <= 4) {
        fontSize = 34;
        lineHeight = 58;
    } else if (totalLinesCount <= 6) {
        fontSize = 28;
        lineHeight = 48;
    } else {
        fontSize = 23;
        lineHeight = 40;
    }

    ctx.font = `italic 400 ${fontSize}px "Playfair Display", Georgia, serif`;
    const quoteFont = `italic 600 ${fontSize}px "Playfair Display", Georgia, serif`;

    const maxTextWidth = 860;
    const finalLines: { text: string; isFirst: boolean; isLast: boolean }[] = [];

    for (let i = 0; i < cleanVerses.length; i++) {
        const verse = cleanVerses[i];
        const wrapped = wrapText(ctx, verse, maxTextWidth);
        for (let j = 0; j < wrapped.length; j++) {
            finalLines.push({
                text: wrapped[j],
                isFirst: i === 0 && j === 0,
                isLast: i === cleanVerses.length - 1 && j === wrapped.length - 1,
            });
        }
    }

    const contentBoxTop = 195;
    const contentBoxBottom = 755;
    const availableHeight = contentBoxBottom - contentBoxTop;
    const totalTextHeight = (finalLines.length - 1) * lineHeight;
    const startY = contentBoxTop + (availableHeight - totalTextHeight) / 2;

    ctx.textBaseline = "middle";

    for (let i = 0; i < finalLines.length; i++) {
        const line = finalLines[i];
        const y = startY + i * lineHeight;

        ctx.font = `italic 400 ${fontSize}px "Playfair Display", Georgia, serif`;
        const textWidth = ctx.measureText(line.text).width;

        ctx.font = quoteFont;
        const openQuoteWidth = line.isFirst ? ctx.measureText("«  ").width : 0;
        const closeQuoteWidth = line.isLast ? ctx.measureText("  »").width : 0;

        const totalLineWidth = openQuoteWidth + textWidth + closeQuoteWidth;
        let currentX = 540 - totalLineWidth / 2;

        if (line.isFirst) {
            ctx.font = quoteFont;
            ctx.fillStyle = "#B85450";
            ctx.textAlign = "left";
            ctx.fillText("«  ", currentX, y);
            currentX += openQuoteWidth;
        }

        ctx.font = `italic 400 ${fontSize}px "Playfair Display", Georgia, serif`;
        ctx.fillStyle = "#1A1A1A";
        ctx.textAlign = "left";
        ctx.fillText(line.text, currentX, y);
        currentX += textWidth;

        if (line.isLast) {
            ctx.font = quoteFont;
            ctx.fillStyle = "#B85450";
            ctx.textAlign = "left";
            ctx.fillText("  »", currentX, y);
        }
    }

    // 5. Bas de Carte (Colophon)
    const sepY = 790;
    ctx.strokeStyle = "rgba(26, 26, 26, 0.16)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(540 - 28, sepY);
    ctx.lineTo(540 - 8, sepY);
    ctx.stroke();

    // Point rouge carmin central
    ctx.fillStyle = "#B85450";
    ctx.beginPath();
    ctx.arc(540, sepY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(540 + 8, sepY);
    ctx.lineTo(540 + 28, sepY);
    ctx.stroke();

    // Titre
    ctx.textAlign = "center";
    ctx.fillStyle = "#1A1A1A";
    ctx.font = '600 30px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "-0.01em";

    let displayTitle = title;
    if (ctx.measureText(displayTitle).width > 800) {
        while (ctx.measureText(displayTitle + "…").width > 800 && displayTitle.length > 5) {
            displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += "…";
    }
    ctx.fillText(displayTitle, 540, 840);

    // Auteur
    ctx.fillStyle = "#8A817C";
    ctx.font = 'italic 500 23px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "0.02em";
    ctx.fillText(authorName, 540, 880);

    // Recueil & Année
    const details = formatCollectionAndYear(collectionTitle, publicationYear);
    if (details) {
        ctx.fillStyle = "rgba(138, 129, 124, 0.85)";
        ctx.font = '400 16px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = "0.03em";
        ctx.fillText(details, 540, 915);
    }

    return canvas;
}

/**
 * Exporte la carte poétique en Blob PNG haute résolution (identique 1:1 à l'aperçu DOM)
 */
export async function generatePoemCardBlob(options: PoemCardOptions): Promise<Blob> {
    const el =
        options.element ||
        (typeof document !== "undefined"
            ? (document.getElementById("poem-card-preview") as HTMLElement)
            : null);

    if (el) {
        try {
            if (typeof document !== "undefined" && document.fonts) {
                await document.fonts.ready;
            }

            const w = el.offsetWidth || 370;
            const h = el.offsetHeight || 370;
            const pixelRatio = 1080 / w;

            const blob = await toBlob(el, {
                width: w,
                height: h,
                style: {
                    margin: "0",
                    marginTop: "0",
                    marginBottom: "0",
                    marginLeft: "0",
                    marginRight: "0",
                    transform: "none",
                    boxShadow: "none",
                },
                pixelRatio,
                quality: 1.0,
                cacheBust: false,
            });

            if (blob) {
                console.log("HTML_TO_IMAGE_BLOB_SUCCESS, size:", blob.size, "type:", blob.type);
                return blob;
            }
        } catch (err) {
            console.error(
                "HTML_TO_IMAGE_ERROR, fallback to Canvas:",
                err
            );
        }
    }

    // Repli de secours : rendu Canvas 2D
    const canvas = await renderPoemCardCanvas(options);
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Échec de la conversion du canvas en image Blob"));
                }
            },
            "image/png",
            1.0
        );
    });
}

/**
 * Déclenche le téléchargement local du fichier PNG
 */
export function downloadPoemCard(blob: Blob, filename = "ode-poeme.png") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copie l'image PNG directement dans le presse-papiers système
 */
export async function copyPoemCardToClipboard(blob: Blob): Promise<boolean> {
    try {
        if (typeof navigator !== "undefined" && navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            return true;
        }
        return false;
    } catch (err) {
        console.warn("Impossible de copier l'image dans le presse-papiers:", err);
        return false;
    }
}

/**
 * Tente le partage natif (Web Share API) avec fichier image et lien
 */
export async function sharePoemCardNative(
    blob: Blob,
    title: string,
    url: string
): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.share) {
        return false;
    }

    const file = new File([blob], "poeme-ode.png", { type: "image/png" });

    // Vérifier si le navigateur accepte le partage de fichier
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: `${title} — ode`,
                text: `Découvrez "${title}" sur ode`,
                url: url,
                files: [file],
            });
            return true;
        } catch (err: any) {
            // Si l'utilisateur a juste annulé le dialogue natif
            if (err.name === "AbortError") return true;
            console.warn("Erreur lors du partage de fichier, repli sur lien seul:", err);
        }
    }

    // Repli : partage du lien sans le fichier si l'OS ne supporte pas le fichier
    try {
        await navigator.share({
            title: `${title} — ode`,
            text: `Découvrez "${title}" sur ode`,
            url: url,
        });
        return true;
    } catch {
        return false;
    }
}
