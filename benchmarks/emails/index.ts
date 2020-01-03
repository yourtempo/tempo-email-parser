import fs from 'fs';
import path from 'path';

function readFile(relativePath: string): string {
	return fs.readFileSync(path.join(__dirname, relativePath)).toString();
}

const EMAILS = {
	/*
	BASICS are basic emails with inline formatting such as bold. `x1` and `x2` are self-replied versions of the first. They increase in size approximately by a linear factor of 1, 2 and 3.
	*/
	BASIC: readFile('basic-lorem-gmail.html'), // 1.7K
	BASIC_REPLIED_X1: readFile('basic-lorem-gmail-replied-x1.html'), // 3.7K
	BASIC_REPLIED_X2: readFile('basic-lorem-gmail-replied-x2.html'), // 6.2K

	/*
	This is a real-world marketing email. It has a large size, and contains heavy HTML and CSS.
	*/

	MARKETING: readFile('marketing-gmail.html'), // 102K
};

export default EMAILS;
