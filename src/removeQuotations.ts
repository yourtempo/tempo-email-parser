import {
	isDocument,
	isText,
	isEmpty,
	getTopLevelElement,
	isImage,
	toArray,
	isEmptyish,
} from './cheerio-utils';
import walkBackwards from './walkBackwards';

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

/**
 * Loop through doc DOM-element starting from the bottom and search for a string like:
 * "On Friday, 27 November 2015, Your Tempo <contact@yourtempo.co> wrote:"
 * When found, this should be excluded from the initial message
 */
function findQuoteString($: CheerioStatic): CheerioElement[] {
	const isQuoteHeaderEnd = (el: CheerioElement) =>
		/wrote:\s*$/gim.test(el.nodeValue);

	const isQuoteHeaderStart = (el: CheerioElement) =>
		/On \S/gim.test(el.nodeValue);

	const nodesToRemove: CheerioElement[] = [];

	// If we have seen a "... wrote:" yet
	let seenQuoteHeaderEnd = false;

	const top = getTopLevelElement($);

	// loop through childNodes backwards
	for (const el of walkBackwards(top)) {
		if (isDocument(el)) {
			continue;
		}

		if (isText(el)) {
			if (isEmpty(el)) {
				// Ignore empty texts
				continue;
			}

			if (!seenQuoteHeaderEnd) {
				if (isQuoteHeaderEnd(el)) {
					seenQuoteHeaderEnd = true;
					nodesToRemove.push(el);

					// Check if On... + wrote... are in the same node...
					if (isQuoteHeaderStart(el)) {
						// We're done. Stop iterating
						break;
					} else {
						continue;
					}
				} else {
					// We have reached content. Stop iterating
					break;
				}
			} else {
				// We are inside the quote header. So we remove everything
				nodesToRemove.push(el);
				// Until we reach the start of the header
				if (isQuoteHeaderStart(el)) {
					// This node is also the start of the header. We're done
					break;
				} else {
					continue;
				}
			}
		} else {
			// It's not a text
			if (seenQuoteHeaderEnd) {
				// It's inside the quote
				nodesToRemove.push(el);
			}
			continue;
		}
	}

	return nodesToRemove;
}

export default removeQuotations;
