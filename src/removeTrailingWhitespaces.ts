import {
	getTopLevelElement,
	isRootElement,
	isTextualElement,
	isEmptyish,
} from './cheerio-utils';

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
	const isComment = el.type === 'comment';
	const isTextual = isTextualElement(el);

	if (isComment) {
		// Remove it
		$(el).remove();
		return true;
	} else if (isText) {
		if (isEmptyish(el)) {
			$(el).remove();
			// The element was removed completely
			return true;
		} else {
			const trimmed = (el.data as string).trim();
			$(el.parent).text(trimmed);
			// We're done trimming
			return false;
		}
	} else if (!isTextual) {
		// Contains content other than text, we stop trimming here
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
	} else if (isRootElement(el)) {
		// Stop here
		return false;
	} else {
		// Empty textual element, we can remove it.
		$(el).remove();
		return true;
	}
}

export default removeTrailingWhitespaces;
