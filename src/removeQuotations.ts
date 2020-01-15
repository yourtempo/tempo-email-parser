import {
	isDocument,
	isText,
	isEmpty,
	hasChildren,
	getTopLevelElement,
	isImage,
	toArray,
	isEmptyish,
} from './cheerio-utils';

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
	const remainingQuoteNodes = findQuoteNodesByString($);
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
function findQuoteNodesByString($: CheerioStatic): CheerioElement[] {
	const nodesToRemove: CheerioElement[] = [];

	// If we have seen a "... wrote:" yet
	let seenQuoteHeaderEnd = false;

	const isQuoteHeaderEnd = (el: CheerioElement) =>
		/wrote:\s*$/gim.test(el.nodeValue);

	const isQuoteHeaderStart = (el: CheerioElement) =>
		/On \S/gim.test(el.nodeValue);

	const findQuote = (el: CheerioElement): void => {
		// TODO: We are not looping through nodes like Mailspring does
		// https://github.com/Foundry376/Mailspring/blob/aa125f0136c093e0aa3deb7c46bb6433f6ede6b9/app/src/services/quote-string-detector.ts#L20:L20

		// loop through childNodes backwards
		for (let i = el.children.length - 1; i >= 0; i--) {
			const child = el.children[i];

			if (isDocument(child)) {
				continue;
			}

			if (isText(child)) {
				if (isEmpty(child)) {
					continue;
				}

				if (!seenQuoteHeaderEnd) {
					if (isQuoteHeaderEnd(child)) {
						nodesToRemove.push(child);
						seenQuoteHeaderEnd = true;

						// Check if On... + wrote... are in the same node...
						if (isQuoteHeaderStart(child)) {
							// We're done. Stop iterating
							break;
						} else {
							continue;
						}
					} else {
						// That's some message body text. Stop iterating
						break;
					}
				} else {
					// We are inside the quote header. So we remove everything
					nodesToRemove.push(child);
					// Until we reach the start of the header
					if (isQuoteHeaderStart(child)) {
						break;
					} else {
						continue;
					}
				}
			} else {
				// Not a text
				if (!seenQuoteHeaderEnd && hasChildren(child)) {
					findQuote(child);
					break;
				} else {
					continue;
				}
			}
		}
	};

	findQuote(getTopLevelElement($));

	return nodesToRemove;
}

export default removeQuotations;
