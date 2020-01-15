const TEXTUAL = new Set([
	'root',
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

function isText(el: CheerioElement): boolean {
	return el.type === 'text';
}

function isDocument(el: CheerioElement): boolean {
	return el.tagName === 'html';
}

function isBody(el: CheerioElement): boolean {
	return el.tagName === 'body';
}

function isImage(el: CheerioElement): boolean {
	return el.tagName === 'img';
}

function isRootElement(el: CheerioElement): boolean {
	return isBody(el) || isDocument(el) || el.tagName === 'root';
}

function hasChildren(el: CheerioElement): boolean {
	return el.children && el.children.length > 0;
}

const EMPTY_REGEX = /^\s*$/;
function isEmpty(text: CheerioElement): boolean {
	return EMPTY_REGEX.test(text.nodeValue);
}

// Also consider signatures and disclaimer remnants like '---' as empty
const EMPTYISH_REGEX = /^\s*-*\s*$/;
function isEmptyish(text: CheerioElement): boolean {
	return EMPTYISH_REGEX.test(text.nodeValue);
}

/**
 * True if the element and its children only contains empty texts
 */
function containsEmptyText(el: CheerioElement): boolean {
	if (isText(el)) {
		return isEmpty(el);
	} else if (hasChildren(el)) {
		return el.children.every(containsEmptyText);
	} else {
		return true;
	}
}

function getTopLevelElement($: CheerioStatic): CheerioElement {
	const body = $('body');
	if (body.length > 0) {
		return body.get(0);
	} else {
		return $.root().get(0);
	}
}

/**
 * Convert a Cheerio selection to an array of CheerioElement
 */
function toArray(selection: Cheerio): CheerioElement[] {
	const res: CheerioElement[] = [];
	selection.each((i, el) => res.push(el));
	return res;
}

export {
	getTopLevelElement,
	isBody,
	isDocument,
	isImage,
	isRootElement,
	isText,
	isTextualElement,
	isEmpty,
	isEmptyish,
	containsEmptyText,
	hasChildren,
	toArray,
};
