import cheerio from 'cheerio';
import { expectHtml } from '../utils';
import blockRemoteContent from '../../blockRemoteContent';

describe('remote-content', () => {
	it('should replace remote content URLs in style tags and attributes', () => {
		const input = `
			<html>
				<head>
					<style>
						@import url('https://remote.com/style.css');

						p {
							background-image: url(https://remote.com/image.png);
						}
					</style>
				</head>
				<body>
					<p
						style="background: url(http://remote.com/asdf/foo/bar.jpg)"
					>
						Hello
					</p>
					<style>
						@import url('https://remote.com/style.css');

						p {
							background-image: url('foo/bar.jpg');
							background-image: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7);
							background-image: url('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
							background-image: url(http://remote.com/asdf/foo/bar.jpg);
							background-image: url('https://remote.com/asdf/foo/bar.jpg');
							background-image: url('http://remote.com/asdf/foo/bar.jpg');
						}
					</style>
				</body>
			</html>
		`;

		const expected = `
			<html>
				<head>
					<style>
						@import url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

						p {
							background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);
						}
					</style>
				</head>
				<body>
					<p
						style="background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=)"
					>
						Hello
					</p>
					<style>
						@import url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

						p {
							background-image: url('foo/bar.jpg');
							background-image: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7);
							background-image: url('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
							background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);
							background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
							background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
						}
					</style>
				</body>
			</html>
		`;

		const $ = cheerio.load(input);
		blockRemoteContent($);
		const actual = $.html();

		expectHtml(actual, expected);
	});
});
