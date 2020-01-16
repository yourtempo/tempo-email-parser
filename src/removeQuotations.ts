import { isText, isImage, toArray, isEmptyish } from './cheerio-utils';
import findQuoteString from './findQuoteString';

/**
 * Remove quotations (replied messages) and signatures from the HTML
 */
function removeQuotations($: CheerioStatic): { didFindQuotation: boolean } {
	let didFindQuotation = false;

	// Remove blockquote elements
	const quoteElements = findAllQuotes($);
	didFindQuotation = didFindQuotation || quoteElements.length > 0;
	quoteElements.each((i, el) => $(el).remove());

	// When all blockquotes are removed, remove any remaining quote header text
	const remainingQuoteNodes = findQuoteString($);
	didFindQuotation = didFindQuotation || remainingQuoteNodes.length > 0;
	remainingQuoteNodes.forEach(el => $(el).remove());

	return { didFindQuotation };
}

/**
 * Returns a selection of all quote elements that should be removed
 */
function findAllQuotes($: CheerioStatic): Cheerio {
	const quoteElements: Cheerio = $(
		[
			'.gmail_quote',
			'blockquote',
			// Signatures.
			'.gmail_signature',
			'signature',
			// ENHANCEMENT: Add findQuotesAfterMessageHeaderBlock
			// ENHANCEMENT: Add findQuotesAfter__OriginalMessage__
		].join(', ')
	);

	// Ignore inline quotes. Quotes that are followed by non-quote blocks.
	const quoteElementsSet = new Set(toArray(quoteElements));
	const withoutInlineQuotes = quoteElements.filter(
		(i, el) => !isInlineQuote(el, quoteElementsSet)
	);

	return withoutInlineQuotes;
}

/**
 * Returns true if the element looks like an inline quote:
 * it is followed by unquoted elements
 *
 * Works best if non-meaningful content were stripped before, like tracking pixels.
 *
 * Based on
 * https://github.com/Foundry376/Mailspring/blob/aa125f0136c093e0aa3deb7c46bb6433f6ede6b9/app/src/services/quoted-html-transformer.ts#L228:L228
 */
function isInlineQuote(
	el: CheerioElement,
	quoteSet: Set<CheerioElement>
): boolean {
	const seen = new Set();
	let head = el;

	while (head) {
		// advance to the next sibling, or the parent's next sibling
		while (head && !head.nextSibling) {
			head = head.parentNode;
		}
		if (!head) {
			break;
		}
		head = head.nextSibling;

		// search this branch of the tree for any text nodes / images that
		// are not contained within a matched quoted text block. We mark
		// the subtree as "seen" because we traverse upwards, and would
		// re-evaluate the subtree on each iteration otherwise.
		const pile = [head];
		let node = null;

		while ((node = pile.pop())) {
			if (seen.has(node)) {
				continue;
			}
			if (quoteSet.has(node)) {
				continue;
			}
			if (node.childNodes) {
				pile.push(...node.childNodes);
			}
			if (isImage(node)) {
				return true;
			}
			if (isText(node) && !isEmptyish(node)) {
				return true;
			}
		}
		seen.add(head);
	}

	return false;
}

export default removeQuotations;
