import {
	isDocument,
	isText,
	isEmpty,
	hasChildren,
	getTopLevelElement,
} from './cheerioUtils';

/**
 * Remove quotations (replied messages) and signatures from the HTML
 */
function removeQuotations(
	$: CheerioStatic
): { didFindSignature: boolean; didFindQuotation: boolean } {
	let didFindQuotation = false;
	let didFindSignature = false;

	// Remove blockquote elements
	const quotes = findQuoteBlocks($);
	didFindQuotation = didFindQuotation || quotes.length > 0;
	quotes.each((i, el) => $(el).remove());

	// Remove signatures
	const signatures = findSignatureBlocks($);
	didFindSignature = didFindSignature || signatures.length > 0;
	signatures.each((i, el) => $(el).remove());

	// When all blockquotes are removed, remove any remaining quote header text
	const remainingQuoteNodes = findQuoteNodesByString($);
	didFindQuotation = didFindQuotation || remainingQuoteNodes.length > 0;
	remainingQuoteNodes.forEach(el => $(el).remove());

	return { didFindQuotation, didFindSignature };
}

/**
 * Get all quoted elements from an HTML message
 */
function findQuoteBlocks($: CheerioStatic): Cheerio {
	return $('.gmail_quote, blockquote');
}

/**
 * Get all signature elements from an HTML message
 */
function findSignatureBlocks($: CheerioStatic): Cheerio {
	return $('.gmail_signature, signature');
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
