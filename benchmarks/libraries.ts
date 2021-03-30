/*
These benchmarks compare different libraries (not all are used by this project).
This helps estimate the cost of using any of them.
 */

import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
import * as htmlparser2 from 'htmlparser2';
import createDOMPurify from 'dompurify';
import cheerio from 'cheerio';
import Talon from 'talonjs';
import XmlDom from 'xmldom';
import planer from 'planer';
import Autolinker from 'autolinker';
import linkifyHtml from 'linkifyjs/html';

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
	.add('Parse # HtmlParser2 # Marketing email', () => {
		htmlparser2.parseDOM(EMAILS.MARKETING);
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

suite
	.add('Auto links # Marketing # autolink', () => {
		Autolinker.link(EMAILS.MARKETING);
	})
	.add('Auto links # Marketing # linkify', () => {
		linkifyHtml(EMAILS.MARKETING);
	});

suite.run();
