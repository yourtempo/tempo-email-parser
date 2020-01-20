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
		// Replace them with the one we want
		viewports.each((index, el) => {
			const first = index === 0;
			if (first) {
				$(el).replaceWith(viewportElement);
			} else {
				$(el).remove();
			}
		});
	} else {
		// Insert a viewport
		const head = $('head'); // Cheerio already makes sure head is present
		head.append(viewportElement);
	}
}

export default enforceViewport;
