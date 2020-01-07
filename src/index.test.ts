import expect from 'expect';
import { removeQuotations, linkify } from './';

describe('removeQuotations', () => {
	it('should remove quotation from basic email', () => {
		const email = `
<div dir="ltr">
	<div dir="ltr">
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			<b>An hoc usque quaque, aliter in vita?</b> Terram, mihi crede, ea
			lanx et maria deprimet. Duo Reges: constructio interrete.
			<i>Id est enim, de quo quaerimus.</i> Parvi enim primo ortu sic
			iacent, tamquam omnino sine animo sint. Quis est tam dissimile
			homini. Claudii libidini, qui tum erat summo ne imperio, dederetur.
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
				<div id="gmail-m_-9156858955879776563gmail-outputholder">
					<p>
						Replied message
					</p>
				</div>
			</div>
		</blockquote>
	</div>
</div>
    `;

		expect(removeQuotations(email)).toMatchObject({
			body:
				'<html><body> <div dir="ltr"> 	<div dir="ltr"> 		<p> 			Lorem ipsum dolor sit amet, consectetur adipiscing elit. 			<b>An hoc usque quaque, aliter in vita?</b> Terram, mihi crede, ea 			lanx et maria deprimet. Duo Reges: constructio interrete. 			<i>Id est enim, de quo quaerimus.</i> Parvi enim primo ortu sic 			iacent, tamquam omnino sine animo sint. Quis est tam dissimile 			homini. Claudii libidini, qui tum erat summo ne imperio, dederetur. 			<a href="http://loripsum.net/" target="_blank">Beatus sibi videtur esse moriens.</a> 		</p> 	</div> 	<br/></div>     </body></html>',
			didFindQuote: true,
			isTooLong: false,
		});
	});
});

describe('linkify', () => {
	it('should linkify URL in paragraph', () => {
		const email = `<p>
			Quis est tam dissimile
			homini. Claudii libidini, qui tum erat summo ne imperio, dederetur.
			loripsum.net
		</p>`;

		expect(linkify(email)).toBe(`<p>
			Quis est tam dissimile
			homini. Claudii libidini, qui tum erat summo ne imperio, dederetur.
			<a href="http://loripsum.net" target="_blank" rel="noopener noreferrer">loripsum.net</a>
		</p>`);
	});

	it('should not linkify URLs in anchor tags', () => {
		const email = `<p>
			Quis est tam dissimile
			homini. Claudii libidini, qui tum erat summo ne imperio, dederetur.
			<a href="http://loripsum.net" target="_blank" rel="noopener noreferrer">loripsum.net</a>
		</p>`;

		expect(linkify(email)).toBe(email);
	});

	it('should linkify other kinds of URLs', () => {
		const email = `<p>
			hello@email.com
			yourtempo.co
			http://yourtempo.co
			https://yourtempo.co
			ftp://yourtempo.co
		</p>`;

		console.log(linkify(email));
		expect(linkify(email)).toBe(`<p>
			<a href="mailto:hello@email.com" rel="noopener noreferrer">hello@email.com</a>
			<a href="http://yourtempo.co" target="_blank" rel="noopener noreferrer">yourtempo.co</a>
			<a href="http://yourtempo.co" target="_blank" rel="noopener noreferrer">http://yourtempo.co</a>
			<a href="https://yourtempo.co" target="_blank" rel="noopener noreferrer">https://yourtempo.co</a>
			<a href="ftp://yourtempo.co" target="_blank" rel="noopener noreferrer">ftp://yourtempo.co</a>
		</p>`);
	});

	it('should ignore script tags, style tags, and head', () => {
		const email = `
		<html>
			<head>
				<meta charset="utf-8">
				<title>Not a link.com</title>
				<style type="text/css">
					p {
						content: 'Not a link.com ';
					}
				</style>
			</head>
			<body>
				Hello
				<style type="text/css">
					p {
						content: 'Not a link.com ';
					}
				</style>
				<script>
					console.log('This is not a link.com ');
				</script>
			</body>
		</html>
		`;

		expect(linkify(email)).toBe(email);
	});
});
