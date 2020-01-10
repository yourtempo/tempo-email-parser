import regx from 'regx';

function blockRemoteContent($: CheerioStatic) {
	// Block remote URLs in style tags
	blockRemoteContentInStyle($);
}

// https://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value
const URL_ATTRIBUTES = [
	'action',
	'archive',
	'background',
	'cite',
	'classid',
	'codebase',
	'data',
	'formaction',
	'href',
	'icon',
	'longdesc',
	'manifest',
	'poster',
	'profile',
	'src',
	'srcdoc',
	'srcset',
	'usemap',
];

const IMAGE_ATTRIBUTES = [
	'background',
	'icon',
	'placeholder',
	'poster',
	'src',
	'srcset',
];

// To replace all images with a 1x100 transparent PNG
// Note: using a 1x1 square results in large square empty
//       spaces in many e-mails, because only the width is
//       defined in the HTML; and the height gets scaled
//       proportionally. Thus the 1x100 ratio instead
// https://github.com/mailpile/Mailpile/blob/babc3e5c3e7dfa3326998d1628ffad5b0bbd27f5/shared-data/default-theme/html/jsapi/message/html-sandbox.js#L43-L47
// Generated using http://png-pixel.com/
const TRANSPARENT_1X100_URL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Disable all remote-content in styles, and replace images
 * with a transparent pixel.
 */
function blockRemoteContentInStyle($: CheerioStatic) {
	// Replace all URLs with a transparent image.
	// Non-image URLs that were replaced will no longer be valid, and ignored.
	// Dirty, but that's what we want.

	// <style> tags
	$('style').each((_, styleEl) => {
		const styleText = $(styleEl).text();

		const hasRemoteUrls = REG_STYLE_REMOTE_URLS.test(styleText);

		if (hasRemoteUrls) {
			const replacedText = replaceUrlsInStyle(
				styleText,
				TRANSPARENT_1X100_URL
			);

			$(styleEl).text(replacedText);
		}
	});

	// <div style="..."> attributes
	$('[style]').each((_, styledEl: CheerioElement) => {
		const styleText = $(styledEl).attr('style');
		if (!styleText) {
			return;
		}

		const hasRemoteUrls = REG_STYLE_REMOTE_URLS.test(styleText);
		if (hasRemoteUrls) {
			const replacedText = replaceUrlsInStyle(
				styleText,
				TRANSPARENT_1X100_URL
			);

			$(styledEl).attr('style', replacedText);
		}
	});
}

// https://regex101.com/r/f2SYlc/4
// Matches remote URLs in a style tag
const REG_STYLE_REMOTE_URLS: RegExp = regx('gi')`
  (

    (?:

      // Attributes URLs, which always start with: url(
      url\(

      |

      // Or @import statement, with optional url() syntax
      (?:@import\s*)(?:url\()?

    )

    ["']?
  )

  // Ignore data URLs
  (?!data:)

  // Capture URL value
  (

    // Protocol
    (?:\w*:)

    // Rest of the url
    [^'"\)]*

  )
`;

function replaceUrlsInStyle(styleText: string, replacement: string): string {
	return styleText.replace(
		REG_STYLE_REMOTE_URLS,
		(match: string, ...[prefix, capturedUrl]: string[]) => {
			// The original match is `${prefix}${capturedUrl}`
			return `${prefix}${replacement}`;
		}
	);
}

export default blockRemoteContent;
