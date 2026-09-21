/**
 * Moteur de rendu graphique haute fidélité pour carte poétique (1080x1080)
 * Style : Édition de Luxe / Pléiade & Gallimard (Crème, Encre & Carmin)
 */

export interface PoemCardOptions {
    title: string;
    authorName: string;
    verses: string[];
    collectionTitle?: string;
    publicationYear?: number | null;
    url?: string;
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
 * Dessine un fin losange décoratif
 */
function drawDiamond(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    color: string
) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

/**
 * Génère un Canvas 1080x1080 avec la carte poétique
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

    // Dégradé radial très subtil pour simuler la profondeur du papier
    const paperGradient = ctx.createRadialGradient(540, 540, 100, 540, 540, 750);
    paperGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    paperGradient.addColorStop(1, "rgba(238, 233, 218, 0.35)");
    ctx.fillStyle = paperGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Double Filet Éditorial (Style Gallimard / Pléiade)
    const mOuter = 46;
    const mInner = 56;

    ctx.strokeStyle = "rgba(26, 26, 26, 0.18)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mOuter, mOuter, 1080 - mOuter * 2, 1080 - mOuter * 2);

    ctx.strokeStyle = "rgba(26, 26, 26, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mInner, mInner, 1080 - mInner * 2, 1080 - mInner * 2);

    // 3. En-tête : Décoration Carmin & Mention Haute-Édition
    drawDiamond(ctx, 540, 95, 5, "#B85450");

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8A817C";
    ctx.font = '500 15px var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = "0.22em";
    ctx.fillText("ODE  •  ANTHOLOGIE POÉTIQUE", 540, 126);

    // 4. Guillemet ouvrant raffiné en carmin
    ctx.fillStyle = "#B85450";
    ctx.font = 'italic 700 72px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "0px";
    ctx.fillText("«", 540, 205);

    // 5. Zone des Vers (Adaptative)
    // Nettoyer les vers
    const cleanVerses = verses.filter((v) => v.trim().length > 0);
    const totalLinesCount = cleanVerses.length || 1;

    // Déterminer la taille de police idéale
    let fontSize = 38;
    let lineHeight = 64;

    if (totalLinesCount <= 2) {
        fontSize = 46;
        lineHeight = 74;
    } else if (totalLinesCount <= 4) {
        fontSize = 38;
        lineHeight = 62;
    } else if (totalLinesCount <= 6) {
        fontSize = 32;
        lineHeight = 52;
    } else {
        fontSize = 27;
        lineHeight = 44;
    }

    ctx.font = `italic 400 ${fontSize}px "Playfair Display", Georgia, serif`;
    ctx.fillStyle = "#1A1A1A";

    // Calculer les lignes avec retour à la ligne automatique si vers trop long (> 840px)
    const maxTextWidth = 840;
    const finalLines: string[] = [];
    for (const v of cleanVerses) {
        const wrapped = wrapText(ctx, v, maxTextWidth);
        finalLines.push(...wrapped);
    }

    // Centrage vertical harmonieux du texte dans la zone [240px .. 760px]
    const contentBoxTop = 235;
    const contentBoxBottom = 750;
    const availableHeight = contentBoxBottom - contentBoxTop;
    const totalTextHeight = (finalLines.length - 1) * lineHeight;
    let startY = contentBoxTop + (availableHeight - totalTextHeight) / 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < finalLines.length; i++) {
        ctx.fillText(finalLines[i], 540, startY + i * lineHeight);
    }

    // 6. Séparateur Élégant (Fin filet avec micro-losange carmin)
    const sepY = 790;
    ctx.strokeStyle = "rgba(26, 26, 26, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(420, sepY);
    ctx.lineTo(500, sepY);
    ctx.stroke();

    drawDiamond(ctx, 540, sepY, 4, "#B85450");

    ctx.beginPath();
    ctx.moveTo(580, sepY);
    ctx.lineTo(660, sepY);
    ctx.stroke();

    // 7. Titre du Poème & Auteur
    ctx.fillStyle = "#1A1A1A";
    ctx.font = '600 32px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "-0.01em";

    // Troncature élégante si le titre est trop long
    let displayTitle = title;
    if (ctx.measureText(displayTitle).width > 780) {
        while (ctx.measureText(displayTitle + "…").width > 780 && displayTitle.length > 5) {
            displayTitle = displayTitle.slice(0, -1);
        }
        displayTitle += "…";
    }
    ctx.fillText(displayTitle, 540, 845);

    // Auteur
    ctx.fillStyle = "#8A817C";
    ctx.font = 'italic 500 24px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "0.02em";
    ctx.fillText(authorName, 540, 890);

    // Recueil & Année (optionnel)
    if (collectionTitle || publicationYear) {
        const details = [
            collectionTitle ? `« ${collectionTitle} »` : null,
            publicationYear ? `${publicationYear}` : null,
        ]
            .filter(Boolean)
            .join("  •  ");

        ctx.fillStyle = "rgba(138, 129, 124, 0.85)";
        ctx.font = '400 16px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = "0.04em";
        ctx.fillText(details, 540, 928);
    }

    // 8. Pied de Carte : Signature Exclusive ode.
    ctx.font = '700 21px "Playfair Display", Georgia, serif';
    ctx.letterSpacing = "0.05em";

    const textOde = "ode";
    const textDot = ".";
    const wOde = ctx.measureText(textOde).width;
    const wDot = ctx.measureText(textDot).width;
    const totalBrandWidth = wOde + wDot;
    const brandStartX = 540 - totalBrandWidth / 2;

    ctx.textAlign = "left";
    ctx.fillStyle = "#1A1A1A";
    ctx.fillText(textOde, brandStartX, 995);

    ctx.fillStyle = "#B85450";
    ctx.fillText(textDot, brandStartX + wOde, 995);

    return canvas;
}

/**
 * Exporte le Canvas en Blob PNG haute résolution
 */
export async function generatePoemCardBlob(options: PoemCardOptions): Promise<Blob> {
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
