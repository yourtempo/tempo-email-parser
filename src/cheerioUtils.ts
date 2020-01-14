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

function getTopLevelElement($: CheerioStatic): CheerioElement {
	const body = $('body');
	if (body.length > 0) {
		return body.get(0);
	} else {
		return $.root().get(0);
	}
}

export {
	getTopLevelElement,
	isBody,
	isDocument,
	isRootElement,
	isText,
	isTextualElement,
	isEmpty,
	isEmptyish,
	hasChildren,
};
