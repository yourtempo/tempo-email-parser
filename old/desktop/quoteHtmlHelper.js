exports.removeQuotedHtml = html => {
	const doc = convertToDOM(html);

	// keep tracking of whether nodes have been removed
	let hasRemovedNodes = false;

	// remove blockquote elements, images used for tracking
	// read receipts, etc. from the DOM
	for (const el of getNodesToRemove(doc)) {
		if (el) {
			hasRemovedNodes = true;
			el.remove();
		}
	}

	// when all blockquotes are removed, remove any trailing
	// strings that should not be included
	for (const el of findQuoteByString(doc)) {
		if (el) {
			hasRemovedNodes = true;
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
			html: convertToDOM(html).body.innerHTML,
			hasRemovedNodes: false,
		};
	}

	// remove any trailing whitespace at the bottom of the message
	removeWhitespace(doc);

	return { html: doc.body.innerHTML, hasRemovedNodes };
};

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
 * @param {DOM Document} doc
 * @returns {Array}
 */
const getNodesToRemove = doc => {
	let quoteElements = [];

	quoteElements = quoteElements.concat(findGmailQuotes(doc));
	quoteElements = quoteElements.concat(findBlockQuotes(doc));
	quoteElements = quoteElements.concat(findUnwrappedSignature(doc));
	quoteElements = quoteElements.concat(findTrackers(doc));
	quoteElements = quoteElements.concat(findSignatureElements(doc));

	return quoteElements;
};

/**
 * @param {DOM Document} doc
 * @returns {Array}
 */
const findGmailQuotes = doc => {
	return Array.from(doc.querySelectorAll('.gmail_quote'));
};

/**
 * @param {DOM Document} doc
 * @returns {Array}
 */
const findBlockQuotes = doc => {
	return Array.from(doc.querySelectorAll('blockquote'));
};

/**
 * @param {DOM Document} doc
 * @returns {Array}
 */
const findUnwrappedSignature = doc => {
	// loop through elements starting at the bottom of the doc
	return Array.from(doc.querySelectorAll('.gmail_signature'));
};

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
 * Collect all img DOM elements that are used for tracking
 * @param {DOM Document} doc
 * @returns {Array}
 */
const findTrackers = doc => {
	if (!doc.body) return;

	const trackerElements = Array.from(
		doc.querySelectorAll(
			'img[width="0"], img[height="0"], img[width="1"], img[height="1"], img[src*="http://mailstat.us"]'
		)
	);

	return trackerElements;
};

/**
 * @param {DOM Document} doc
 * @returns {Array}
 */
const findSignatureElements = doc => {
	if (!doc.body) return;
	return Array.from(doc.querySelectorAll('signature'));
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
 * @param {DOM Document} doc
 * @description
 * Loop through doc DOM-element starting from the bottom and search for a string like:
 * "On Friday, 27 November 2015, Your Tempo <contact@yourtempo.co> wrote:"
 * When found, this should be excluded from the initial message
 */
function findQuoteByString(doc) {
	const nodesToRemove = [];
	let foundWrote = false;

	const findQuote = el => {
		// loop through childNodes backwards
		for (let i = el.childNodes.length - 1; i >= 0; i--) {
			const node = el.childNodes[i];

			if (node.nodeType === Node.DOCUMENT_NODE) {
				continue;
			}

			if (
				node.nodeType === Node.TEXT_NODE &&
				node.nodeValue.trim().length > 0
			) {
				if (!foundWrote) {
					if (/wrote:\s*$/gim.test(node.nodeValue)) {
						nodesToRemove.push(node);
						foundWrote = true;

						// Check if On... + wrote... are in the same node...
						if (/On \S/gim.test(node.nodeValue)) {
							return nodesToRemove;
						}
					} else {
						return nodesToRemove;
					}
				} else {
					nodesToRemove.push(node);
					// Check if beginning of quote
					if (/On \S/gim.test(node.nodeValue)) {
						return nodesToRemove;
					}
				}
			} else {
				if (!foundWrote && node.childNodes.length > 0) {
					findQuote(node);
				}
			}
		}

		return nodesToRemove;
	};

	findQuote(doc.body);
	return nodesToRemove;
}
