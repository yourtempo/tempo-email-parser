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

function fileExists(...paths: string[]): boolean {
	return fs.existsSync(path.join(...paths));
}

function readFileIfExists(...paths: string[]): string | null {
	if (!fileExists(...paths)) {
		return null;
	} else {
		return readFile(...paths);
	}
}

export { expectHtml, readFile, fileExists, readFileIfExists };
