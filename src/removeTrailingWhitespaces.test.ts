import cheerio from 'cheerio';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';

describe('removeTrailingWhitespaces', () => {
	it('should trim an empty body', () => {
		check(
			`
    		<html><body></body></html>
				`,
			`
    		<html><body></body></html>
  	  `
		);
	});

	it('should trim an empty div', () => {
		check(
			`
    		<div></div>
			`,
			``
		);
	});

	it('should trim text', () => {
		check(
			`
    		<div>Hello    </div>
			`,
			`
    		<div>Hello</div>
    	`
		);
	});

	it('should trim br, and hr', () => {
		check(
			`
    		<div>Hello<br/>  <hr/> <br/></div>
			`,
			`
    		<div>Hello</div>
    	`
		);
	});

	it('should trim inside a body', () => {
		check(
			`
				<html><head><meta charset="utf-8"></head><body><div>Hello<br/>  <hr/> <br/></div></body></html>
			`,
			`
			  <html><head><meta charset="utf-8"></head><body><div>Hello</div></body></html>
	`
		);
	});

	it('should not change trimmed content', () => {
		check(
			`
    		<div>Hello</div>
			`,
			`
    		<div>Hello</div>
    	`
		);
	});

	it('should not trim pre', () => {
		check(
			`
    		<div>Hello <pre>Hi, this is code  </pre></div>
			`,
			`
				<div>Hello <pre>Hi, this is code  </pre></div>
    	`
		);
	});

	it('should stop trimming at img', () => {
		check(
			`
    		<div>Hello <img src="src">  <br/></div>
			`,
			`
				<div>Hello <img src="src"></div>
    	`
		);
	});

	it('should trim recursively up the HTML tree', () => {
		check(
			`
    		<div><div>Hello <hr> </div> <br/></div>
			`,
			`
				<div><div>Hello</div></div>
    	`
		);
	});
});

function check(before: string, after: string) {
	const $ = cheerio.load(before.trim());
	removeTrailingWhitespaces($);
	const result = $.html();
	expect(result).toBe(after.trim());
}
