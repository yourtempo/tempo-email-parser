import cheerio from 'cheerio';

import linkify from './linkify';
import removeQuotations from './removeQuotations';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';
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

function prepareMessage(
	emailHtml: string,
	options: {
		noSignature?: boolean;
		noQuotations?: boolean;
		noTrackers?: boolean;
		noTrailingWhitespaces?: boolean;
		noScript?: boolean;
	} = {}
): {
	messageHtml: string;
	completeHtml: string;
	didFindQuotation: boolean;
	didFindSignature: boolean;
} {
	const {
		noSignature = true,
		noQuotations = true,
		noTrackers = true,
		noTrailingWhitespaces = true,
		noScript = true,
	} = options;

	let result = {
		messageHtml: emailHtml,
		completeHtml: emailHtml,
		didFindQuotation: false,
		didFindSignature: false,
	};

	if (noScript || noTrackers || noSignature) {
		const $ = cheerio.load(result.completeHtml);

		if (noScript) {
			removeScripts($);
		}

		if (noTrackers) {
			removeTrackers($);
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
		result.messageHtml = $.html();

		if (messageIsCompleteEmail) {
			result.completeHtml = result.messageHtml;
		} else {
			// Also do it for complete email
			$ = cheerio.load(result.completeHtml);
			removeTrailingWhitespaces($);
			result.completeHtml = $.html();
		}
	}

	return result;
}

export { prepareMessage, removeQuotations, linkify };
