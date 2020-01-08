import expect from 'expect';
import sanitize from './sanitize';

describe('sanitize', () => {
	it('should remove threats', () => {
		// XSS vectors inspired from
		// https://portswigger.net/web-security/cross-site-scripting/cheat-sheet
		const email = `
<html><head>
<link rel="preload" href="main.js" as="script">
</head>
<body background="javascript:alert(1)">

Hello

<img src="javascript:alert(1)" />

<script>console.log('dangerous')</script>

<iframe src="data:text/html,<img src=1 onerror=alert(document.domain)>">

<iframe src="javascript:alert(1)">

<object data="javascript:alert(1)">

<a href="JaVaScript:alert(1)">XSS</a>

<svg><animate xlink:href=#xss attributeName=href from=javascript:alert(1) to=1 /><a id=xss><text x=20 y=20>XSS</text></a>

<math><x href="javascript:alert(1)">blah</math>

<a id=x tabindex=1 onactivate=alert(1)>link</a>

<a onbeforecopy="alert(1)" contenteditable>test</a>

<style>@keyframes x{}</style><a style="animation-name:x" onanimationstart="alert(1)"></a>
</body></html>
			`;

		expect(sanitize(email)).toBe(`<html><head>


</head>
<body>


Hello

<img>



</body></html>`);
	});

	it('should preserve normal stuff', () => {
		const email = `<html><head>
		<title>Title</title>
		<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
		<link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet" />
		<style type="text/css">
			p {
				font-family: Lato;
				color: red;
			}
		</style>
	</head>
	<body>
		<p>Hello</p>
		<style type="text/css">
			p {
				background: black;
			}
		</style>
		<p>
			How are you ?
		</p>
</body></html>`;
		expect(sanitize(email)).toBe(email);
	});
});
