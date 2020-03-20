/**
 * Ensure the email contains a
 * <meta name="viewport" content="width=device-width" />
 */
function enforceViewport(
	$: CheerioStatic,
	desiredViewport: string = '<meta name="viewport" content="width=device-width">'
) {
	const viewports = $('meta[name="viewport"]');
	const hasViewport = viewports.length > 0;

	const viewportElement = $(desiredViewport);

	if (hasViewport) {
		// remove current viewports
		viewports.each((_, el) => {
			$(el).remove();
		});
	}

	// Insert a viewport
	const head = $('head'); // Cheerio already makes sure head is present
	head.append(viewportElement);
}

export default enforceViewport;
