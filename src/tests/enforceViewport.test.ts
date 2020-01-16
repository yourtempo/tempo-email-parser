import cheerio from 'cheerio';
import enforceViewport from '../enforceViewport';
import { expectHtml } from './utils';

describe('enforceViewport', () => {
	it('should add missing viewport', () => {
		const email = `
			<html>
				<head></head>
				<div>Hello</div>
			</html>
		`;

		const $ = cheerio.load(email);
		enforceViewport($);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});

	it('should add missing head tag', () => {
		const email = `
			<html>
				<div>Hello</div>
			</html>
		`;

		const $ = cheerio.load(email);
		enforceViewport($);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});

	it('should add missing html tag', () => {
		const email = `
			<div>Hello</div>
		`;

		const $ = cheerio.load(email);
		enforceViewport($);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});

	it('should replace existing viewports', () => {
		const email = `
			<html>
				<head>
					<meta name="viewport" content="width=device-width" />
					<meta name="viewport" content="width=320" />
				</head>
				<body>
				<div>Hello</div>
				</body>
							</html>
		`;

		const $ = cheerio.load(email);
		enforceViewport($);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});
});
