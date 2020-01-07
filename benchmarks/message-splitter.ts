/*
These benchmarks measures the performance of the message-splitter module
 */

import Benchmark from 'benchmark';

import { printResult, extractResult } from './utils';
import { removeQuotations, linkify } from '../src';
import EMAILS from './emails';

const suite = new Benchmark.Suite();

// On each benchmark completion
suite.on('cycle', (event: any) => {
	const result = extractResult(event);
	printResult(result);
});

//  Using a linear scale of input complexity, we can see if the time complexity is linear.
suite
	.add('removeQuotations # Size 1', () => {
		removeQuotations(EMAILS.BASIC);
	})
	.add('removeQuotations # Size 2', () => {
		removeQuotations(EMAILS.BASIC_REPLIED_X1);
	})
	.add('removeQuotations # Size 3', () => {
		removeQuotations(EMAILS.BASIC_REPLIED_X2);
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

// Measure against a real-world, HTML-heavy, marketing email
suite
	.add('removeQuotations # Marketing email', () => {
		removeQuotations(EMAILS.MARKETING);
	})
	.add('linkify # Marketing email', () => {
		linkify(EMAILS.MARKETING);
	});

suite.run();
