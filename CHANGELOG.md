# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[unreleased]: https://github.com/pillarstudio/tempo-message-splitter/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/pillarstudio/tempo-message-splitter/releases/tag/v0.5.0
[0.4.0]: https://github.com/pillarstudio/tempo-message-splitter/releases/tag/v0.4.0
[0.3.0]: https://github.com/pillarstudio/tempo-message-splitter/releases/tag/v0.3.0
[0.2.0]: https://github.com/pillarstudio/tempo-message-splitter/releases/tag/v0.2.0
[0.1.0]: https://github.com/pillarstudio/tempo-message-splitter/releases/tag/v0.1.0
