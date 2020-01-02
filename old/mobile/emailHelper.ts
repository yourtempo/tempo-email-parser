import cheerio from 'cheerio';
import cheerioConfig from '@config/cheerioConfig';

global.Buffer = global.Buffer || require('buffer').Buffer;

export const getEmailDomain = (
	email: string,
	includeExtension: boolean
): string => {
	if (email) {
		const regex: any = includeExtension ? /@(.*)/ : /@(.*)\./;
		const arr: string[] | null = email.match(regex);

		if (arr) {
			const value: string | undefined = arr.pop();

			if (value) {
				return (
					value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
				);
			}
		}
	}

	return '';
};

const BLOCKED_DOMAINS = [
	/* Default domains included */
	'aol.com',
	'att.net',
	'comcast.net',
	'facebook.com',
	'gmail.com',
	'gmx.com',
	'googlemail.com',
	'google.com',
	'hotmail.com',
	'hotmail.co.uk',
	'mac.com',
	'me.com',
	'mail.com',
	'msn.com',
	'live.com',
	'sbcglobal.net',
	'verizon.net',
	'yahoo.com',
	'yahoo.co.uk',

	/* Other global domains */
	'email.com',
	'fastmail.fm',
	'games.com' /* AOL */,
	'gmx.net',
	'hush.com',
	'hushmail.com',
	'icloud.com',
	'iname.com',
	'inbox.com',
	'lavabit.com',
	'love.com' /* AOL */,
	'me.com',
	'outlook.com',
	'pobox.com',
	'protonmail.com',
	'rocketmail.com' /* Yahoo */,
	'safe-mail.net',
	'wow.com' /* AOL */,
	'ygm.com' /* AOL */,
	'ymail.com' /* Yahoo */,
	'zoho.com',
	'yandex.com',

	/* United States ISP domains */
	'bellsouth.net',
	'charter.net',
	'cox.net',
	'earthlink.net',
	'juno.com',

	/* British ISP domains */
	'btinternet.com',
	'virginmedia.com',
	'blueyonder.co.uk',
	'freeserve.co.uk',
	'live.co.uk',
	'ntlworld.com',
	'o2.co.uk',
	'orange.net',
	'sky.com',
	'talktalk.co.uk',
	'tiscali.co.uk',
	'virgin.net',
	'wanadoo.co.uk',
	'bt.com',

	/* Domains used in Asia */
	'sina.com',
	'sina.cn',
	'qq.com',
	'naver.com',
	'hanmail.net',
	'daum.net',
	'nate.com',
	'yahoo.co.jp',
	'yahoo.co.kr',
	'yahoo.co.id',
	'yahoo.co.in',
	'yahoo.com.sg',
	'yahoo.com.ph',
	'163.com',
	'126.com',
	'aliyun.com',
	'foxmail.com',

	/* French ISP domains */
	'hotmail.fr',
	'live.fr',
	'laposte.net',
	'yahoo.fr',
	'wanadoo.fr',
	'orange.fr',
	'gmx.fr',
	'sfr.fr',
	'neuf.fr',
	'free.fr',

	/* German ISP domains */
	'gmx.de',
	'hotmail.de',
	'live.de',
	'online.de',
	't-online.de' /* T-Mobile */,
	'web.de',
	'yahoo.de',

	/* Italian ISP domains */
	'libero.it',
	'virgilio.it',
	'hotmail.it',
	'aol.it',
	'tiscali.it',
	'alice.it',
	'live.it',
	'yahoo.it',
	'email.it',
	'tin.it',
	'poste.it',
	'teletu.it',

	/* Russian ISP domains */
	'mail.ru',
	'rambler.ru',
	'yandex.ru',
	'ya.ru',
	'list.ru',

	/* Belgian ISP domains */
	'hotmail.be',
	'live.be',
	'skynet.be',
	'voo.be',
	'tvcablenet.be',
	'telenet.be',

	/* Argentinian ISP domains */
	'hotmail.com.ar',
	'live.com.ar',
	'yahoo.com.ar',
	'fibertel.com.ar',
	'speedy.com.ar',
	'arnet.com.ar',

	/* Domains used in Mexico */
	'yahoo.com.mx',
	'live.com.mx',
	'hotmail.es',
	'hotmail.com.mx',
	'prodigy.net.mx',

	/* Domains used in Brazil */
	'yahoo.com.br',
	'hotmail.com.br',
	'outlook.com.br',
	'uol.com.br',
	'bol.com.br',
	'terra.com.br',
	'ig.com.br',
	'itelefonica.com.br',
	'r7.com',
	'zipmail.com.br',
	'globo.com',
	'globomail.com',
	'oi.com.br',
];

export const isBlacklistedDomain = (domain: string): boolean => {
	if (domain) {
		return BLOCKED_DOMAINS.includes(domain.toLowerCase());
	}

	return false;
};

export const findQuotes = ($: CheerioStatic) => {
	return $('blockquote, .gmail_quote, .gmail_signature, signature');
};

export const getStyleElement = ($: CheerioStatic): string => {
	const styles = $('style');

	let styleElement = '<style>';

	styles.each((_, el) => {
		styleElement += $(el).html();
	});
	styleElement += '</style>';

	return styleElement;
};

export const removeQuotes = ($: CheerioStatic, quotes) => {
	quotes.each((_, el) => {
		$(el).remove();
	});
};

// export const removeBottomSpacing = ($: CheerioStatic) => {
// 	const li = $($.root().children);

// 	for (let i = li.length - 1; i >= 0; i--) {

// 	}
// };

export const removeUnwanted = ($: CheerioStatic) => {
	const query =
		'img[width="0"], img[width="1"], img[height="0"], img[height="1"], img[src*="http://mailstat.us"], script, meta[name="viewport"]';

	$(query).each((_, el) => {
		$(el).remove();
	});
};

type MessageSplit = {
	message: string;
	hasQuotes: boolean;
	// styleElement: string;
};

export const prepareMessage = (
	html: string,
	fullMessage: boolean
): MessageSplit => {
	const $ = cheerio.load(html, cheerioConfig);

	removeUnwanted($);

	const quotes = findQuotes($);
	const styleElement = getStyleElement($);

	if (!fullMessage) {
		removeQuotes($, quotes);
	}

	const body = $('body');
	let message;

	if (body.length === 0) {
		message = `<body>${$.html()}</body>`;
	} else {
		message = body.html();
	}

	const meta = `<meta name="viewport" content="width=device-width" />`;
	message = `<!doctype html><html xmlns="http://www.w3.org/1999/xhtml"><head>${meta}${styleElement}</head>${message}</html>`;

	return {
		message,
		hasQuotes: quotes.length > 0,
	};
};
