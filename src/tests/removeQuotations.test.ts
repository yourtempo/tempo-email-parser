import expect from 'expect';
import cheerio from 'cheerio';
import { expectHtml } from './utils';
import removeQuotations from '../removeQuotations';

describe('removeQuotations', () => {
	it('should remove quotation from basic email', () => {
		const email = `
			<div dir="ltr">
				<div dir="ltr">
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						<b>An hoc usque quaque, aliter in vita?</b> Terram, mihi
						crede, ea lanx et maria deprimet. Duo Reges: constructio
						interrete. <i>Id est enim, de quo quaerimus.</i> Parvi
						enim primo ortu sic iacent, tamquam omnino sine animo
						sint. Quis est tam dissimile homini. Claudii libidini,
						qui tum erat summo ne imperio, dederetur.
						<a href="http://loripsum.net/" target="_blank"
							>Beatus sibi videtur esse moriens.</a
						>
					</p>
				</div>
				<br />
				<div class="gmail_quote">
					<div dir="ltr" class="gmail_attr">
						On Tue, Dec 31, 2019 at 12:08 AM Nicolas Gaborit &lt;<a
							href="mailto:hello@soreine.dev"
							>hello@soreine.dev</a
						>&gt; wrote:<br />
					</div>
					<blockquote
						class="gmail_quote"
						style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"
					>
						<div dir="ltr">
							<div
								id="gmail-m_-9156858955879776563gmail-outputholder"
							>
								<p>
									Replied message
								</p>
							</div>
						</div>
					</blockquote>
				</div>
			</div>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head></head>
					<body>
						<div dir="ltr">
							<div dir="ltr">
								<p>
									Lorem ipsum dolor sit amet, consectetur
									adipiscing elit.
									<b>An hoc usque quaque, aliter in vita?</b> Terram, mihi crede, ea lanx et maria deprimet. Duo Reges:
									constructio interrete. <i>Id est enim, de quo quaerimus.</i> Parvi enim primo ortu sic iacent, tamquam omnino
									sine animo sint. Quis est tam dissimile homini. Claudii libidini, qui tum erat summo ne imperio, dederetur.
																<a
										href="http://loripsum.net/"
										target="_blank"
										>Beatus sibi videtur esse moriens.</a
									>
								</p>
							</div>
							<br />
						</div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});

	it('should remove signature from basic email', () => {
		const email = `
			<div dir="ltr">
				<div dir="ltr">
					<p>
						Hello
					</p>
				</div>
				<br clear="all" />
				<br />-- <br />
				<div dir="ltr" class="gmail_signature">
					<div dir="ltr">
						<div>Nicolas Gaborit (Soreine)</div>
						<div>Web Developper<br /></div>
					</div>
				</div>
			</div>
			</body>
			</html>
			`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head></head>
					<body>
						<div dir="ltr">
							<div dir="ltr">
								<p>
									Hello
								</p>
							</div>
							<br clear="all" />
							<br />-- <br />
						</div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});

	it('should remove both signature and quotations from basic email', () => {
		const email = `
		<html>
		<head></head>
		<body>
			<div dir="ltr">
				<div dir="ltr">
					<p>
						Hello
					</p>
				</div>
				<br />
				<div class="gmail_quote">
					<div dir="ltr" class="gmail_attr">
						On Tue, Dec 31, 2019 at 12:08 AM Nicolas Gaborit &lt;<a
							href="mailto:hello@soreine.dev"
							>hello@soreine.dev</a
						>&gt; wrote:<br />
					</div>
					<blockquote
						class="gmail_quote"
						style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"
					>
						<div dir="ltr">
							<div
								id="gmail-m_-9156858955879776563gmail-outputholder"
							>
								<p>
									This is the replied message
								</p>
							</div>
						</div>
					</blockquote>
				</div>
				<br clear="all" />
				<br />-- <br />
				<div dir="ltr" class="gmail_signature">
					<div dir="ltr">
						<div>Nicolas Gaborit (Soreine)</div>
						<div>Web Developper<br /></div>
					</div>
				</div>
			</div>
			</body>
			</html>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head></head>
					<body>
						<div dir="ltr">
							<div dir="ltr">
								<p>
									Hello
								</p>
							</div>
							<br />

							<br clear="all" />
							<br />-- <br />
						</div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});

	it('should not wrap body in body', () => {
		const email = `
			<html>
				<!-- This comment would make talonjs either fail, or wrap in an extra body -->
				<head>
					<meta charset="utf-8" />
				</head>

				<body>
					Hello
				</body>
			</html>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<!-- This comment would make talonjs either fail, or wrap in an extra body --><head>
						<meta charset="utf-8" />
					</head>

					<body>
						Hello
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: false,
		});
	});

	it('should preserve inline quotes', () => {
		const email = `
			<div dir="ltr">
				<p>
					Hello.
				</p>
				<blockquote>Here is an inline quote</blockquote>
				<p>Hope you liked it</p>
				<br />
				<div class="gmail_quote">
					<div dir="ltr" class="gmail_attr">
						On Tue, Dec 31, 2019 at 12:08 AM Nicolas Gaborit &lt;<a
							href="mailto:hello@soreine.dev"
							>hello@soreine.dev</a
						>&gt; wrote:<br />
					</div>
					<blockquote
						class="gmail_quote"
						style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"
					>
						<div dir="ltr">
							<div
								id="gmail-m_-9156858955879776563gmail-outputholder"
							>
								<p>
									This is the replied message
								</p>
							</div>
						</div>
					</blockquote>
				</div>
				<br clear="all" />
				<br />-- <br />
				<div dir="ltr" class="gmail_signature">
					<div dir="ltr">
						<div>Nicolas Gaborit (Soreine)</div>
						<div>Web Developper<br /></div>
					</div>
				</div>
			</div>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head></head>
					<body>
						<div dir="ltr">
							<p>
								Hello.
							</p>
							<blockquote>Here is an inline quote</blockquote>
							<p>Hope you liked it</p>
							<br />

							<br clear="all" />
							<br />-- <br />
						</div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});

	it('should remove "On... wrote:" in different languages', () => {
		const email = `
			<html>
				<body>
					<p>Hello</p>
					<div dir="ltr">
						Le lun. 26 janvier 2019 à 17:02, <<a
							href="mailto:registration-calm@mahi.dhamma.org"
							>registration-calm@mahi.dhamma.org</a
						>> a écrit&nbsp;:<br />
					</div>
					<blockquote>
						<div dir="ltr">
							<p>
								This is the replied message
							</p>
						</div>
					</blockquote>
				</body>
			</html>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head></head>
					<body>
						<p>Hello</p>
						<div dir="ltr"><br /></div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});

	it('should remove "On... wrote:" when it is the end of the email', () => {
		const email = `
			<html>
				<head>
					<meta name="viewport" content="width=device-width" />
					<style>
						.customStyle {
							background: red;
						}
					</style>
				</head>
				<body>
					<div>
						<div>Hello</div>
						<blockquote>this is a quote</blockquote>
						<div>
							On December 3, 2019 at 05:01, Onno Schwanen wrote:
						</div>
					</div>
				</body>
			</html>
		`;

		const $ = cheerio.load(email);
		const result = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<head>
						<meta name="viewport" content="width=device-width" />
						<style>
							.customStyle {
								background: red;
							}
						</style>
					</head>
					<body>
						<div>
							<div>Hello</div>
							<blockquote>this is a quote</blockquote>
							<div></div>
						</div>
					</body>
				</html>
			`
		);

		expect(result).toMatchObject({
			didFindQuotation: true,
		});
	});
});
