import {
	isDocument,
	isText,
	isEmpty,
	hasChildren,
	containsEmptyText,
	getTopLevelElement,
} from './cheerioUtils';

/**
 * Remove quotations (replied messages) from the HTML
 */
function removeQuotations(
	$: CheerioStatic
): // True if quotes were removed
boolean {
	const backup = $.root().clone();

	let didFindQuote = false;

	// remove blockquote elements, images used for tracking
	// read receipts, etc. from the DOM
	const nodesToRemove = getNodesToRemove($);
	didFindQuote = didFindQuote || nodesToRemove.length > 0;
	nodesToRemove.each(el => $(el).remove());

	// when all blockquotes are removed, remove any trailing
	// strings that should not be included
	const remainingQuoteNodes = findQuoteNodesByString($);
	didFindQuote = didFindQuote || remainingQuoteNodes.length > 0;
	remainingQuoteNodes.forEach(el => $(el).remove());

	// if the actions above have resulted in an empty body,
	// then we should not remove any elements
	if (containsEmptyText(getTopLevelElement($))) {
		// Restore everything
		$.root().replaceWith(backup);
		return false;
	}

	return didFindQuote;
}

/**
 * Get all quoted elements from an HTML message
 */
function getNodesToRemove($: CheerioStatic): Cheerio {
	const GMAIL_QUOTES = '.gmail_quote';
	const BLOCKQUOTES = 'blockquote';
	const SIGNATURES = '.gmail_signature, signature';

	return $([GMAIL_QUOTES, BLOCKQUOTES, SIGNATURES].join(', '));
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
