import cheerio from 'cheerio';

import removeQuotations from './removeQuotations';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';
import linkify from './linkify';
import enforceViewport from './enforceViewport';
import { blockRemoteContentCheerio } from './blockRemoteContent';
import { containsEmptyText, getTopLevelElement } from './cheerio-utils';

/**
 * Parse an HTML email and make transformation needed before displaying it to the user.
 * Returns the extracted body of the message, and the complete message for reference.
 *
 * Beside the optional, this always:
 * - Remove comments
 * - Remove scripts
 * - Remove tracking pixels
 * - Remove trailing whitespaces
 */
function prepareMessage(
	emailHtml: string,
	options: {
		// Remove quotations and signatures. Only affects the result messageHtml
		noQuotations?: boolean;
		// Automatically convert text links to anchor tags
		autolink?: boolean;
		// Enforce specific viewport for mobile "width=device-width, initial-scale=1"
		forceMobileViewport?: boolean;
		// Replace remote images with a transparent image,
		// and replace other remote URLs with '#'
		noRemoteContent?: boolean;
	} = {}
): {
	// The complete message.
	completeHtml: string;
	// The body of the message, stripped from secondary information
	messageHtml: string;
	// True if a quote or signature was found and stripped
	didFindQuotation: boolean;
} {
	const {
		noQuotations = true,
		autolink = true,
		forceMobileViewport = true,
		noRemoteContent = true,
	} = options;

	let result = {
		messageHtml: emailHtml,
		completeHtml: emailHtml,
		didFindQuotation: false,
	};

	if (autolink) {
		result.completeHtml = linkify(result.completeHtml);
		result.messageHtml = result.completeHtml;
	}

	let $ = cheerio.load(result.completeHtml);

	// Comments are useless, better remove them
	removeComments($);
	removeScripts($);
	removeTrackers($);

	if (noRemoteContent) {
		blockRemoteContentCheerio($);
	}

	if (forceMobileViewport) {
		enforceViewport($);
	}

	removeTrailingWhitespaces($);
	result.completeHtml = $.html();
	result.messageHtml = result.completeHtml;

	// Remove quotations
	if (noQuotations) {
		const { didFindQuotation } = removeQuotations($);

		// if the actions above have resulted in an empty body,
		// then we should not remove quotations
		if (containsEmptyText(getTopLevelElement($))) {
			// Don't remove anything.
		} else {
			result.didFindQuotation = didFindQuotation;

			removeTrailingWhitespaces($);
			result.messageHtml = $.html();
		}
	}

	return result;
}

function removeTrackers($: CheerioStatic) {
	const TRACKERS_SELECTORS = [
		// TODO: Improve by looking at inline styles as well
		'img[width="0"]',
		'img[width="1"]',
		'img[height="0"]',
		'img[height="1"]',
		'img[src*="http://mailstat.us"]',
	];

	const query = TRACKERS_SELECTORS.join(', ');

	$(query).each((_, el) => {
		$(el).remove();
	});
}

function removeScripts($: CheerioStatic) {
	$('script').each((_, el) => {
		$(el).remove();
	});
}

function removeComments($: CheerioStatic) {
	$('*')
		.contents()
		.each((_, el) => {
			if (el.type === 'comment') {
				$(el).remove();
			}
		});
}

export default prepareMessage;
