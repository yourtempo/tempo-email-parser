import cheerio from 'cheerio';

import removeQuotations from './removeQuotations';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';
import linkify from './linkify';
import enforceViewport from './enforceViewport';
import blockRemoteContent from './blockRemoteContent';
import { containsEmptyText, getTopLevelElement } from './cheerioUtils';

/**
 * Parse an HTML email and make transformation needed before displaying it to the user.
 * Returns the extracted body of the message, and the complete message for reference.
 */
function prepareMessage(
	emailHtml: string,
	options: {
		// Remove quotations and signatures. Only affects the result messageHtml
		noQuotations?: boolean;
		// Remove pixel trackers
		noTrackers?: boolean;
		// Remove trailing whitespaces, at end of messageHtml
		noTrailingWhitespaces?: boolean;
		// Remove script tags
		noScript?: boolean;
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
	// True if a quote was found and stripped
	didFindQuotation: boolean;
} {
	const {
		noQuotations = true,
		noTrackers = true,
		noTrailingWhitespaces = true,
		noScript = true,
		autolink = true,
		forceMobileViewport = true,
		noRemoteContent = true,
	} = options;

	let result = {
		messageHtml: emailHtml,
		completeHtml: emailHtml,
		didFindQuotation: false,
		didFindSignature: false,
	};

	if (autolink) {
		result.completeHtml = linkify(result.completeHtml);
		result.messageHtml = result.completeHtml;
	}

	let $ = cheerio.load(result.completeHtml);

	// Comments are useless, better remove them
	removeComments($);

	if (noScript) {
		removeScripts($);
	}

	if (noTrackers) {
		removeTrackers($);
	}

	// Before mobile viewport, otherwise this breaks the meta tag
	if (noRemoteContent) {
		blockRemoteContent($);
	}

	if (forceMobileViewport) {
		enforceViewport($);
	}

	result.completeHtml = $.xml();
	result.messageHtml = result.completeHtml;

	// Remove quotations
	if (noQuotations) {
		const backup = result.completeHtml;
		const didFindQuote = removeQuotations($);

		// if the actions above have resulted in an empty body,
		// then we should not remove quotations
		if (containsEmptyText(getTopLevelElement($))) {
			// Restore everything
			result.messageHtml = backup;

			return result;
		} else {
			result.didFindQuotation = didFindQuote;

			if (noTrailingWhitespaces) {
				removeTrailingWhitespaces($);
				result.messageHtml = $.xml();
			}

			return result;
		}
	} else {
		return result;
	}
}

function removeTrackers($: CheerioStatic) {
	const TRACKERS_SELECTORS = [
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
