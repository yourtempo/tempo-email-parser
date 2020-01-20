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
import prepareMessage, {
	blockRemoteContent,
	linkify,
} from 'tempo-message-splitter';

const emailHtml = `
<div>Hello there</div>
`;

const remoteContentReplacements = {
	image: 'replacement-image-url', // Remote image URLs replacement. Default to 1x100 transparent image
	other: '#', // Other URLs replacements
};

// All options default to false.
const OPTIONS = {
	noQuotations: true,
	autolink: true,
	forceViewport: '<meta name="viewport" content="width=device-width" />',
	noRemoteContent: true,
	remoteContentReplacements,
	includeStyle: `
		.custom-style {
			color: red;
		}
	`,
};

const {
	// The extracted message
	messageHtml,
	// The whole message processed, including quotations and signature
	completeHtml,
	// Did we removed quotes or signature
	didFindQuotation,
} = prepareMessage(emailHtml, OPTIONS);
```

Autolinking and remote-content blocking are available as separate functions as well.

```js
const withLinks = linkify(messageHtml);

const noRemoteContent = blockRemoteContent(
	messageHtml,
	remoteContentReplacements
);
```

## Development

For tests

```
yarn run test
```

The main function `prepareMessage` has a list of fixtures used for tests. The input HTML are files named `xxx.input.html`. The expected outputs are named `xxx.output-complete.html` and `xxx.output-message.html`.

### `yarn run generate:fixtures`

This script generates the respective outputs files for any `.input.html` file found without corresponding outputs.

To easily add a fixture from a real-world email, you can put the input HTML at `/src/tests/prepareMessage/my-test.input.html`, and then run `yarn run generate:fixtures` to generate the output files based on what `prepareMessage` produced. You now only have to check that the outputs look good and make adjustments if necessary.
