import linkifyHtml from 'linkifyjs/html';

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

export default linkify;
