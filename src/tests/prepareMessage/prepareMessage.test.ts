import { expectHtml, readFile } from '../utils';
import prepareMessage from '../../prepareMessage';

function readFixture(
	name: string
): {
	input: string;
	expectedMessage: string;
	expectedComplete: string;
} {
	return {
		input: readFile(__dirname, `./${name}.input.html`),
		expectedMessage: readFile(__dirname, `./${name}.output-message.html`),
		expectedComplete: readFile(__dirname, `./${name}.output-complete.html`),
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
	checkFixture('no-empty-message');
});
