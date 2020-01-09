import expect from 'expect';
import cheerio from 'cheerio';
import enforceViewport from './enforceViewport';

describe('enforceViewport', () => {
	it('should add missing viewport', () => {
		const email = `
      <html><head></head><div>Hello</div></html>
    `;

		const $ = cheerio.load(email);
		enforceViewport($);

		expect($.html()).toBe(`
      <html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><div>Hello</div></html>
    `);
	});

	it('should add missing head tag', () => {
		const email = `
      <html><div>Hello</div></html>
    `;

		const $ = cheerio.load(email);
		enforceViewport($);

		expect($.html()).toBe(`
      <html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><div>Hello</div></html>
    `);
	});

	it('should add missing html tag', () => {
		const email = `
      <div>Hello</div>
    `;

		const $ = cheerio.load(email);
		enforceViewport($);

		expect($.html()).toBe(`
      <html xmlns="http://www.w3.org/1999/xhtml"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><div>Hello</div></html>
    `);
	});

	it('should replace existing viewports', () => {
		const email = `
      <html><head>
        <meta name="viewport" content="width=device-width">
        <meta name="viewport" content="width=320">
      </head><div>Hello</div></html>
    `;

		const $ = cheerio.load(email);
		enforceViewport($);

		expect($.html()).toBe(`
      <html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
      </head><div>Hello</div></html>
    `);
	});
});
