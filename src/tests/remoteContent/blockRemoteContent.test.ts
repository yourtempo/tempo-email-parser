import regx from 'regx';
import { readFile, expectHtml } from '../utils';
import EMAILS from '../../../benchmarks/emails';

// https://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value
const ATTRIBUTES_CONTAINING_LINKS = [
	'action',
	'archive',
	'background',
	'cite',
	'classid',
	'codebase',
	'data',
	'formaction',
	'href',
	'icon',
	'longdesc',
	'manifest',
	'poster',
	'profile',
	'src',
	'srcdoc',
	'srcset',
	'usemap',
];

const IMAGE_ATTRIBUTES = [
	'background',
	'icon',
	'placeholder',
	'poster',
	'src',
	'srcset',
];

// https://github.com/Foundry376/Mailspring/blob/149b389508f59ef382c21900fc7b45aa5599caad/app/internal_packages/message-autoload-images/lib/autoload-images-store.ts#L7
const ImagesRegexp = regx('gi')`
  // Capture a prefix for an image URL
  (
    // Match an image attribute followed by an URI and not data:
    (?:${IMAGE_ATTRIBUTES.join('|')})\s*=\s*['"]?(?=\w*:\/\/)
    
    // or
    |:
    
    // Match an opening url()
    \s*url\(

  )+
  
  // Capture the URL
  ([^"')]*)
`;

// This works on HTML tags, but not inside <style>...

// To replace all images with a 1x100 transparent PNG
// Note: using a 1x1 square results in large square empty
//       spaces in many e-mails, because only the width is
//       defined in the HTML; and the height gets scaled
//       proportionally. Thus the 1x100 ratio instead
// https://github.com/mailpile/Mailpile/blob/babc3e5c3e7dfa3326998d1628ffad5b0bbd27f5/shared-data/default-theme/html/jsapi/message/html-sandbox.js#L43-L47
// Generated using http://png-pixel.com/
const TRANSPARENT_1X100_URL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function blockRemoteContent(html: string) {
	return html.replace(ImagesRegexp, (match, prefix) => {
		return `${prefix}${TRANSPARENT_1X100_URL}`;
	});
}

describe('remote-content', () => {
	it('should replace images', () => {
		const privacyEmail = readFile(__dirname, './email-privacy-tester.html');
		// console.log(blockRemoteContent(EMAILS.MARKETING));
		expectHtml(blockRemoteContent(privacyEmail), privacyEmail);
	});
});
