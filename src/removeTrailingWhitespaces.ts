/**
 * Remove trailing whitespaces in given element, using given cheerio context.
 * Returns true if the element was empty and removed completely
 */
function removeTrailingWhitespaces(
	$: CheerioStatic,
	el: CheerioElement = getTopLevelElement($)
): boolean {
	const hasChildren = el.childNodes && el.childNodes.length > 0;
	const isText = el.type === 'text';
	const isTextual = isTextualElement(el);

	console.log({
		tagName: el.tagName,
		hasChildren,
		isTextual,
		isText,
	});

	if (isText) {
		// Trim it
		const text = el.nodeValue as string;
		const trimmed = text.trimRight();
		if (trimmed === '') {
			$(el).remove();
			// The element was removed completely
			return true;
		} else {
			$(el).text(trimmed);
			// We're done trimming
			return false;
		}
	} else if (!isTextual) {
		// Not a text element, we consider it important and stop trimming here
		return false;
	} else if (hasChildren) {
		// Textual element with children

		// Trim last child
		const wasEmpty = removeTrailingWhitespaces($, el.lastChild);
		if (wasEmpty) {
			// Continue trimming this element
			return removeTrailingWhitespaces($, el);
		} else {
			// The last element was trimmed as much as possible.
			// We stop here
			return false;
		}
	} else {
		// Empty textual element, we can remove it.
		$(el).remove();
		return true;
	}
}

const TEXTUAL = new Set([
	'body',

	// Text content
	'p',
	'div',

	// Separators
	'hr',
	'br',

	// Inline text
	'span',
	'b',
	'a',
	'em',
	'i',
	's',
	'strong',
]);

function isTextualElement(el: CheerioElement): boolean {
	return TEXTUAL.has(el.tagName);
}

function getTopLevelElement($: CheerioStatic): CheerioElement {
	const body = $('body');
	if (body.length > 0) {
		return body.get(0);
	} else {
		return $.root().get(0);
	}
}
export default removeTrailingWhitespaces;
