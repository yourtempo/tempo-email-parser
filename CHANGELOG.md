# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

## [0.7.7] - 2021-09-29

-   #32 Added exception to accept <head> inside a blockquote (for when replying)

## [0.7.6] - 2021-09-22

-   #35 Avoid linkifying URLs in GitHub's emoji components

## [0.7.5] - 2021-03-30

-   #31 Automatically fix emails with a broken <head>.

## [0.7.4] - 2020-12-28

-   #30 Fixed unwanted removal of spaces near the end of emails.

## [0.7.3] - 2020-09-25

-   #29 Fixed a bug where the trimming of messages would break the HTML structure and fail to extract quotes

## [0.7.2] - 2020-03-25

-   #26 `enforceMobileViewport` should always insert the viewport-tag to the head element in the top

## [0.7.0] - 2020-01-20

-   Changed package name to `@yourtempo/tempo-email-parser`
-   Changed all default options for `prepareMessage` to be false. You now need to explicitly enable each feature.
-   `enforceMobileViewport` option is now `forceViewport` and is an optional HTML string for the viewport meta tag to set.
-   Add option to include custom style

## [0.6.1] - 2020-01-20

-   Added option for remote-content replacements in `prepareMessage`

## [0.6.0] - 2020-01-17

-   Only block refresh meta tags when blocking remote content
-   Export standalone `blockRemoteContent` function

## [0.5.0] - 2020-01-17

-   #25 Upgraded to cheerio@1.0.0-rc3, which fix cases of breaking HTML
-   Replaced linkifyjs dependency with autolink. Faster, better, stronger.
-   #23 Detect "On date, somebody wrote:" in different languages.
-   Do not consider attachements URLs as remote content (cid: URLs)
-   Fix whitespace trimming which was dumping nodes by mistake

## [0.4.0] - 2020-01-15

-   #20 Added detection of inline quotes, as to not remove them
-   #22 Fixed bug with detection of reply headers (On ... wrote:)
-   Removed options `noTrailingWhitespaces`, `noScript`, and `noTracker` until they're actually necessary

## [0.3.0] - 2020-01-14

Replaced TalonJS with old quote removal implementation

## [0.2.0] - 2020-01-13

Added remote-content blocking

## [0.1.0] - 2020-01-09

First version for integration tests. Include the following features

-   Extract quotations
-   Extract basic signatures
-   Remove script tags and comments
-   Remove pixel trackers
-   Remove trailing whitespaces
-   Force viewport for mobile device

[unreleased]: https://github.com/yourtempo/tempo-email-parser/compare/v0.7.7...HEAD
[0.7.7]: https://github.com/yourtempo/tempo-email-parser/compare/v0.7.7...HEAD
[0.7.6]: https://github.com/yourtempo/tempo-email-parser/compare/v0.7.6...HEAD
[0.7.5]: https://github.com/yourtempo/tempo-email-parser/compare/v0.7.5...HEAD
[0.7.4]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.7.4
[0.7.3]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.7.3
[0.7.2]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.7.2
[0.7.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.7.0
[0.6.1]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.6.1
[0.6.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.6.0
[0.5.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.5.0
[0.4.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.4.0
[0.3.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.3.0
[0.2.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.2.0
[0.1.0]: https://github.com/yourtempo/tempo-email-parser/releases/tag/v0.1.0
