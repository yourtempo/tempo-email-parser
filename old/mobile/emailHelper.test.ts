import {
	splitQuoted,
	removeUnwanted,
	prepareMessage,
	wrapPadding,
} from './emailHelper';
import cheerio from 'cheerio';
import cheerioConfig from '@config/cheerioConfig';

describe('splitQuoted', () => {
	test('splits on blockquote', () => {
		const $ = cheerio.load(
			'message<blockquote>quote</blockquote>',
			cheerioConfig
		);
		const { message, quoted } = splitQuoted($);
		expect(message).toEqual(
			'<html><head></head><body>message</body></html>'
		);
		expect(quoted).toEqual('<blockquote>quote</blockquote>');
	});

	test('splits on signature', () => {
		const $ = cheerio.load(
			'message<signature>sender</signature>',
			cheerioConfig
		);
		const { message, quoted } = splitQuoted($);
		expect(message).toEqual(
			'<html><head></head><body>message</body></html>'
		);
		expect(quoted).toEqual('<signature>sender</signature>');
	});

	test('splits on gmail quotes line', () => {
		const $ = cheerio.load(
			'message<div class="gmail_quote">quote</div>',
			cheerioConfig
		);
		const { message, quoted } = splitQuoted($);
		expect(message).toEqual(
			'<html><head></head><body>message</body></html>'
		);
		expect(quoted).toEqual('<div class="gmail_quote">quote</div>');
	});

	test('splits on gmail signature line', () => {
		const $ = cheerio.load(
			'message<div class="gmail_signature">sender</div>',
			cheerioConfig
		);
		const { message, quoted } = splitQuoted($);
		expect(message).toEqual(
			'<html><head></head><body>message</body></html>'
		);
		expect(quoted).toEqual('<div class="gmail_signature">sender</div>');
	});
});

describe('wrapPadding', () => {
	test('wrap body element', () => {
		const $ = cheerio.load(
			`<html><head></head><body class="main" style="color: red;">message</body></html>`,
			{
				xmlMode: true,
			}
		);
		wrapPadding($);
		expect($.html()).toEqual(
			'<html><head/><body class="main" style="color: red;padding-left: 30px; padding-right: 30px">message</body></html>'
		);
	});

	test('wrap root element', () => {
		const $ = cheerio.load(
			`<div class="main" style="color: red;">message</div>`,
			{
				xmlMode: true,
			}
		);
		wrapPadding($);
		expect($.html()).toEqual(
			'<div style="padding-left: 30px; padding-right: 30px"><div class="main" style="color: red;">message</div></div>'
		);
	});
});

describe('removeUnwanted', () => {
	test('removes tracking pixels', () => {
		const $ = cheerio.load('message<img width="0" />', cheerioConfig);
		removeUnwanted($);
		expect($.html()).toEqual(
			'<html><head></head><body>message</body></html>'
		);
	});

	test('removes viewport tag', () => {
		const $ = cheerio.load(
			'<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body>message</body></html>',
			cheerioConfig
		);
		removeUnwanted($);
		expect($.html()).toEqual(
			'<html><head></head><body>message</body></html>'
		);
	});

	test('removes script tag', () => {
		const $ = cheerio.load(
			'<script>var foo="bar";</script><div>message</div>',
			cheerioConfig
		);
		removeUnwanted($);
		expect($.html()).toEqual(
			'<html><head></head><body><div>message</div></body></html>'
		);
	});
});

describe('prepareMessage', () => {
	test('prepares a message', () => {
		const html = 'message<blockquote>quote</blockquote>';
		expect(prepareMessage(html)).not.toEqual(html);
	});
});
