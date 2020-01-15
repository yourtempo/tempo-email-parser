# tempo-message-splitter

Parse and extract main message from an HTML email.
Also runs several transformations to the email so that it can be displayed safely and correctly.

-   Extract quotations (replies), signatures
-   Remove scripts, trackers
-   Convert text links into anchor tags
-   Remove trailing whitespaces
-   Block remote content

## Usage

```ts
import prepareMessage from 'tempo-message-splitter';

const emailHtml = `
<div>Hello there</div>
`;

const OPTIONS = {
	noQuotations: true,
	autolink: true,
	forceMobileViewport: true,
	noRemoteContent: true,
};

const {
	// The extracted message
	messageHtml,
	// The whole message processed, including quotations and signature
	completeHtml,
	// Did we removed quotes
	didFindQuote,
	// Did we removed a signature
	didFindSignature,
} = prepareMessage(emailHtml, OPTIONS);
```
