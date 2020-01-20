import cheerio from 'cheerio';
import appendStyle from '../appendStyle';
import { expectHtml } from './utils';

describe('appendStyle', () => {
	it('should add style', () => {
		const email = `
				<div>Hello</div>
		`;

		const $ = cheerio.load(email);
		appendStyle(
			$,
			`
				p {
					background: red;
				}

				.title {
					color: black;
				}
			`
		);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<style>
						p {
							background: red;
						}

						.title {
							color: black;
						}
					</style>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});

	it('should append style after existing ones', () => {
		const email = `
			<html>
				<head>
					<style>
						p {
							background: red;
						}
					</style>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		const $ = cheerio.load(email);
		appendStyle(
			$,
			`
				.title {
					color: black;
				}
			`
		);

		const actual = $.html();

		const expected = `
			<html>
				<head>
					<style>
						p {
							background: red;
						}
					</style>
					<style>
						.title {
							color: black;
						}
					</style>
				</head>
				<body>
					<div>Hello</div>
				</body>
			</html>
		`;

		expectHtml(actual, expected);
	});
});
