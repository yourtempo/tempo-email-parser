import cheerio from 'cheerio';
import removeTrailingWhitespaces from '../removeTrailingWhitespaces';
import { expectHtml } from './utils';

describe('removeTrailingWhitespaces', () => {
	it('should trim an empty body', () => {
		check(
			`
    		<html><body></body></html>
				`,
			`
    		<html><head></head><body></body></html>
  	  `
		);
	});

	it('should trim an empty div', () => {
		check(
			`
    		<div></div>
			`,
			`<html><head></head><body></body></html>`
		);
	});

	it('should trim text', () => {
		check(
			`
				<html><head></head><body><div>Hello    </div></body></html>
			`,
			`
				<html><head></head><body><div>Hello</div></body></html>
    	`
		);
	});

	it('should trim br, and hr', () => {
		check(
			`
				<html><head></head><body><div>Hello<br/>  <hr/> <br/></div></body></html>
			`,
			`
				<html><head></head><body><div>Hello</div></body></html>
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
				<html><head></head><body><div>Hello</div></body></html>
			`,
			`
				<html><head></head><body><div>Hello</div></body></html>
    	`
		);
	});

	it('should not trim pre', () => {
		check(
			`
				<html><head></head><body><div>Hello <pre>Hi, this is code  </pre></div></body></html>
			`,
			`
				<html><head></head><body><div>Hello <pre>Hi, this is code  </pre></div></body></html>
    	`
		);
	});

	it('should stop trimming at img', () => {
		check(
			`
				<html><head></head><body><div>Hello <img src="src">  <br/></div></body></html>
			`,
			`
				<html><head></head><body><div>Hello <img src="src"></div></body></html>
    	`
		);
	});

	it('should trim recursively up the HTML tree', () => {
		check(
			`
				<html><head></head><body><div><div>Hello <hr> </div> <br/></div></body></html>
			`,
			`
				<html><head></head><body><div><div>Hello</div></div></body></html>
    	`
		);
	});

	it('should trim remnants of signature', () => {
		check(
			`
				<html><head></head><body><div><div>Hello </div><br clear="all"><br>-- <br></div></body></html>
			`,
			`
				<html><head></head><body><div><div>Hello</div></div></body></html>
    	`
		);
	});

	it('should trim comments', () => {
		check(
			`
				<html>
					<head></head>
					<body>
						<div>
							<div>Hello</div>
							<p>
								<!-- Some extra spaces -->
								<br />
							</p>
						</div>
					</body>
				</html>
			`,
			`
				<html>
					<head></head>
					<body>
						<div>
							<div>Hello</div>
						</div>
					</body>
				</html>
			`
		);
	});
});

function check(before: string, after: string) {
	const $ = cheerio.load(before);
	removeTrailingWhitespaces($);
	const result = $.html();
	expectHtml(result, after);
}
