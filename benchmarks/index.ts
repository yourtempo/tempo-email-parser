import jsdom from 'jsdom';
import cheerio from 'cheerio';
import Benchmark from 'benchmark';

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
	.add('Parse#JSDom Size 1', () => {
		new jsdom.JSDOM(EMAILS.BASIC);
	})
	.add('Parse#JSDom Size 2', () => {
		new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X1);
	})
	.add('Parse#JSDom Size 3', () => {
		new jsdom.JSDOM(EMAILS.BASIC_REPLIED_X2);
	})
	.add('Parse#Cheerio Size 1', () => {
		cheerio.load(EMAILS.BASIC);
	})
	.add('Parse#Cheerio Size 2', () => {
		cheerio.load(EMAILS.BASIC_REPLIED_X1);
	})
	.add('Parse#Cheerio Size 3', () => {
		cheerio.load(EMAILS.BASIC_REPLIED_X2);
	});

// Test parsing a real-world, HTML-heavy, marketing email
suite
	.add('Parse#JSDom Marketing email', () => {
		new jsdom.JSDOM(EMAILS.MARKETING);
	})
	.add('Parse#Cheerio Marketing email', () => {
		cheerio.load(EMAILS.MARKETING);
	});

suite.run();
