import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PdfExportOptions {
	reportEl: HTMLElement;
	toolName: string;
	source: string;
	filenamePrefix: string;
}

// html2canvas-pro renders from a cloned document, and on production this site's
// design tokens (--mt-paper: rgb(var(--paper)), color-mix(), etc.) don't reliably
// re-resolve inside that clone's own stylesheet cascade — the clone comes back
// with no backgrounds/borders/colors even though the live page renders correctly
// and the stylesheet itself loads fine. Baking each node's already-resolved
// computed style onto its clone sidesteps the clone's CSS engine entirely: every
// value here came from the real, correctly-themed page.
//
// Only a curated property list is copied, not the full ~300-entry computed
// style — copying everything for every node in a large report took long enough
// that navigator.userActivation expired before pdf.save() ran, so Chrome
// silently dropped the download (no error, no file). This list covers what
// actually affects a card/table-based report's appearance.
const BAKED_PROPS = [
	'color', 'background-color', 'background-image', 'background-size', 'background-position',
	'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
	'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
	'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
	'border-radius', 'box-shadow', 'outline-color',
	'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-decoration-line',
	'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap', 'grid-template-columns',
	'width', 'height', 'min-width', 'min-height', 'max-width',
	'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
	'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
	'fill', 'stroke', 'stroke-width', 'opacity',
];

// Two passes on purpose: reading getComputedStyle() on a live node and then
// immediately writing style.cssText on another node, repeated per node down
// the tree, is a textbook layout-thrashing pattern — each write can force the
// next read to flush a synchronous reflow first. On this report's node count
// that took 45+ seconds and hung the page. Collecting every value first (all
// reads, no writes) and applying them in a second pass (all writes, no reads)
// avoids the read/write interleaving entirely.
function collectComputedStyles(original: Element, out: string[]): void {
	const computed = getComputedStyle(original);
	let cssText = '';
	for (const prop of BAKED_PROPS) {
		const value = computed.getPropertyValue(prop);
		if (value) cssText += `${prop}:${value};`;
	}
	out.push(cssText);
	const children = original.children;
	for (let i = 0; i < children.length; i++) {
		collectComputedStyles(children[i], out);
	}
}

function applyBakedStyles(clone: Element, cssTexts: string[], cursor: { i: number }): void {
	(clone as HTMLElement).style.cssText += cssTexts[cursor.i++];
	const children = clone.children;
	for (let i = 0; i < children.length; i++) {
		applyBakedStyles(children[i], cssTexts, cursor);
	}
}

function bakeComputedStyles(original: Element, clone: Element) {
	const cssTexts: string[] = [];
	collectComputedStyles(original, cssTexts);
	applyBakedStyles(clone, cssTexts, { i: 0 });
}

function safeSlug(source: string): string {
	const cleaned = source
		.replace(/^https?:\/\//, '')
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/(^-|-$)/g, '')
		.toLowerCase()
		.slice(0, 60);
	return cleaned || 'report';
}

// Renders the live, already-styled report DOM to a canvas and slices it across
// A4 pages with a branded header/footer, instead of hand-building a parallel PDF
// layout per tool — each tool's report shape differs enough that this stays in
// sync automatically as report markup changes.
export async function exportReportToPdf({ reportEl, toolName, source, filenamePrefix }: PdfExportOptions): Promise<void> {
	// Force light theme for the capture: html2canvas clones the DOM into a
	// detached iframe, and [data-theme="dark"]-scoped custom properties don't
	// reliably survive that clone — the last attempt captured dark text on a
	// dark background. Exporting always in light mode also keeps the PDF
	// consistent and printable regardless of the visitor's current theme.
	const root = document.documentElement;
	const previousTheme = root.getAttribute('data-theme');
	root.setAttribute('data-theme', 'light');
	await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

	let canvas: HTMLCanvasElement;
	try {
		canvas = await html2canvas(reportEl, {
			backgroundColor: '#ffffff',
			scale: Math.min(2, (window.devicePixelRatio || 1) * 1.5),
			useCORS: true,
			logging: false,
			onclone: (_doc, clonedEl) => {
				bakeComputedStyles(reportEl, clonedEl);
			},
		});
	} finally {
		if (previousTheme === null) root.removeAttribute('data-theme');
		else root.setAttribute('data-theme', previousTheme);
	}

	const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
	const pageW = pdf.internal.pageSize.getWidth();
	const pageH = pdf.internal.pageSize.getHeight();
	const margin = 28;
	const headerH = 58;
	const footerH = 24;
	const contentW = pageW - margin * 2;
	const contentH = pageH - headerH - footerH - margin;

	const pxPerPt = canvas.width / contentW;
	const sliceHeightPx = Math.max(1, Math.floor(contentH * pxPerPt));
	const totalSlices = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

	const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

	function drawHeader(pageNum: number, totalPages: number) {
		pdf.setFillColor(17, 24, 39);
		pdf.rect(0, 0, pageW, headerH, 'F');
		pdf.setTextColor(255, 255, 255);
		pdf.setFont('helvetica', 'bold');
		pdf.setFontSize(14);
		pdf.text('AISEOShift', margin, 24);
		pdf.setFont('helvetica', 'normal');
		pdf.setFontSize(10);
		pdf.text(toolName, margin, 40);
		pdf.setFontSize(8);
		pdf.setTextColor(203, 213, 225);
		const truncSource = source.length > 75 ? source.slice(0, 75) + '…' : source;
		pdf.text(truncSource, margin, 52);
		pdf.setFontSize(8);
		pdf.setTextColor(255, 255, 255);
		pdf.text(dateStr, pageW - margin, 24, { align: 'right' });
		if (totalPages > 1) {
			pdf.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, 40, { align: 'right' });
		}
	}

	function drawFooter() {
		pdf.setFontSize(7.5);
		pdf.setTextColor(148, 163, 184);
		pdf.text('Generated by AISEOShift · aiseoshift.com', margin, pageH - 10);
	}

	for (let i = 0; i < totalSlices; i++) {
		if (i > 0) pdf.addPage();
		const sy = i * sliceHeightPx;
		const sh = Math.min(sliceHeightPx, canvas.height - sy);

		const sliceCanvas = document.createElement('canvas');
		sliceCanvas.width = canvas.width;
		sliceCanvas.height = sh;
		const ctx = sliceCanvas.getContext('2d')!;
		ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
		const imgData = sliceCanvas.toDataURL('image/png');

		drawHeader(i + 1, totalSlices);
		const imgH = (sh / canvas.width) * contentW;
		pdf.addImage(imgData, 'PNG', margin, headerH + 8, contentW, imgH);
		drawFooter();
	}

	const filename = `${filenamePrefix}-${safeSlug(source)}-${new Date().toISOString().slice(0, 10)}.pdf`;
	pdf.save(filename);
}
