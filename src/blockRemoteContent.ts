import regx from 'regx';

// What to replace remote URLs with
type ReplacementOptions = {
	image: string;
	other: string;
};

function blockRemoteContent(
	$: CheerioStatic,
	replacements: Partial<ReplacementOptions> = {}
) {
	const { image = TRANSPARENT_1X100_URL, other = '#' } = replacements;

	// Block remote URLs in style tags
	blockRemoteContentInStyle($, image);
	// Block remote URLs in tags attributes
	blockRemoteContentInAttributes($, { image, other });
}

// https://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value
const TAGS_THAT_HAVE_URL_ATTRIBUTES: { [key: string]: string[] } = {
	// Keep this one
	// a: ['href'],
	applet: ['codebase'],
	area: ['href'],
	audio: ['src'],
	base: ['href'],
	blockquote: ['cite'],
	body: ['background'],
	button: ['formaction'],
	command: ['icon'],
	del: ['cite'],
	embed: ['src'],
	form: ['action'],
	frame: ['longdesc', 'src'],
	head: ['profile'],
	html: ['manifest'],
	iframe: ['longdesc', 'src'],
	img: ['longdesc', 'src', 'usemap'],
	input: ['src', 'usemap', 'formaction'],
	ins: ['cite'],
	link: ['href'],
	meta: ['content'],
	object: ['classid', 'codebase', 'data', 'usemap'],
	q: ['cite'],
	script: ['src'],
	source: ['src'],
	track: ['src'],
	video: ['poster', 'src'],
};

/**
 * Replace all remote URLs
 */
function blockRemoteContentInAttributes(
	$: CheerioStatic,
	replacements: ReplacementOptions
) {
	const query = Object.keys(TAGS_THAT_HAVE_URL_ATTRIBUTES).join(',');

	$(query).each((_, el: CheerioElement) => {
		const $el = $(el);

		getUrlAttributes(el.tagName, $el)
			.filter(isRemoteUrl)
			.forEach(attr => {
				const replacement = isImageAttribute(attr)
					? replacements.image
					: replacements.other;
				$el.attr(attr, replacement);
			});
	});
}

/**
 * Returns the list of URL attributes declared on this element
 */
function getUrlAttributes(
	tagName: string,
	// Cheerio scoped on the element
	$el: Cheerio
): string[] {
	const attrs = $el.attr();
	const potentialAttributes: string[] =
		TAGS_THAT_HAVE_URL_ATTRIBUTES[tagName] || [];

	return potentialAttributes.filter(
		Object.prototype.hasOwnProperty.bind(attrs)
	);
}

const IMAGE_ATTRIBUTES = new Set([
	'background',
	'icon',
	'placeholder',
	'poster',
	'src',
	'srcset',
]);

function isImageAttribute(attr: string): boolean {
	return IMAGE_ATTRIBUTES.has(attr);
}

function isRemoteUrl(attributeValue: string) {
	// There can be several URLs. We consider them remote then.
	// (for example img srcset: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset)
	const isLocal = /^data:\S*$/.test(attributeValue);
	return !isLocal;
}

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
 * with the given image URL.
 *
 * Non-image URLs that are replaced will no longer be valid, and ignored.
 * Dirty, but that's what we want.
 */
function blockRemoteContentInStyle(
	$: CheerioStatic,
	replacementImageUrl: string
) {
	// <style> tags
	$('style').each((_, styleEl) => {
		const styleText = $(styleEl).text();

		const hasRemoteUrls = REG_STYLE_REMOTE_URLS.test(styleText);

		if (hasRemoteUrls) {
			const replacedText = replaceUrlsInStyle(
				styleText,
				replacementImageUrl
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
				replacementImageUrl
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
