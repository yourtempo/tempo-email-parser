import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM().window;
const DOMPurify = createDOMPurify(window);

const DOMPURIFY_OPTIONS = {
	ADD_TAGS: ['meta', 'link'],
	// Also remove scripts, since we don't want to run any
	FORBID_TAGS: ['script'],
	// Return a complete HTML document
	WHOLE_DOCUMENT: true,
};

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
	if (data.tagName === 'link') {
		// We want to keep stylesheets.
		// But remove imports (obsolete feature of Chrome)
		// https://html5sec.org/#138
		// Also remove preloads, because they're unnecessary
		const isImport = node.getAttribute('rel') == 'import';
		const isPreload = node.getAttribute('rel') == 'preload';

		if (isImport || isPreload) {
			node.parentNode && node.parentNode.removeChild(node);
		}
	}
});

function sanitize(emailHtml: string): string {
	return DOMPurify.sanitize(emailHtml, DOMPURIFY_OPTIONS);
}

export default sanitize;
