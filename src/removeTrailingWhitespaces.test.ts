import cheerio from 'cheerio';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';

describe('removeTrailingWhitespaces', () => {
	const TESTS = [
		{
			it: 'should trim br',
			before: `
    <html><body><div>Hello<br/>   <br/></div></body></html>
    `,
			after: `
    <html><body><div>Hello</div></body></html>
    `,
		},
	];

	TESTS.forEach(test => {
		it(test.it, () => {
			const $ = cheerio.load(test.before);
			removeTrailingWhitespaces($);
			const result = $.html();
			expect(result).toBe(test.after);
		});
	});
});
