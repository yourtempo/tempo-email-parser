import cheerio from 'cheerio';

import removeQuotations from './removeQuotations';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';
import linkify from './linkify';
import enforceViewport from './enforceViewport';
import blockRemoteContent from './blockRemoteContent';

/**
 * Parse an HTML email and make transformation needed before displaying it to the user.
 * Returns the extracted body of the message, and the complete message for reference.
 */
function prepareMessage(
	emailHtml: string,
	options: {
		// Remove signatures. Only affects the result messageHtml
		noSignature?: boolean;
		// Remove quotations. Only affects the result messageHtml
		noQuotations?: boolean;
		// Remove pixel trackers
		noTrackers?: boolean;
		// Remove trailing whitespaces, at end of the email
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
	// True if a signature was found and stripped
	didFindSignature: boolean;
} {
	const {
		noSignature = true,
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

	if (
		noScript ||
		noTrackers ||
		noSignature ||
		noQuotations ||
		forceMobileViewport
	) {
		const $ = cheerio.load(result.completeHtml);

		// Comments can leads to bug from talonjs (see failing test in removeQuotations)
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

		result.completeHtml = $.html();
		result.messageHtml = result.completeHtml;

		// Remove signature
		if (noSignature) {
			result.didFindSignature = removeSignatures($);
			if (result.didFindSignature) {
				result.messageHtml = $.html();
			}
		}
	}

	// Remove quotations
	if (noQuotations) {
		const { body, didFindQuote } = removeQuotations(result.messageHtml);
		result.didFindQuotation = didFindQuote;
		if (result.didFindQuotation) {
			result.messageHtml = body;
		}
	}

	// Remove trailing whitespace
	if (noTrailingWhitespaces) {
		const messageIsCompleteEmail =
			result.messageHtml === result.completeHtml;

		let $ = cheerio.load(result.messageHtml);
		removeTrailingWhitespaces($);
		result.messageHtml = $.xml();

		if (messageIsCompleteEmail) {
			result.completeHtml = result.messageHtml;
		} else {
			// Also do it for complete email
			$ = cheerio.load(result.completeHtml);
			removeTrailingWhitespaces($);
			result.completeHtml = $.xml();
		}
	}

	return result;
}

function removeSignatures($: CheerioStatic): boolean {
	// TODO: Improve this implementation using Talon
	const SIGNATURE_SELECTORS = ['.gmail_signature', 'signature'];

	const query = SIGNATURE_SELECTORS.join(', ');

	let didFindSignature = false;

	$(query).each((_, el) => {
		didFindSignature = true;
		$(el).remove();
	});

	return didFindSignature;
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
