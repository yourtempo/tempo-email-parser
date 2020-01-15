import { expectHtml, readFileIfExists, readFile } from '../utils';
import prepareMessage from '../../prepareMessage';

function readFixture(
	name: string
): {
	input: string;
	expectedMessage: string | null;
	expectedComplete: string | null;
} {
	return {
		input: readFile(__dirname, `./${name}.input.html`),
		expectedMessage: readFileIfExists(
			__dirname,
			`./${name}.output-message.html`
		),
		expectedComplete: readFileIfExists(
			__dirname,
			`./${name}.output-complete.html`
		),
	};
}

/**
 * Run tests for a fixture
 */
function checkFixture(name: string) {
	describe(name, () => {
		const { input, expectedComplete, expectedMessage } = readFixture(name);

		const result = prepareMessage(input);

		if (expectedComplete !== null) {
			it('completeHtml', () => {
				expectHtml(result.completeHtml, expectedComplete);
			});
		}

		if (expectedMessage !== null) {
			// console.log(result.messageHtml);
			it('messageHtml', () => {
				expectHtml(result.messageHtml, expectedMessage);
			});
		}
	});
}

describe('prepareMessage', () => {
	checkFixture('all-in-one');
	checkFixture('no-empty-message');
	checkFixture('email_19');
});
