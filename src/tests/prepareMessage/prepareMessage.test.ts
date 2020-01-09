import fs from 'fs';
import path from 'path';
import { expectHtml } from '../utils';
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

/**
 * Run tests for a fixture
 */
function checkFixture(name: string) {
	describe(name, () => {
		const fixture = readFixture(name);

		const result = prepareMessage(fixture.input);

		it('completeHtml', () => {
			expectHtml(result.completeHtml, fixture.expectedComplete);
		});
		it('messageHtml', () => {
			expectHtml(result.messageHtml, fixture.expectedMessage);
		});
	});
}

describe('prepareMessage', () => {
	checkFixture('all-in-one');
});
