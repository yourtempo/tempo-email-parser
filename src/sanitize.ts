import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM().window;
const DOMPurify = createDOMPurify(window);

function sanitize(emailHtml: string): string {
	return DOMPurify.sanitize(emailHtml, {
		// Also remove scripts, since we don't want to run any
		FORBID_TAGS: ['script'],
		WHOLE_DOCUMENT: true,
	});
}

export default sanitize;
