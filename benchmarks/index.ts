import jsdom from 'jsdom';
import cheerio from 'cheerio';
import Benchmark from 'benchmark';
import Talon from 'talonjs';
import XmlDom from 'xmldom';
import planer from 'planer';

import { printResult, extractResult } from './utils';
import EMAILS from './emails';

const suite = new Benchmark.Suite();

// On each benchmark completion
suite.on('cycle', (event: any) => {
	const result = extractResult(event);
	printResult(result);
});

// Test a simple parsing on basic HTML. Using a linear scale of input complexity, we can see if the performance is linear or worst.
suite
	.add('Parse # JSDom # Size 1', () => {
		new jsdom.JSDOM(EMAILS.BASIC);
	})
	.add('Parse # JSDom # Size 2', () => {
		new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X1);
	})
	.add('Parse # JSDom # Size 3', () => {
		new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X2);
	})
	.add('Parse # Cheerio # Size 1', () => {
		cheerio.load(EMAILS.BASIC);
	})
	.add('Parse # Cheerio # Size 2', () => {
		cheerio.load(EMAILS.BASIC_REPLIED_X1);
	})
	.add('Parse # Cheerio # Size 3', () => {
		cheerio.load(EMAILS.BASIC_REPLIED_X2);
	});

// Test parsing a real-world, HTML-heavy, marketing email
suite
	.add('Parse # JSDom # Marketing email', () => {
		new jsdom.JSDOM(EMAILS.MARKETING);
	})
	.add('Parse # Cheerio # Marketing email', () => {
		cheerio.load(EMAILS.MARKETING);
	})
	.add('Parse # XmlDom # Marketing email', () => {
		const parser = new XmlDom.DOMParser();
		parser.parseFromString(EMAILS.MARKETING);
	});

suite
	.add('Quotation # TalonJS # Marketing email', () => {
		Talon.quotations.extractFromHtml(EMAILS.MARKETING);
	})
	.add('Quotation # Planer with JSDom # Marketing email', () => {
		const document = new jsdom.JSDOM().window.document;
		planer.extractFrom(EMAILS.MARKETING, 'text/html', document);
	});
// // Maybe there's a way to use Planer with XMLDom, but it needs trickery
// .add('Quotation # Planer with XMLDom # Marketing email', () => {
// 	const domImpl = new XmlDom.DOMImplementation();

// 	const document = {
// 		implementation: {
// 			createHTMLDocument: domImpl.createDocument.bind(domImpl),
// 		},
// 	};

// 	planer.extractFrom(EMAILS.MARKETING, 'text/html', document);
// });

suite.run();
