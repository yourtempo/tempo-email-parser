/*
These benchmarks compare different libraries (not all are used by this project).
This helps estimate the cost of using any of them.
 */

import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
import createDOMPurify from 'dompurify';
import cheerio from 'cheerio';
import Talon from 'talonjs';
import XmlDom from 'xmldom';
import planer from 'planer';

import { createSuite } from './utils';
import EMAILS from './emails';

const suite = createSuite();

// Test parsing a real-world, HTML-heavy, marketing email
suite
	.add('Parse # JSDom # Marketing email', () => {
		new JSDOM(EMAILS.MARKETING);
	})
	.add('Parse # Cheerio # Marketing email', () => {
		cheerio.load(EMAILS.MARKETING);
	})
	.add('Parse # XmlDom # Marketing email', () => {
		const parser = new XmlDom.DOMParser();
		parser.parseFromString(EMAILS.MARKETING);
	});

const window = new JSDOM().window;
const DOMPurify = createDOMPurify(window);

suite
	.add('Sanitizing # Marketing # DOMPurify', () => {
		DOMPurify.sanitize(EMAILS.MARKETING, { WHOLE_DOCUMENT: true });
	})
	.add('Sanitizing # Marketing # sanitize-html', () => {
		sanitizeHtml(EMAILS.MARKETING);
	});

suite
	.add('Quotation # TalonJS # Marketing email', () => {
		Talon.quotations.extractFromHtml(EMAILS.MARKETING);
	})
	.add('Quotation # Planer with JSDom # Marketing email', () => {
		const document = new JSDOM().window.document;
		planer.extractFrom(EMAILS.MARKETING, 'text/html', document);
	});

// Test a simple parsing on basic HTML. Using a linear scale of input complexity, we can see if the performance is linear or worst.
suite
	.add('Parse # JSDom # Size 1', () => {
		new JSDOM(EMAILS.BASIC);
	})
	.add('Parse # JSDom # Size 2', () => {
		new JSDOM(EMAILS.BASIC_REPLIED_X1);
	})
	.add('Parse # JSDom # Size 3', () => {
		new JSDOM(EMAILS.BASIC_REPLIED_X2);
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
suite.run();
