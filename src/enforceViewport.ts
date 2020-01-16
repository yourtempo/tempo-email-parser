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
		const head = $('head'); // Cheerio already makes sure head is present
		head.append(desiredViewport);
	}
}

export default enforceViewport;
