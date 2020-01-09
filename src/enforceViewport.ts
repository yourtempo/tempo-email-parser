/**
 * Ensure the email contains a
 * <meta name="viewport" content="width=device-width" />
 */
function enforceViewport($: CheerioStatic) {
	const viewports = $('meta[name="viewport"]');
	const hasViewport = viewports.length > 0;

	const desiredViewport = $(
		'<meta name="viewport" content="width=device-width, initial-scale=1">'
	);

	if (hasViewport) {
		// Replace them with the one we want
		viewports.each((index, el) => {
			const first = index === 0;
			if (first) {
				$(el).replaceWith(desiredViewport);
			} else {
				$(el).remove();
			}
		});
	} else {
		// Insert a viewport
		const head = enforceHtmlHead($);
		head.append(desiredViewport);
	}
}

/**
 * Ensure the email is wrapped in a <html> tag with a <head>
 * and returns the selected <head> element.
 */
function enforceHtmlHead($: CheerioStatic): Cheerio {
	const hasHtml = $('html').length === 1;
	const hasHead = $('head').length === 1;

	if (!hasHtml) {
		const html = $('<html xmlns="http://www.w3.org/1999/xhtml"></html>');
		const toWrap = $(
			$.root()
				.children()
				.first()
		);
		toWrap.wrap(html);
	}

	if (!hasHead) {
		$('html').prepend('<head></head>');
	}

	return $('head');
}

export default enforceViewport;
