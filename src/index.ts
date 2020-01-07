import Talon from 'talonjs';
import linkifyHtml from 'linkifyjs/html';

/**
 * Remove quotations (replied messages) from the email
 */
function removeQuotations(
	emailHtml: string
): {
	body: string;
	didFindQuote: boolean;
	// True if the message is too big to be processed
	isTooLong: boolean;
} {
	const options = {
		// Maximum number of HTML nodes to process
		nodeLimit: 4000,
		// Maximum number of text lines to process (the text lines are derived from the original HTML)
		maxLinesCount: 4000,
	};
	const {
		body,
		didFindQuote,
		isTooLong = false,
	} = Talon.quotations.extractFromHtml(emailHtml, options);

	return { body, didFindQuote, isTooLong };
}

/**
 * Wrap text links in anchor tags
 */
function linkify(emailHtml: string): string {
	return linkifyHtml(emailHtml, {
		ignoreTags: ['script', 'style', 'head'],
		className: '',
		attributes: {
			// To avoid tabnabbing
			rel: 'noopener noreferrer',
		},
	});
}

export { removeQuotations, linkify };
