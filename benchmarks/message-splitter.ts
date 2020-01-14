/*
These benchmarks measures the performance of the message-splitter module
 */

import cheerio from 'cheerio';
import { createSuite, createBasicSuite } from './utils';
import prepareMessage, { removeQuotations, linkify } from '../src';
import EMAILS from './emails';

const suite = createBasicSuite();

// Measure against a real-world, HTML-heavy, marketing email
suite
	.add('removeQuotations # Marketing email', () => {
		removeQuotations(cheerio.load(EMAILS.MARKETING));
	})
	.add('linkify # Marketing email', () => {
		linkify(EMAILS.MARKETING);
	})
	.add('prepareMessage # Marketing email', () => {
		prepareMessage(EMAILS.MARKETING);
	});

//  Using a linear scale of input complexity, we can see if the time complexity is linear.
suite
	.add('removeQuotations # Size 1', () => {
		removeQuotations(cheerio.load(EMAILS.BASIC));
	})
	.add('removeQuotations # Size 2', () => {
		removeQuotations(cheerio.load(EMAILS.BASIC_REPLIED_X1));
	})
	.add('removeQuotations # Size 3', () => {
		removeQuotations(cheerio.load(EMAILS.BASIC_REPLIED_X2));
	});

suite
	.add('linkify # Size 1', () => {
		linkify(EMAILS.BASIC);
	})
	.add('linkify # Size 2', () => {
		linkify(EMAILS.BASIC_REPLIED_X1);
	})
	.add('linkify # Size 3', () => {
		linkify(EMAILS.BASIC_REPLIED_X2);
	});

suite
	.add('prepareMessage # Size 1', () => {
		prepareMessage(EMAILS.BASIC);
	})
	.add('prepareMessage # Size 2', () => {
		prepareMessage(EMAILS.BASIC_REPLIED_X1);
	})
	.add('prepareMessage # Size 3', () => {
		prepareMessage(EMAILS.BASIC_REPLIED_X2);
	});

suite.run();
