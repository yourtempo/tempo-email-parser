import Fs from 'fs';
import { listFixtures } from './fixtures';
import prepareMessage from '../../prepareMessage';
import { formatHtml } from '../utils';

/*************************************

  Find all *.input.html that have no *.output-*.html, and write the output
  of `prepareMessage` for it.

 *************************************/

listFixtures()
	.filter(fixture => !fixture.hasOutputComplete && !fixture.hasOutputMessage)
	.forEach(fixture => {
		const result = prepareMessage(fixture.input);

		Fs.writeFileSync(
			fixture.outputMessagePath,
			formatHtml(result.messageHtml)
		);

		Fs.writeFileSync(
			fixture.outputCompletePath,
			formatHtml(result.completeHtml)
		);
	});
