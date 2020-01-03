import fs from 'fs';
import path from 'path';

function readFile(relativePath: string): string {
	return fs.readFileSync(path.join(__dirname, relativePath)).toString();
}

const EMAILS = {
	BASIC: readFile('basic-lorem-gmail.html'),
	BASIC_REPLIED_X1: readFile('basic-lorem-gmail-replied-x1.html'),
	BASIC_REPLIED_X2: readFile('basic-lorem-gmail-replied-x2.html'),
	MARKETING: readFile('marketing-gmail.html'),
};

export default EMAILS;
