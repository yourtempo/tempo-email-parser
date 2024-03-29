import { expectHtml } from '../utils';
import prepareMessage from '../../prepareMessage';
import { listFixtures, Fixture } from './fixtures';
import testOptions from './prepareMessageTestOptions';

/**
 * Run tests for a fixture
 */
function checkFixture(fixture: Fixture) {
	describe(fixture.name, () => {
		const result = prepareMessage(fixture.input, testOptions);

		if (fixture.hasOutputComplete()) {
			it('completeHtml', () => {
				expectHtml(result.completeHtml, fixture.outputComplete);
			});
		}

		if (fixture.hasOutputMessage()) {
			// console.log(result.messageHtml);
			it('messageHtml', () => {
				expectHtml(result.messageHtml, fixture.outputMessage);
			});
		}
	});
}

describe('prepareMessage', () => {
	const fixtures = listFixtures().filter(
		fixture => fixture.hasOutputComplete() || fixture.hasOutputMessage()
	);

	fixtures.forEach(checkFixture);
});
