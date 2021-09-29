/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
'use strict';

var p = require('path');

var getParentLocale = require('./locales').getParentLocale;
var hasNumberFields   = require('./locales').hasNumberFields;
var normalizeLocale = require('./locales').normalizeLocale;

// The set of CLDR date field names that are used in FormatJS.
var NUMBER_FIELD_NAMES = [
  'decimalFormats-numberSystem-latn'
];

var FORMAT_FIELD_NAMES = [
    'long',
    'short',
];

module.exports = function extractNumberFields(locales) {
    // The CLDR states that the "root" locale's data should be used to fill in
    // any missing data as its data is the default.
    var defaultFields = loadNumberFields('root');

    var fields = {};
    var hashes = {};

    // Loads and caches the relative fields for a given `locale` because loading
    // and transforming the data is expensive.
    function getNumberFields(locale) {
        var numberFields = fields[locale];
        if (numberFields) {
            return numberFields;
        }

        if (hasNumberFields(locale)) {
            numberFields = fields[locale] = loadNumberFields(locale);
            return numberFields;
        }
    }

    // Hashes and caches the `fields` for a given `locale` to avoid hashing more
    // than once since it could be expensive.
    function hashFields(locale, fields) {
        var hash = hashes[locale];
        if (hash) {
            return hash;
        }

        hash = hashes[locale] = JSON.stringify(fields);
        return hash;
    }

    // We want to de-dup data that can be referenced from upstream in the
    // `locale`'s hierarchy when that locale's relative fields are the _exact_
    // same as one of its ancestors. This will traverse the hierarchy for the
    // given `locale` until it finds an ancestor with same same relative fields.
    // When an ancestor can't be found, a data entry must be created for the
    // `locale` since its relative fields are unique.
    function findGreatestAncestor(locale) {
        // The "root" locale is not a suitable ancestor, because there won't be
        // an entry for "root" in the final data object.
        var parentLocale = getParentLocale(locale);
        if (!parentLocale || parentLocale === 'root') {
            return locale;
        }

        // When the `locale` doesn't have fields data, we need to traverse up
        // its hierarchy to find suitable relative fields data.
        if (!hasNumberFields(locale)) {
            return findGreatestAncestor(parentLocale);
        }

        var fields;
        var parentFields;
        if (hasNumberFields(parentLocale)) {
            fields       = getNumberFields(locale);
            parentFields = getNumberFields(parentLocale);

            // We can only use this ancestor's fields if they hash to the
            // _exact_ same value as `locale`'s fields. If the ancestor is
            // suitable, we keep looking up its hierarchy until the relative
            // fields are determined to be unique.
            if (hashFields(locale, fields) ===
                hashFields(parentLocale, parentFields)) {

                return findGreatestAncestor(parentLocale);
            }
        }

        return locale;
    }

    return locales.reduce(function (numberFields, locale) {
        // Walk the `locale`'s hierarchy to look for suitable ancestor with the
        // _exact_ same relative fields. If no ancestor is found, the given
        // `locale` will be returned.
        locale = findGreatestAncestor(normalizeLocale(locale));

        // The "root" locale is ignored because the built-in `Intl` libraries in
        // JavaScript have no notion of a "root" locale; instead they use the
        // IANA Language Subtag Registry.
        if (locale === 'root') {
            return numberFields;
        }

        // Add an entry for the `locale`, which might be an ancestor. If the
        // locale doesn't have relative fields, then we fallback to the "root"
        // locale's fields.
        numberFields[locale] = {
            numbers: getNumberFields(locale) || defaultFields,
        };

        return numberFields;
    }, {});
};

function loadNumberFields(locale) {
    var locale   = normalizeLocale(locale);
    var filename = p.join('cldr-numbers-full', 'main', locale, 'numbers.json');
    var fields   = require(filename).main[locale].numbers;
    // Reduce the number fields data down to whitelist of fields needed in the
    // FormatJS libs.
    // e.g. { }
    return NUMBER_FIELD_NAMES.reduce(function (numbers, field) {
      if (field.indexOf('decimal') > -1) {
        numbers['decimal'] = transform(fields[field]);
        return numbers;
      }
    }, {});
}

function transform(hash) {
  return FORMAT_FIELD_NAMES.reduce(function (numberFormat, type) {
    // rules =
    // {
    //   '1000-count-one': '0 K',
    //   '1000-count-other': '0 K'...
    // }
    var rules = hash[type]['decimalFormat'];

    // example of expected short && long values
    // [
    //   [1000, {one: ["0K", 1], other: ["0K", 1]}],
    //   [10000, %{one: ["00K", 2], other: ["00K", 2]}]
    // ]
    var boundaries = [];
    var ruleKeys = Object.keys(rules);

    // ['1000-count-one', '1000-count-other'];
    ruleKeys.forEach(function (key, indx, original) {
      var value = rules[key];
      var modifiedKey = key.split('-');
      var boundary = +modifiedKey[0];
      var count = modifiedKey[2];
      var existingBoundaryIndx = findIndex(boundary, boundaries);
      var formattingIndicators = [value, numberOfZeros(value)];
      if (existingBoundaryIndx > -1) {
        // add to hash either a key of `one` or `other`
        boundaries[existingBoundaryIndx][1][count] = formattingIndicators;
      } else {
        // create new entry in array with boundary and formatting options
        var options = {};
        options[count] = formattingIndicators;
        boundaries.push([ boundary, options ]);
      }
    });

    numberFormat[type] = boundaries;
    return numberFormat;
  }, {});
}

function findIndex(boundary, items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i][0] === boundary) {
      return i;
    }
  }

  return -1;
}

function numberOfZeros(value) {
  return (value.match(/0/g) || []).length;
}
