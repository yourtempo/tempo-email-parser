import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import expect from 'expect';
import prepareMessage from '../../prepareMessage';

function readFile(relativePath: string): string {
	return fs.readFileSync(path.join(__dirname, relativePath)).toString();
}

function readFixture(
	name: string
): {
	input: string;
	expectedMessage: string;
	expectedComplete: string;
} {
	return {
		input: readFile(`./${name}.input.html`),
		expectedMessage: readFile(`./${name}.output-message.html`),
		expectedComplete: readFile(`./${name}.output-complete.html`),
	};
}

function compareHtml(actual: string, expected: string) {
	// Use prettier to avoid formatting discrepencies

	actual = prettier.format(actual, { parser: 'html', endOfLine: 'lf' });
	expected = prettier.format(expected, { parser: 'html', endOfLine: 'lf' });

	expect(actual).toBe(expected);
}

/**
 * Run tests for a fixture
 */
function checkFixture(name: string) {
	describe(name, () => {
		const fixture = readFixture(name);

		const result = prepareMessage(fixture.input);

		it('completeHtml', () => {
			compareHtml(result.completeHtml, fixture.expectedComplete);
		});
		it('messageHtml', () => {
			compareHtml(result.messageHtml, fixture.expectedMessage);
		});
	});
}

describe('prepareMessage', () => {
	checkFixture('all-in-one');
});
