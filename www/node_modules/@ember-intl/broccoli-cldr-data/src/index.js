/* jshint node: true */

'use strict';

/**
* Copyright 2015, Yahoo! Inc.
* Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/
const extractor = require('@ember-intl/formatjs-extract-cldr-data');
const CachingWriter = require('broccoli-caching-writer');
const serialize = require('serialize-javascript');
const mkdirp = require('mkdirp');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

Plugin.prototype = Object.create(CachingWriter.prototype);
Plugin.prototype.constructor = Plugin;

function Plugin(inputNodes, options) {
  if (!(this instanceof Plugin)) {
    return new Plugin(inputNodes, options);
  }

  if (!Array.isArray(inputNodes)) {
    inputNodes = [inputNodes];
  }

  this._options = Object.assign(
    {
      // formatjs-extract-cldr-data options
      locales: null,
      pluralRules: true,
      relativeFields: false,
      numberFields: false,

      // plugin options
      destDir: '',
      prelude: '',
      moduleType: 'es6'
    },
    options
  );

  CachingWriter.call(this, inputNodes, {
    annotation: this._options.annotation
  });

  if (Array.isArray(this._options.locales)) {
    this._options.locales = this._options.locales.map(locale => this.normalizeLocale(locale));
  }
}

Plugin.prototype.normalizeLocale = function(locale) {
  assert(typeof locale === 'string', 'Locale ' + locale + ' was provided, but a string was expected.');

  if (typeof locale === 'string') {
    return locale.trim().replace(/_/g, '-');
  }

  return locale;
};

Plugin.prototype.writeFileSync = function(groupedByLanguage) {
  let options = this._options;
  let outputPath = path.join(this.outputPath, options.destDir);
  let prefix = options.moduleType.toLowerCase() === 'es6' ? 'export default' : 'module.exports =';

  mkdirp.sync(outputPath);

  for (let language in groupedByLanguage) {
    let languageData = prefix + ' ' + serialize(groupedByLanguage[language]) + ';';

    fs.writeFileSync(path.join(outputPath, language.toLowerCase() + '.js'), options.prelude.concat(languageData), {
      encoding: 'utf8'
    });
  }
};

Plugin.prototype.build = function() {
  let data = extractor({
    locales: this._options.locales,
    pluralRules: this._options.pluralRules,
    relativeFields: this._options.relativeFields,
    numberFields: this._options.numberFields
  });

  let groupedByLanguage = Object.keys(data).reduce(
    (ret, locale) => {
      let lang = locale.split('-')[0];
      let langData = ret[lang] || [];
      ret[lang] = langData.concat(data[locale]);

      return ret;
    },
    Object.create(null)
  );

  return this.writeFileSync(groupedByLanguage);
};

module.exports = Plugin;
