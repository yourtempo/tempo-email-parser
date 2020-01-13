import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import expect from 'expect';

/**
 * Expect two HTMLs to be identical, disregarding formatting differences
 */
function expectHtml(actual: string, expected: string) {
	// Use prettier to avoid formatting discrepencies
	actual = prettier.format(actual, { parser: 'html', endOfLine: 'lf' });
	expected = prettier.format(expected, { parser: 'html', endOfLine: 'lf' });

	// console.log(actual);
	// console.log(expected);
	expect(actual).toBe(expected);
}

function readFile(...paths: string[]): string {
	return fs.readFileSync(path.join(...paths)).toString();
}

export { expectHtml, readFile };