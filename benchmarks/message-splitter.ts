/*
These benchmarks measures the performance of the message-splitter module
 */

import cheerio from 'cheerio';
import { createSuite } from './utils';
import prepareMessage, { linkify } from '../src';
import EMAILS from './emails';
import removeQuotations from '../src/removeQuotations';

const suite = createSuite();

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
