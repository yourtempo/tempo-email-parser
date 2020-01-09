# tempo-message-splitter

Parse and extract main message from an HTML email.
Also runs several transformations to the email so that it can be displayed safely and correctly.

-   Extract quotations (replies), signatures
-   Remove scripts, trackers
-   Convert text links into anchor tags
-   Remove trailing whitespaces

## Usage

```ts
import prepareMessage from 'tempo-message-splitter';

const emailHtml = `
<div>Hello there</div>
`;

const OPTIONS = {
	noSignature: true,
	noQuotations: true,
	noTrackers: true,
	noTrailingWhitespaces: true,
	noScript: true,
	autolink: true,
	forceMobileViewport: true,
};

const {
	// The extracted message
	messageHtml,
	// The whole message processed, including quotations and signature
	completeHtml,
} = prepareMessage(emailHtml, OPTIONS);
```
