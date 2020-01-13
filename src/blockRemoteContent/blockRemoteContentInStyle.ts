import regx from 'regx';

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

export default blockRemoteContentInStyle;
