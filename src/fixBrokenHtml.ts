import * as htmlparser2 from 'htmlparser2';

/**
 * Fix various problems in input HTML before it can be parsed by cheerio.
 */
function fixBrokenHtml(inputHtml: string): string {
	const fixedHead = fixBrokenHead(inputHtml);

	return fixedHead;
}

function fixBrokenHead(inputHtml: string): string {
	const encounteredTags = new Set<string>();

	let isBroken = false;

	let headStartIndex: number | undefined;

	const parserDetect = new htmlparser2.Parser({
		onopentag(name) {
			if (name === 'head') {
				headStartIndex = parserDetect.startIndex;
			}

			encounteredTags.add(name);

			const headTag = encounteredTags.has('head');
			const bodyTag = encounteredTags.has('body');
			const htmlTag = encounteredTags.has('html');

			if (!htmlTag && headTag && bodyTag) {
				isBroken = true;
			}
		},
	});

	parserDetect.write(inputHtml);
	parserDetect.end();

	if (!isBroken) {
		return inputHtml;
	}

	// Remove everything before head, and wrap in html
	let fixedHtml = inputHtml.slice(headStartIndex);
	fixedHtml = `<html>${fixedHtml}</html>`;
	return fixedHtml;
}

export default fixBrokenHtml;
