# broccoli-cldr-data

[![npm Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]

Broccoli plugin for writing results of [formatjs-extract-cldr-data][] to a broccoli node grouped by language.

```js
var extract = require('broccoli-cldr-data');

extract(inputNode, {
  locales: ['fr-ca', 'en-ca'], /* defaults to all locales */
  moduleType: 'commonjs', /* options: commonjs, es6 */
  pluralRules: true, /* defaults to true */
  relativeFields: true, /* defaults to false */
  numberFields: true /* defaults to false */
});
```

```js
// en.js
module.exports = [
{"locale":"en-CA","parentLocale":"en-001"},
{"locale":"en-001","parentLocale":"en"},
{"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}}];
```

```js
// fr.js
module.exports = [
{"locale":"fr-CA","parentLocale":"fr"},
{"locale":"fr","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return n>=0&&n<2?"one":"other"}}
];
```

## License

This software is free to use under the MIT license. See the [LICENSE file][] for license text and copyright information.

The underlying formatjs-extract-cldr-data is licensed under the Yahoo Inc. BSD license. See the [FormatJS license files][] for their license text and copyright information.

The CLDR data contained in this packaged is licensed under the Apache, ICU, and Unicode licenses. See the [CLDR license files][] for their license text and copyright information.

[npm]: https://www.npmjs.org/package/broccoli-cldr-data
[npm-badge]: https://img.shields.io/npm/v/broccoli-cldr-data.svg?style=flat-square
[travis]: https://travis-ci.org/ember-intl/broccoli-cldr-data
[travis-badge]: https://img.shields.io/travis/ember-intl/broccoli-cldr-data/master.svg?style=flat-square
[LICENSE file]: https://github.com/ember-intl/broccoli-cldr-data/blob/master/LICENSE
[CLDR license files]: https://github.com/ember-intl/formatjs-extract-cldr-data/tree/master/data
[FormatJS license files]: https://github.com/ember-intl/formatjs-extract-cldr-data/blob/master/LICENSE
[formatjs-extract-cldr-data]: https://github.com/ember-intl/formatjs-extract-cldr-data
