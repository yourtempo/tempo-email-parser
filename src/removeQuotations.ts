import cheerio from 'cheerio';
import getTopLevelElement from './getTopLevelElement';
import { isDocument, isText, isEmpty, hasChildren } from './cheerioUtils';

/**
 * Remove quotations (replied messages) from the HTML
 */
function removeQuotations(
	emailHtml: string
): {
	body: string;
	// True if quotes were removed
	didFindQuote: boolean;
} {
	const $ = cheerio.load(emailHtml);

	let didFindQuote = false;

	// remove blockquote elements, images used for tracking
	// read receipts, etc. from the DOM
	const nodesToRemove = getNodesToRemove($);
	didFindQuote = didFindQuote || nodesToRemove.length > 0;
	nodesToRemove.each(el => $(el).remove());

	// when all blockquotes are removed, remove any trailing
	// strings that should not be included
	for (const el of findQuoteByString(doc)) {
		if (el) {
			didFindQuote = true;
			el.remove();
		}
	}

	// if the actions above have resulted in an empty body,
	// then we should not hide any elements and render the
	// full body
	if (
		!doc.body ||
		!doc.children[0] ||
		doc.body.textContent.trim().length === 0
	) {
		return {
			body: convertToDOM(html).body.innerHTML,
			didFindQuote: false,
		};
	}

	// remove any trailing whitespace at the bottom of the message
	removeWhitespace(doc);

	return { body: doc.body.innerHTML, didFindQuote };
}

/**
 * Convert string/html to DOM Node
 * @param {String} text
 */
const convertToDOM = text => {
	const domParser = new DOMParser();
	let doc;
	try {
		doc = domParser.parseFromString(text, 'text/html');
	} catch (error) {
		const errText = `Error parsing HTML: ${error.toString()}`;
		doc = domParser.parseFromString(errText, 'text/html');
	}

	return doc;
};

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
 * @param {DOM Document} doc
 */
const removeWhitespace = doc => {
	if (!doc.body) return;

	// Loop down the tree and get the last child of the last child.
	let lastOfLast = doc.body;
	while (lastOfLast.lastElementChild) {
		lastOfLast = lastOfLast.lastElementChild;
	}

	// Move up the tree starting at the bottom
	const removeTrailingWhitespaceChildren = el => {
		while (el.lastChild) {
			const child = el.lastChild;
			// Node.TEXT_NODE = The actual Text inside an Element or Attr.
			if (child.nodeType === Node.TEXT_NODE) {
				if (
					child.textContent.trim() === '' ||
					child.textContent.trim() === '--'
				) {
					child.remove();
					continue;
				}
			}
			if (['BR', 'P', 'DIV', 'SPAN', 'HR'].includes(child.nodeName)) {
				removeTrailingWhitespaceChildren(child);
				if (
					child.childElementCount === 0 &&
					child.textContent.trim() === ''
				) {
					child.remove();
					continue;
				}
			}
			break;
		}
	};

	while (lastOfLast.parentElement) {
		lastOfLast = lastOfLast.parentElement;
		removeTrailingWhitespaceChildren(lastOfLast);
	}
};

/**
 * @param {String} html
 * @returns {NodeList} of style elements
 */
exports.getStyles = html => {
	const doc = convertToDOM(html);
	return doc.querySelectorAll('style');
};

/**
 * Loop through doc DOM-element starting from the bottom and search for a string like:
 * "On Friday, 27 November 2015, Your Tempo <contact@yourtempo.co> wrote:"
 * When found, this should be excluded from the initial message
 */
function findQuoteByString($: CheerioStatic) {
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
