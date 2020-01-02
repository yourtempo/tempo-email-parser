/* global test, expect */
const { removeQuotedHtml } = require('./quoteHtmlHelper');

const email_1 = {
	before: `<div>Hello Alice,How have you been?<blockquote>Inline quote<blockquote>subquote</blockquote></blockquote></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

const email_2 = {
	before: `<div>Hello Alice,How have you been?<blockquote>Inline quote<blockquote>subquote</blockquote></blockquote><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature">My Signature</div></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

const email_3 = {
	before: `<div>Hello Alice,How have you been?<blockquote>Inline quote<blockquote>subquote</blockquote></blockquote><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature">My Signature</div><br><br></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

const email_4 = {
	before: `<div>Hello Alice,How have you been?<blockquote>Inline quote<blockquote>subquote</blockquote></blockquote>--<br /><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature">My Signature</div><br><br></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

const email_5 = {
	before: `<div>Hello Alice,How have you been?<img class="mailspring-open" alt="Sent from Mailspring" width="0" height="0" style="border:0; width:0; height:0;" src="https://link.getmailspring.com/open/A0B46432-926C-4E6F-B27F-36491945FDD5@getmailspring.com?recipient=bWVAb25ub3NjaHdhbmVuLmNvbQ%3D%3D"></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

const email_6 = {
	before: `<div>Hello Alice,How have you been?<img class="mailspring-open" alt="Sent from Mailspring" width="1" height="1" style="border:0; width:0; height:0;" src="https://link.getmailspring.com/open/A0B46432-926C-4E6F-B27F-36491945FDD5@getmailspring.com?recipient=bWVAb25ub3NjaHdhbmVuLmNvbQ%3D%3D"></div>`,
	after: `<div>Hello Alice,How have you been?</div>`,
};

// Test for bug reported by user on
const email_7 = {
	before: `<html><body>Link: <a href="https://yourtempo.co">https://yourtempo.co</a>. Person as<br>On Jan 01, 2020, at 00:00 AM, Tempo &lt;contact@yourtempo.co&gt; wrote:</body></html>`,
	after: `Link: <a href="https://yourtempo.co">https://yourtempo.co</a>. Person as`,
};

const email_8 = {
	before: `<html><body>Link: <a href="https://yourtempo.co">https://yourtempo.co</a>. Foo<br>On Jan 01, 2020, at 00:00 AM, Tempo &lt;contact@yourtempo.co&gt; wrote:</body></html>`,
	after: `Link: <a href="https://yourtempo.co">https://yourtempo.co</a>. Foo`,
};

const email_9 = {
	before: `<div name="messageBodySection"><div dir="auto">Thanks!</div></div><div name="messageReplySection">On Dec 10, 2019, 7:18 AM -0800, Onno Schwanen &lt;onno@yourtempo.co&gt;, wrote:<br /></div>`,
	after: `<div name="messageBodySection"><div dir="auto">Thanks!</div></div>`,
};

const email_10 = {
	before: `<div>Hello</div><div>On December 3, 2019 at 05:01, Onno Schwanen wrote:</div><blockquote></blockquote>`,
	after: `<div>Hello</div>`,
};

// apple mail plain reply
const apple_mail_01 = {
	before: `<html><head><meta http-equiv="Content-Type" content="text/html; charset=us-ascii"></head><body style="word-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;" class="">Reply with Apple Mail<br class=""><div><br class=""><blockquote type="cite" class=""><div class="">On 13. Dec 2019, at 12:10, Onno Schwanen &lt;<a href="mailto:onno@yourtempo.co" class="">onno@yourtempo.co</a>&gt; wrote:</div><br class="Apple-interchange-newline"><div class=""><p class="">Please reply on this</p></div></blockquote></div><br class=""></body></html>`,
	after: `Reply with Apple Mail`,
};

// const outlook_mobile_ios_01 = {
// 	before: `<html>
// 	<head>
// 	<meta http-equiv="Content-Type" content="text/html; charset=us-ascii">
// 	</head>
// 	<body>
// 	<div>
// 	<div>
// 	<div>
// 	<div style="direction: ltr;">Here is your reply</div>
// 	</div>
// 	<div><br>
// 	</div>
// 	<div class="ms-outlook-ios-signature">Get <a href="https://aka.ms/o0ukef">Outlook for iOS</a></div>
// 	</div>
// 	<div>&nbsp;</div>
// 	<hr style="display:inline-block;width:98%" tabindex="-1">
// 	<div id="divRplyFwdMsg" dir="ltr"><font face="Calibri, sans-serif"><b>From:</b> Onno Schwanen &lt;onno@yourtempo.co&gt;<br>
// 	<b>Sent:</b> Friday, December 13, 2019 12:32 PM<br>
// 	<b>To:</b> Onno Schwanen<br>
// 	<b>Subject:</b> Outlook mobile reply
// 	<div>&nbsp;</div>
// 	</font></div>
// 	<meta content="text/html; charset=utf-8">
// 	<p>Can you reply?</p>
// 	</div>
// 	</body>
// 	</html>`,
// 	after: ``,
// };

test('removeQuotedHtml', () => {
	expect(removeQuotedHtml(email_1.before)['html']).toEqual(email_1.after);
	expect(removeQuotedHtml(email_2.before)['html']).toEqual(email_2.after);
	expect(removeQuotedHtml(email_3.before)['html']).toEqual(email_3.after);
	expect(removeQuotedHtml(email_4.before)['html']).toEqual(email_4.after);
	expect(removeQuotedHtml(email_5.before)['html']).toEqual(email_5.after);
	expect(removeQuotedHtml(email_6.before)['html']).toEqual(email_6.after);
	expect(removeQuotedHtml(email_7.before)['html']).toEqual(email_7.after);
	expect(removeQuotedHtml(email_8.before)['html']).toEqual(email_8.after);
	expect(removeQuotedHtml(email_9.before)['html']).toEqual(email_9.after);
	expect(removeQuotedHtml(email_10.before)['html']).toEqual(email_10.after);
	expect(removeQuotedHtml(apple_mail_01.before)['html']).toEqual(
		apple_mail_01.after
	);
});
