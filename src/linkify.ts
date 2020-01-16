import Autolinker from 'autolinker';

/**
 * Wrap text links in anchor tags
 */
function linkify(inputHtml: string): string {
	const headOffset = inputHtml.indexOf('</head>');

	return Autolinker.link(inputHtml, {
		urls: {
			schemeMatches: true,
			wwwMatches: true,
			tldMatches: true,
		},
		email: true,
		phone: true,
		mention: false,
		hashtag: false,

		stripPrefix: false,
		stripTrailingSlash: false,
		newWindow: true,

		className: '',

		replaceFn: function(match) {
			if (match.getType() === 'url') {
				// Don't autolink filenames
				// https://github.com/gregjacobs/Autolinker.js/issues/270#issuecomment-498878987
				const previousChar = inputHtml.charAt(match.getOffset() - 1);
				if (previousChar === '/') {
					return false; // don't autolink this match
				}

				// Ignore URLs in head
				if (match.getOffset() < headOffset) {
					return false;
				}

				// To avoid tabnabbing
				const tag = match.buildTag();
				tag.setAttr('rel', 'noopener noreferrer');
			}
		},
	});
}

export default linkify;
