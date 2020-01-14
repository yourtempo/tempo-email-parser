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
		const didFindQuote = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<body>
						<div dir="ltr">
							<div dir="ltr">
								<p>
									Lorem ipsum dolor sit amet, consectetur
									adipiscing elit.
									<b>An hoc usque quaque, aliter in vita?</b> Terram, mihi crede, ea lanx et maria	deprimet. Duo Reges: constructio interrete.
									<i>Id est enim, de quo quaerimus.</i> Parvi
									enim primo ortu sic iacent, tamquam omnino
									sine animo sint. Quis est tam dissimile
									homini. Claudii libidini, qui tum erat summo
									ne imperio, dederetur.
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

		expect(didFindQuote).toBe(true);
	});

	it('should not wrap body in body', () => {
		const email = `
			<html>
				<!-- This comment will make talon either fail, or wrap in an extra body -->
				<head>
					<meta charset="utf-8" />
				</head>

				<body>
					Hello
				</body>
			</html>
		`;

		const $ = cheerio.load(email);
		const didFindQuote = removeQuotations($);
		const actual = $.html();

		expectHtml(
			actual,
			`
				<html>
					<!-- This comment will make talon either fail, or wrap in an extra body -->
					<head>
						<meta charset="utf-8" />
					</head>

					<body>
						Hello
					</body>
				</html>
			`
		);

		expect(didFindQuote).toBe(true);
	});
});
