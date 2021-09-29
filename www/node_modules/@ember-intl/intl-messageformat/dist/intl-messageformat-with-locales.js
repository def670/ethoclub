(function() {
    "use strict";
    var $$utils$$hop = Object.prototype.hasOwnProperty;

    function $$utils$$extend(obj) {
        var sources = Array.prototype.slice.call(arguments, 1),
            i, len, source, key;

        for (i = 0, len = sources.length; i < len; i += 1) {
            source = sources[i];
            if (!source) { continue; }

            for (key in source) {
                if ($$utils$$hop.call(source, key)) {
                    obj[key] = source[key];
                }
            }
        }

        return obj;
    }

    // Purposely using the same implementation as the Intl.js `Intl` polyfill.
    // Copyright 2013 Andy Earnshaw, MIT License

    var $$es5$$realDefineProp = (function () {
        try { return !!Object.defineProperty({}, 'a', {}); }
        catch (e) { return false; }
    })();

    var $$es5$$es3 = !$$es5$$realDefineProp && !Object.prototype.__defineGetter__;

    var $$es5$$defineProperty = $$es5$$realDefineProp ? Object.defineProperty :
            function (obj, name, desc) {

        if ('get' in desc && obj.__defineGetter__) {
            obj.__defineGetter__(name, desc.get);
        } else if (!$$utils$$hop.call(obj, name) || 'value' in desc) {
            obj[name] = desc.value;
        }
    };

    var $$es5$$objCreate = Object.create || function (proto, props) {
        var obj, k;

        function F() {}
        F.prototype = proto;
        obj = new F();

        for (k in props) {
            if ($$utils$$hop.call(props, k)) {
                $$es5$$defineProperty(obj, k, props[k]);
            }
        }

        return obj;
    };

    function cldr$compact$number$$replaceNumber(normalized, format) {
        // 1.734 -> 1K
        // replace 0's with absolute number while preserving space and remaining text
        // return format.replace(/0*(\s*)(\w+)/, Math.round(number) + '$1$2');
        return format.replace(/0*/, normalized);
    }
    function cldr$compact$number$$normalizeLocale(locale) {
        if (locale instanceof Array) {
            return locale[0].replace(/_/, '-').toLowerCase();
        }
        return locale.replace(/_/, '-').toLowerCase();
    }
    /**
     * If rule only contains 0, it indicates no short number formatting applied
     * e.g. "ja" 1234 -> 1234 and not 1K
     */
    function cldr$compact$number$$needsFormatting(format) {
        return format.match(/[^0]/);
    }
    /**
     * Given a format: { af: {locale: "af", numbers: {…}} af-na: {locale: "af-NA", parentLocale: "af"} }
     * recursively find numbers hash
     *
     * @method findLocaleData
     * @param localeData
     * @param locale
     */
    function cldr$compact$number$$findLocaleData(localeData, locale) {
        var topLevelData = localeData[locale];
        if (!topLevelData) {
            return;
        }
        var numbersHash = topLevelData.numbers;
        var parentLocale = topLevelData.parentLocale;
        if (!numbersHash && parentLocale) {
            numbersHash = cldr$compact$number$$findLocaleData(localeData, parentLocale);
        }
        return numbersHash;
    }

    /**
     * Meant to either localize a number with toLocaleString or return an Integer
     * localization accepts 3 arguments
     *  - significantDigits
     *  - minimumFractionDigits
     *  - maximumFractionDigits
     */
    function cldr$compact$number$$normalizeNumber(decimal, arbitraryPrecision, sign, locale, _a) {
        var _b = _a.significantDigits, significantDigits = _b === void 0 ? 0 : _b, _c = _a.minimumFractionDigits, minimumFractionDigits = _c === void 0 ? 0 : _c, _d = _a.maximumFractionDigits, maximumFractionDigits = _d === void 0 ? 2 : _d;
        if (significantDigits) {
            return cldr$compact$number$$toLocaleFixed(cldr$compact$number$$toFixed(decimal, significantDigits), locale, {
                maximumFractionDigits: maximumFractionDigits,
                minimumFractionDigits: minimumFractionDigits
            });
        }
        return cldr$compact$number$$withRounding(decimal, arbitraryPrecision) * sign;
    }
    function cldr$compact$number$$extractIntPart(decimal, range, numberOfDigits) {
        // 1734 -> 1.734
        // 17345 -> 17.345
        // 999949 -> 999.9K with one significant digit or 999,9 mil in Spanish
        // this gives us the "int" (LHS) part of the number with the remains on the RHS
        return (decimal / range) * Math.pow(10, numberOfDigits - 1);
    }
    function cldr$compact$number$$toFixed(decimal, significantDigits) {
        // solves issues with toFixed returning a string
        // e.g. 999.94 -> 999.9
        // e.g. 999.95 -> 1000 instead of (999.95).toFixed(1) -> '1000.1'
        var powOf10 = Math.pow(10, significantDigits);
        return Math.round(decimal * powOf10) / powOf10;
    }
    function cldr$compact$number$$withRounding(decimal, arbitraryPrecision) {
        if (decimal <= 1) {
            // We do not want to round up to nearest 10 (Math.pow(10, 1)) when < 1.
            // Just round decimal
            return Math.round(decimal);
        }
        // rounding on floating point numbers
        // e.g. 99.5 -> 100
        var powOf10 = Math.pow(10, arbitraryPrecision);
        return Math.round(decimal / powOf10) * powOf10;
    }
    function cldr$compact$number$$toLocaleFixed(value, locale, digitsConfig) {
        if (value && typeof value === 'number') {
            return value.toLocaleString(locale, digitsConfig);
        }
    }

    function cldr$compact$number$$compactFormat(value, locale, localeData, options) {
        if (options === void 0) { options = {}; }
        var num = Number(value);
        if (!value || typeof num !== 'number') {
            return value;
        }
        // figure out which numbers hash based on the locale
        locale = cldr$compact$number$$normalizeLocale(locale); // en_GB -> en-GB
        var data = cldr$compact$number$$findLocaleData(localeData, locale);
        if (!data) {
            return value;
        }
        // take the absolute value and stash sign to apply at end
        var sign = 1;
        if (num < 0) {
            sign = -1;
            num = Math.abs(num);
        }
        // find specific rules: short or long
        var _a = options.financialFormat, financialFormat = _a === void 0 ? false : _a, _b = options.long, long = _b === void 0 ? false : _b, _c = options.significantDigits, significantDigits = _c === void 0 ? 0 : _c, _d = options.threshold, threshold = _d === void 0 ? 0.05 : _d;
        var rules = long ? data.decimal.long : data.decimal.short;
        if (!rules || num < 1000) {
            return value;
        }
        // 1. Take number and determine range it is in
        // 2. Extract specific rule from hash - ["0K", 1] meaning which value from the rule and number of zeros
        var matchingRule;
        var arbitraryPrecision = 0;
        for (var i = 0; i <= rules.length; i++) {
            if (num <= rules[i][0]) {
                var testRangeHigh = rules[i][0];
                // always use previous rule until within 5% threshold of upper limit
                if (!financialFormat && 1 - num / testRangeHigh > threshold) {
                    // e.g use 950K instead of 1M
                    // e.g use 101K instead of 0.1M
                    matchingRule = rules[i - 1];
                }
                else {
                    matchingRule = rules[i];
                    if (!significantDigits || !financialFormat) {
                        // if we want to round up, we need to prevent numbers like 99,499 from rounding down to 99K
                        // /-private/math-utils will use this variable to round a number like 91 to 100 since we are within the threshold
                        arbitraryPrecision = 1;
                    }
                }
                break;
            }
        }
        // 3. Normalise number by converting to decimal and cropping to number of digits
        //  1000 -> 1.000 -> 1K
        //  1600 -> 1.600 -> 2K
        // 4. Format according to formatter e.g. "0K"
        var range = matchingRule[0], opts = matchingRule[1];
        // cldr data is either `one` or `other`.  Defaulting to `one` for now
        var _e = opts.one || opts.other, formatter = _e[0], numberOfDigits = _e[1];
        if (!cldr$compact$number$$needsFormatting(formatter)) {
            return value;
        }
        var normalized = cldr$compact$number$$normalizeNumber(cldr$compact$number$$extractIntPart(num, range, numberOfDigits), arbitraryPrecision, sign, locale, options);
        return cldr$compact$number$$replaceNumber(normalized, formatter);
    }

    var cldr$compact$number$$default = cldr$compact$number$$compactFormat;
    var $$compiler$$default = $$compiler$$Compiler;

    function $$compiler$$Compiler(locales, formats, pluralFn) {
        this.locales  = locales;
        this.formats  = formats;
        this.pluralFn = pluralFn;
    }

    $$compiler$$Compiler.prototype.compile = function (ast) {
        this.pluralStack        = [];
        this.currentPlural      = null;
        this.pluralNumberFormat = null;

        return this.compileMessage(ast);
    };

    $$compiler$$Compiler.prototype.compileMessage = function (ast) {
        if (!(ast && ast.type === 'messageFormatPattern')) {
            throw new Error('Message AST is not of type: "messageFormatPattern"');
        }

        var elements = ast.elements,
            pattern  = [];

        var i, len, element;

        for (i = 0, len = elements.length; i < len; i += 1) {
            element = elements[i];

            switch (element.type) {
                case 'messageTextElement':
                    pattern.push(this.compileMessageText(element));
                    break;

                case 'argumentElement':
                    pattern.push(this.compileArgument(element));
                    break;

                default:
                    throw new Error('Message element does not have a valid type');
            }
        }

        return pattern;
    };

    $$compiler$$Compiler.prototype.compileMessageText = function (element) {
        // When this `element` is part of plural sub-pattern and its value contains
        // an unescaped '#', use a `PluralOffsetString` helper to properly output
        // the number with the correct offset in the string.
        if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
            // Create a cache a NumberFormat instance that can be reused for any
            // PluralOffsetString instance in this message.
            if (!this.pluralNumberFormat) {
                this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
            }

            return new $$compiler$$PluralOffsetString(
                    this.currentPlural.id,
                    this.currentPlural.format.offset,
                    this.pluralNumberFormat,
                    element.value);
        }

        // Unescape the escaped '#'s in the message text.
        return element.value.replace(/\\#/g, '#');
    };

    $$compiler$$Compiler.prototype.compileArgument = function (element) {
        var format = element.format;

        if (!format) {
            return new $$compiler$$StringFormat(element.id);
        }

        var formats  = this.formats,
            locales  = this.locales,
            pluralFn = this.pluralFn,
            options;

        switch (format.type) {
            case 'numberFormat':
                options = formats.number[format.style];
                return {
                    id    : element.id,
                    format: new Intl.NumberFormat(locales, options).format
                };

            case 'shortNumberFormat':
                options = formats.shortNumber[format.style];
                var shortNumberInstance = new $$compiler$$ShortNumberFormat(locales, options);
                return {
                    id    : element.id,
                    format: shortNumberInstance.format.bind(shortNumberInstance)
                };

            case 'dateFormat':
                options = formats.date[format.style];
                return {
                    id    : element.id,
                    format: new Intl.DateTimeFormat(locales, options).format
                };

            case 'timeFormat':
                options = formats.time[format.style];
                return {
                    id    : element.id,
                    format: new Intl.DateTimeFormat(locales, options).format
                };

            case 'pluralFormat':
                options = this.compileOptions(element);
                return new $$compiler$$PluralFormat(
                    element.id, format.ordinal, format.offset, options, pluralFn
                );

            case 'selectFormat':
                options = this.compileOptions(element);
                return new $$compiler$$SelectFormat(element.id, options);

            default:
                throw new Error('Message element does not have a valid format type');
        }
    };

    $$compiler$$Compiler.prototype.compileOptions = function (element) {
        var format      = element.format,
            options     = format.options,
            optionsHash = {};

        // Save the current plural element, if any, then set it to a new value when
        // compiling the options sub-patterns. This conforms the spec's algorithm
        // for handling `"#"` syntax in message text.
        this.pluralStack.push(this.currentPlural);
        this.currentPlural = format.type === 'pluralFormat' ? element : null;

        var i, len, option;

        for (i = 0, len = options.length; i < len; i += 1) {
            option = options[i];

            // Compile the sub-pattern and save it under the options's selector.
            optionsHash[option.selector] = this.compileMessage(option.value);
        }

        // Pop the plural stack to put back the original current plural value.
        this.currentPlural = this.pluralStack.pop();

        return optionsHash;
    };

    // -- Compiler Helper Classes --------------------------------------------------

    function $$compiler$$StringFormat(id) {
        this.id = id;
    }

    $$compiler$$StringFormat.prototype.format = function (value) {
        if (!value && typeof value !== 'number') {
            return '';
        }

        return typeof value === 'string' ? value : String(value);
    };

    function $$compiler$$PluralFormat(id, useOrdinal, offset, options, pluralFn) {
        this.id         = id;
        this.useOrdinal = useOrdinal;
        this.offset     = offset;
        this.options    = options;
        this.pluralFn   = pluralFn;
    }

    $$compiler$$PluralFormat.prototype.getOption = function (value) {
        var options = this.options;

        var option = options['=' + value] ||
                options[this.pluralFn(value - this.offset, this.useOrdinal)];

        return option || options.other;
    };

    function $$compiler$$PluralOffsetString(id, offset, numberFormat, string) {
        this.id           = id;
        this.offset       = offset;
        this.numberFormat = numberFormat;
        this.string       = string;
    }

    $$compiler$$PluralOffsetString.prototype.format = function (value) {
        var number = this.numberFormat.format(value - this.offset);

        return this.string
                .replace(/(^|[^\\])#/g, '$1' + number)
                .replace(/\\#/g, '#');
    };

    function $$compiler$$SelectFormat(id, options) {
        this.id      = id;
        this.options = options;
    }

    $$compiler$$SelectFormat.prototype.getOption = function (value) {
        var options = this.options;
        return options[value] || options.other;
    };

    function $$compiler$$ShortNumberFormat(locales, options) {
        this.__locales__    = locales;
        this.__options__    = options;
        this.__localeData__ = $$core$$default.__localeData__;
    }

    $$compiler$$ShortNumberFormat.prototype.format = function (value, locale) {
      return cldr$compact$number$$compactFormat(value, this.__locales__, this.__localeData__, this.__options__);
    };

    var $ember$intl$intl$messageformat$parser$$default = (function() {
      "use strict";

      /*
       * Generated by PEG.js 0.9.0.
       *
       * http://pegjs.org/
       */

      function peg$subclass(child, parent) {
        function ctor() { this.constructor = child; }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
      }

      function peg$SyntaxError(message, expected, found, location) {
        this.message  = message;
        this.expected = expected;
        this.found    = found;
        this.location = location;
        this.name     = "SyntaxError";

        if (typeof Error.captureStackTrace === "function") {
          Error.captureStackTrace(this, peg$SyntaxError);
        }
      }

      peg$subclass(peg$SyntaxError, Error);

      function peg$parse(input) {
        var options = arguments.length > 1 ? arguments[1] : {},
            parser  = this,

            peg$FAILED = {},

            peg$startRuleFunctions = { start: peg$parsestart },
            peg$startRuleFunction  = peg$parsestart,

            peg$c0 = function(elements) {
                    return {
                        type    : 'messageFormatPattern',
                        elements: elements,
                        location: location()
                    };
                },
            peg$c1 = function(text) {
                    var string = '',
                        i, j, outerLen, inner, innerLen;

                    for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                        inner = text[i];

                        for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                            string += inner[j];
                        }
                    }

                    return string;
                },
            peg$c2 = function(messageText) {
                    return {
                        type : 'messageTextElement',
                        value: messageText,
                        location: location()
                    };
                },
            peg$c3 = /^[^ \t\n\r,.+={}#]/,
            peg$c4 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
            peg$c5 = "{",
            peg$c6 = { type: "literal", value: "{", description: "\"{\"" },
            peg$c7 = ",",
            peg$c8 = { type: "literal", value: ",", description: "\",\"" },
            peg$c9 = "}",
            peg$c10 = { type: "literal", value: "}", description: "\"}\"" },
            peg$c11 = function(id, format) {
                    return {
                        type  : 'argumentElement',
                        id    : id,
                        format: format && format[2],
                        location: location()
                    };
                },
            peg$c12 = "number",
            peg$c13 = { type: "literal", value: "number", description: "\"number\"" },
            peg$c14 = "date",
            peg$c15 = { type: "literal", value: "date", description: "\"date\"" },
            peg$c16 = "time",
            peg$c17 = { type: "literal", value: "time", description: "\"time\"" },
            peg$c18 = "shortNumber",
            peg$c19 = { type: "literal", value: "shortNumber", description: "\"shortNumber\"" },
            peg$c20 = function(type, style) {
                    return {
                        type : type + 'Format',
                        style: style && style[2],
                        location: location()
                    };
                },
            peg$c21 = "plural",
            peg$c22 = { type: "literal", value: "plural", description: "\"plural\"" },
            peg$c23 = function(pluralStyle) {
                    return {
                        type   : pluralStyle.type,
                        ordinal: false,
                        offset : pluralStyle.offset || 0,
                        options: pluralStyle.options,
                        location: location()
                    };
                },
            peg$c24 = "selectordinal",
            peg$c25 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
            peg$c26 = function(pluralStyle) {
                    return {
                        type   : pluralStyle.type,
                        ordinal: true,
                        offset : pluralStyle.offset || 0,
                        options: pluralStyle.options,
                        location: location()
                    }
                },
            peg$c27 = "select",
            peg$c28 = { type: "literal", value: "select", description: "\"select\"" },
            peg$c29 = function(options) {
                    return {
                        type   : 'selectFormat',
                        options: options,
                        location: location()
                    };
                },
            peg$c30 = "=",
            peg$c31 = { type: "literal", value: "=", description: "\"=\"" },
            peg$c32 = function(selector, pattern) {
                    return {
                        type    : 'optionalFormatPattern',
                        selector: selector,
                        value   : pattern,
                        location: location()
                    };
                },
            peg$c33 = "offset:",
            peg$c34 = { type: "literal", value: "offset:", description: "\"offset:\"" },
            peg$c35 = function(number) {
                    return number;
                },
            peg$c36 = function(offset, options) {
                    return {
                        type   : 'pluralFormat',
                        offset : offset,
                        options: options,
                        location: location()
                    };
                },
            peg$c37 = { type: "other", description: "whitespace" },
            peg$c38 = /^[ \t\n\r]/,
            peg$c39 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
            peg$c40 = { type: "other", description: "optionalWhitespace" },
            peg$c41 = /^[0-9]/,
            peg$c42 = { type: "class", value: "[0-9]", description: "[0-9]" },
            peg$c43 = /^[0-9a-f]/i,
            peg$c44 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
            peg$c45 = "0",
            peg$c46 = { type: "literal", value: "0", description: "\"0\"" },
            peg$c47 = /^[1-9]/,
            peg$c48 = { type: "class", value: "[1-9]", description: "[1-9]" },
            peg$c49 = function(digits) {
                return parseInt(digits, 10);
            },
            peg$c50 = /^[^{}\\\0-\x1F \t\n\r]/,
            peg$c51 = { type: "class", value: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]" },
            peg$c52 = "\\\\",
            peg$c53 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
            peg$c54 = function() { return '\\'; },
            peg$c55 = "\\#",
            peg$c56 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
            peg$c57 = function() { return '\\#'; },
            peg$c58 = "\\{",
            peg$c59 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
            peg$c60 = function() { return '\u007B'; },
            peg$c61 = "\\}",
            peg$c62 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
            peg$c63 = function() { return '\u007D'; },
            peg$c64 = "\\u",
            peg$c65 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
            peg$c66 = function(digits) {
                    return String.fromCharCode(parseInt(digits, 16));
                },
            peg$c67 = function(chars) { return chars.join(''); },

            peg$currPos          = 0,
            peg$savedPos         = 0,
            peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
            peg$maxFailPos       = 0,
            peg$maxFailExpected  = [],
            peg$silentFails      = 0,

            peg$result;

        if ("startRule" in options) {
          if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
          }

          peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
        }

        function text() {
          return input.substring(peg$savedPos, peg$currPos);
        }

        function location() {
          return peg$computeLocation(peg$savedPos, peg$currPos);
        }

        function expected(description) {
          throw peg$buildException(
            null,
            [{ type: "other", description: description }],
            input.substring(peg$savedPos, peg$currPos),
            peg$computeLocation(peg$savedPos, peg$currPos)
          );
        }

        function error(message) {
          throw peg$buildException(
            message,
            null,
            input.substring(peg$savedPos, peg$currPos),
            peg$computeLocation(peg$savedPos, peg$currPos)
          );
        }

        function peg$computePosDetails(pos) {
          var details = peg$posDetailsCache[pos],
              p, ch;

          if (details) {
            return details;
          } else {
            p = pos - 1;
            while (!peg$posDetailsCache[p]) {
              p--;
            }

            details = peg$posDetailsCache[p];
            details = {
              line:   details.line,
              column: details.column,
              seenCR: details.seenCR
            };

            while (p < pos) {
              ch = input.charAt(p);
              if (ch === "\n") {
                if (!details.seenCR) { details.line++; }
                details.column = 1;
                details.seenCR = false;
              } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
                details.line++;
                details.column = 1;
                details.seenCR = true;
              } else {
                details.column++;
                details.seenCR = false;
              }

              p++;
            }

            peg$posDetailsCache[pos] = details;
            return details;
          }
        }

        function peg$computeLocation(startPos, endPos) {
          var startPosDetails = peg$computePosDetails(startPos),
              endPosDetails   = peg$computePosDetails(endPos);

          return {
            start: {
              offset: startPos,
              line:   startPosDetails.line,
              column: startPosDetails.column
            },
            end: {
              offset: endPos,
              line:   endPosDetails.line,
              column: endPosDetails.column
            }
          };
        }

        function peg$fail(expected) {
          if (peg$currPos < peg$maxFailPos) { return; }

          if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
          }

          peg$maxFailExpected.push(expected);
        }

        function peg$buildException(message, expected, found, location) {
          function cleanupExpected(expected) {
            var i = 1;

            expected.sort(function(a, b) {
              if (a.description < b.description) {
                return -1;
              } else if (a.description > b.description) {
                return 1;
              } else {
                return 0;
              }
            });

            while (i < expected.length) {
              if (expected[i - 1] === expected[i]) {
                expected.splice(i, 1);
              } else {
                i++;
              }
            }
          }

          function buildMessage(expected, found) {
            function stringEscape(s) {
              function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

              return s
                .replace(/\\/g,   '\\\\')
                .replace(/"/g,    '\\"')
                .replace(/\x08/g, '\\b')
                .replace(/\t/g,   '\\t')
                .replace(/\n/g,   '\\n')
                .replace(/\f/g,   '\\f')
                .replace(/\r/g,   '\\r')
                .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
                .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
                .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
                .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
            }

            var expectedDescs = new Array(expected.length),
                expectedDesc, foundDesc, i;

            for (i = 0; i < expected.length; i++) {
              expectedDescs[i] = expected[i].description;
            }

            expectedDesc = expected.length > 1
              ? expectedDescs.slice(0, -1).join(", ")
                  + " or "
                  + expectedDescs[expected.length - 1]
              : expectedDescs[0];

            foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

            return "Expected " + expectedDesc + " but " + foundDesc + " found.";
          }

          if (expected !== null) {
            cleanupExpected(expected);
          }

          return new peg$SyntaxError(
            message !== null ? message : buildMessage(expected, found),
            expected,
            found,
            location
          );
        }

        function peg$parsestart() {
          var s0;

          s0 = peg$parsemessageFormatPattern();

          return s0;
        }

        function peg$parsemessageFormatPattern() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsemessageFormatElement();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsemessageFormatElement();
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c0(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsemessageFormatElement() {
          var s0;

          s0 = peg$parsemessageTextElement();
          if (s0 === peg$FAILED) {
            s0 = peg$parseargumentElement();
          }

          return s0;
        }

        function peg$parsemessageText() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$currPos;
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                s4 = peg$parsechars();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    s3 = [s3, s4, s5];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c1(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsews();
            if (s1 !== peg$FAILED) {
              s0 = input.substring(s0, peg$currPos);
            } else {
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parsemessageTextElement() {
          var s0, s1;

          s0 = peg$currPos;
          s1 = peg$parsemessageText();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c2(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parseargument() {
          var s0, s1, s2;

          s0 = peg$parsenumber();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = [];
            if (peg$c3.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s2 !== peg$FAILED) {
              while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$c3.test(input.charAt(peg$currPos))) {
                  s2 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c4); }
                }
              }
            } else {
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              s0 = input.substring(s0, peg$currPos);
            } else {
              s0 = s1;
            }
          }

          return s0;
        }

        function peg$parseargumentElement() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c5;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseargument();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s6 = peg$c7;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c8); }
                  }
                  if (s6 !== peg$FAILED) {
                    s7 = peg$parse_();
                    if (s7 !== peg$FAILED) {
                      s8 = peg$parseelementFormat();
                      if (s8 !== peg$FAILED) {
                        s6 = [s6, s7, s8];
                        s5 = s6;
                      } else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s5;
                      s5 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 125) {
                        s7 = peg$c9;
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c10); }
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c11(s3, s5);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseelementFormat() {
          var s0;

          s0 = peg$parsesimpleFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parsepluralFormat();
            if (s0 === peg$FAILED) {
              s0 = peg$parseselectOrdinalFormat();
              if (s0 === peg$FAILED) {
                s0 = peg$parseselectFormat();
              }
            }
          }

          return s0;
        }

        function peg$parsesimpleFormat() {
          var s0, s1, s2, s3, s4, s5, s6;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c12) {
            s1 = peg$c12;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 4) === peg$c14) {
              s1 = peg$c14;
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c16) {
                s1 = peg$c16;
                peg$currPos += 4;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c17); }
              }
              if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 11) === peg$c18) {
                  s1 = peg$c18;
                  peg$currPos += 11;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c19); }
                }
              }
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s4 = peg$c7;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse_();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsechars();
                  if (s6 !== peg$FAILED) {
                    s4 = [s4, s5, s6];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
              if (s3 === peg$FAILED) {
                s3 = null;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c20(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsepluralFormat() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c21) {
            s1 = peg$c21;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c22); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepluralStyle();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c23(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselectOrdinalFormat() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 13) === peg$c24) {
            s1 = peg$c24;
            peg$currPos += 13;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c25); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepluralStyle();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c26(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselectFormat() {
          var s0, s1, s2, s3, s4, s5, s6;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 6) === peg$c27) {
            s1 = peg$c27;
            peg$currPos += 6;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c28); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s3 = peg$c7;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = [];
                  s6 = peg$parseoptionalFormatPattern();
                  if (s6 !== peg$FAILED) {
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parseoptionalFormatPattern();
                    }
                  } else {
                    s5 = peg$FAILED;
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c29(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseselector() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          s1 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c30;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c31); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parsenumber();
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
          } else {
            s0 = s1;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parsechars();
          }

          return s0;
        }

        function peg$parseoptionalFormatPattern() {
          var s0, s1, s2, s3, s4, s5, s6, s7, s8;

          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseselector();
            if (s2 !== peg$FAILED) {
              s3 = peg$parse_();
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 123) {
                  s4 = peg$c5;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c6); }
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse_();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsemessageFormatPattern();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parse_();
                      if (s7 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 125) {
                          s8 = peg$c9;
                          peg$currPos++;
                        } else {
                          s8 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c10); }
                        }
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c32(s2, s6);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parseoffset() {
          var s0, s1, s2, s3;

          s0 = peg$currPos;
          if (input.substr(peg$currPos, 7) === peg$c33) {
            s1 = peg$c33;
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsenumber();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c35(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsepluralStyle() {
          var s0, s1, s2, s3, s4;

          s0 = peg$currPos;
          s1 = peg$parseoffset();
          if (s1 === peg$FAILED) {
            s1 = null;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseoptionalFormatPattern();
              if (s4 !== peg$FAILED) {
                while (s4 !== peg$FAILED) {
                  s3.push(s4);
                  s4 = peg$parseoptionalFormatPattern();
                }
              } else {
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c36(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }

          return s0;
        }

        function peg$parsews() {
          var s0, s1;

          peg$silentFails++;
          s0 = [];
          if (peg$c38.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c39); }
          }
          if (s1 !== peg$FAILED) {
            while (s1 !== peg$FAILED) {
              s0.push(s1);
              if (peg$c38.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c39); }
              }
            }
          } else {
            s0 = peg$FAILED;
          }
          peg$silentFails--;
          if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }

          return s0;
        }

        function peg$parse_() {
          var s0, s1, s2;

          peg$silentFails++;
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsews();
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsews();
          }
          if (s1 !== peg$FAILED) {
            s0 = input.substring(s0, peg$currPos);
          } else {
            s0 = s1;
          }
          peg$silentFails--;
          if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }

          return s0;
        }

        function peg$parsedigit() {
          var s0;

          if (peg$c41.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c42); }
          }

          return s0;
        }

        function peg$parsehexDigit() {
          var s0;

          if (peg$c43.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c44); }
          }

          return s0;
        }

        function peg$parsenumber() {
          var s0, s1, s2, s3, s4, s5;

          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c45;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c46); }
          }
          if (s1 === peg$FAILED) {
            s1 = peg$currPos;
            s2 = peg$currPos;
            if (peg$c47.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parsedigit();
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsedigit();
              }
              if (s4 !== peg$FAILED) {
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s1 = input.substring(s1, peg$currPos);
            } else {
              s1 = s2;
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c49(s1);
          }
          s0 = s1;

          return s0;
        }

        function peg$parsechar() {
          var s0, s1, s2, s3, s4, s5, s6, s7;

          if (peg$c50.test(input.charAt(peg$currPos))) {
            s0 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c51); }
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c52) {
              s1 = peg$c52;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c53); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c54();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c55) {
                s1 = peg$c55;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c56); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c57();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c58) {
                  s1 = peg$c58;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c59); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c60();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c61) {
                    s1 = peg$c61;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c62); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c63();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c64) {
                      s1 = peg$c64;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c65); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$currPos;
                      s3 = peg$currPos;
                      s4 = peg$parsehexDigit();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsehexDigit();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsehexDigit();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parsehexDigit();
                            if (s7 !== peg$FAILED) {
                              s4 = [s4, s5, s6, s7];
                              s3 = s4;
                            } else {
                              peg$currPos = s3;
                              s3 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = input.substring(s2, peg$currPos);
                      } else {
                        s2 = s3;
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c66(s2);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                }
              }
            }
          }

          return s0;
        }

        function peg$parsechars() {
          var s0, s1, s2;

          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parsechar();
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parsechar();
            }
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c67(s1);
          }
          s0 = s1;

          return s0;
        }

        peg$result = peg$startRuleFunction();

        if (peg$result !== peg$FAILED && peg$currPos === input.length) {
          return peg$result;
        } else {
          if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail({ type: "end", description: "end of input" });
          }

          throw peg$buildException(
            null,
            peg$maxFailExpected,
            peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
            peg$maxFailPos < input.length
              ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
              : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
          );
        }
      }

      return {
        SyntaxError: peg$SyntaxError,
        parse:       peg$parse
      };
    })();

    var $$core$$default = $$core$$MessageFormat;

    // -- MessageFormat --------------------------------------------------------

    function $$core$$MessageFormat(message, locales, formats) {
        // Parse string messages into an AST.
        var ast = typeof message === 'string' ?
                $$core$$MessageFormat.__parse(message) : message;

        if (!(ast && ast.type === 'messageFormatPattern')) {
            throw new TypeError('A message must be provided as a String or AST.');
        }

        // Creates a new object with the specified `formats` merged with the default
        // formats.
        formats = this._mergeFormats($$core$$MessageFormat.formats, formats);

        // Defined first because it's used to build the format pattern.
        $$es5$$defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

        // Compile the `ast` to a pattern that is highly optimized for repeated
        // `format()` invocations. **Note:** This passes the `locales` set provided
        // to the constructor instead of just the resolved locale.
        var pluralFn = this._findPluralRuleFunction(this._locale);
        var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

        // "Bind" `format()` method to `this` so it can be passed by reference like
        // the other `Intl` APIs.
        var messageFormat = this;
        this.format = function (values) {
          try {
            return messageFormat._format(pattern, values);
          } catch (e) {
            if (e.variableId) {
              throw new Error(
                'The intl string context variable \'' + e.variableId + '\'' +
                ' was not provided to the string \'' + message + '\''
              );
            } else {
              throw e;
            }
          }
        };
    }

    // Default format options used as the prototype of the `formats` provided to the
    // constructor. These are used when constructing the internal Intl.NumberFormat
    // and Intl.DateTimeFormat instances.
    $$es5$$defineProperty($$core$$MessageFormat, 'formats', {
        enumerable: true,

        value: {
            number: {
                'currency': {
                    style: 'currency'
                },

                'percent': {
                    style: 'percent'
                }
            },

            shortNumber: {},

            date: {
                'short': {
                    month: 'numeric',
                    day  : 'numeric',
                    year : '2-digit'
                },

                'medium': {
                    month: 'short',
                    day  : 'numeric',
                    year : 'numeric'
                },

                'long': {
                    month: 'long',
                    day  : 'numeric',
                    year : 'numeric'
                },

                'full': {
                    weekday: 'long',
                    month  : 'long',
                    day    : 'numeric',
                    year   : 'numeric'
                }
            },

            time: {
                'short': {
                    hour  : 'numeric',
                    minute: 'numeric'
                },

                'medium':  {
                    hour  : 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                },

                'long': {
                    hour        : 'numeric',
                    minute      : 'numeric',
                    second      : 'numeric',
                    timeZoneName: 'short'
                },

                'full': {
                    hour        : 'numeric',
                    minute      : 'numeric',
                    second      : 'numeric',
                    timeZoneName: 'short'
                }
            }
        }
    });

    // Define internal private properties for dealing with locale data.
    $$es5$$defineProperty($$core$$MessageFormat, '__localeData__', {value: $$es5$$objCreate(null)});
    $$es5$$defineProperty($$core$$MessageFormat, '__addLocaleData', {value: function (data) {
        if (!(data && data.locale)) {
            throw new Error(
                'Locale data provided to IntlMessageFormat is missing a ' +
                '`locale` property'
            );
        }

        $$core$$MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
    }});

    // Defines `__parse()` static method as an exposed private.
    $$es5$$defineProperty($$core$$MessageFormat, '__parse', {value: $ember$intl$intl$messageformat$parser$$default.parse});

    // Define public `defaultLocale` property which defaults to English, but can be
    // set by the developer.
    $$es5$$defineProperty($$core$$MessageFormat, 'defaultLocale', {
        enumerable: true,
        writable  : true,
        value     : undefined
    });

    $$core$$MessageFormat.prototype.resolvedOptions = function () {
        // TODO: Provide anything else?
        return {
            locale: this._locale
        };
    };

    $$core$$MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
        var compiler = new $$compiler$$default(locales, formats, pluralFn);
        return compiler.compile(ast);
    };

    $$core$$MessageFormat.prototype._findPluralRuleFunction = function (locale) {
        var localeData = $$core$$MessageFormat.__localeData__;
        var data       = localeData[locale.toLowerCase()];

        // The locale data is de-duplicated, so we have to traverse the locale's
        // hierarchy until we find a `pluralRuleFunction` to return.
        while (data) {
            if (data.pluralRuleFunction) {
                return data.pluralRuleFunction;
            }

            data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
        }

        throw new Error(
            'Locale data added to IntlMessageFormat is missing a ' +
            '`pluralRuleFunction` for :' + locale
        );
    };

    $$core$$MessageFormat.prototype._format = function (pattern, values) {
        var result = '',
            i, len, part, id, value, err;

        for (i = 0, len = pattern.length; i < len; i += 1) {
            part = pattern[i];

            // Exist early for string parts.
            if (typeof part === 'string') {
                result += part;
                continue;
            }

            id = part.id;

            // Enforce that all required values are provided by the caller.
            if (!(values && $$utils$$hop.call(values, id))) {
              err = new Error('A value must be provided for: ' + id);
              err.variableId = id;
              throw err;
            }

            value = values[id];

            // Recursively format plural and select parts' option — which can be a
            // nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (part.options) {
                result += this._format(part.getOption(value), values);
            } else {
                result += part.format(value);
            }
        }

        return result;
    };

    $$core$$MessageFormat.prototype._mergeFormats = function (defaults, formats) {
        var mergedFormats = {},
            type, mergedType;

        for (type in defaults) {
            if (!$$utils$$hop.call(defaults, type)) { continue; }

            mergedFormats[type] = mergedType = $$es5$$objCreate(defaults[type]);

            if (formats && $$utils$$hop.call(formats, type)) {
                $$utils$$extend(mergedType, formats[type]);
            }
        }

        return mergedFormats;
    };

    $$core$$MessageFormat.prototype._resolveLocale = function (locales) {
        if (typeof locales === 'string') {
            locales = [locales];
        }

        // Create a copy of the array so we can push on the default locale.
        locales = (locales || []).concat($$core$$MessageFormat.defaultLocale);

        var localeData = $$core$$MessageFormat.__localeData__;
        var i, len, localeParts, data;

        // Using the set of locales + the default locale, we look for the first one
        // which that has been registered. When data does not exist for a locale, we
        // traverse its ancestors to find something that's been registered within
        // its hierarchy of locales. Since we lack the proper `parentLocale` data
        // here, we must take a naive approach to traversal.
        for (i = 0, len = locales.length; i < len; i += 1) {
            localeParts = locales[i].toLowerCase().split('-');

            while (localeParts.length) {
                data = localeData[localeParts.join('-')];
                if (data) {
                    // Return the normalized locale string; e.g., we return "en-US",
                    // instead of "en-us".
                    return data.locale;
                }

                localeParts.pop();
            }
        }

        var defaultLocale = locales.pop();
        throw new Error(
            'No locale data has been added to IntlMessageFormat for: ' +
            locales.join(', ') + ', or the default locale: ' + defaultLocale
        );
    };
    var $$en$$default = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 thousand",1],"other":["0 thousand",1]}],[10000,{"one":["00 thousand",2],"other":["00 thousand",2]}],[100000,{"one":["000 thousand",3],"other":["000 thousand",3]}],[1000000,{"one":["0 million",1],"other":["0 million",1]}],[10000000,{"one":["00 million",2],"other":["00 million",2]}],[100000000,{"one":["000 million",3],"other":["000 million",3]}],[1000000000,{"one":["0 billion",1],"other":["0 billion",1]}],[10000000000,{"one":["00 billion",2],"other":["00 billion",2]}],[100000000000,{"one":["000 billion",3],"other":["000 billion",3]}],[1000000000000,{"one":["0 trillion",1],"other":["0 trillion",1]}],[10000000000000,{"one":["00 trillion",2],"other":["00 trillion",2]}],[100000000000000,{"one":["000 trillion",3],"other":["000 trillion",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}};

    $$core$$default.__addLocaleData($$en$$default);
    $$core$$default.defaultLocale = 'en';

    var src$main$$default = $$core$$default;
    this['IntlMessageFormat'] = src$main$$default;
}).call(this);

IntlMessageFormat.__addLocaleData({"locale":"af","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 duisend",1],"other":["0 duisend",1]}],[10000,{"one":["00 duisend",2],"other":["00 duisend",2]}],[100000,{"one":["000 duisend",3],"other":["000 duisend",3]}],[1000000,{"one":["0 miljoen",1],"other":["0 miljoen",1]}],[10000000,{"one":["00 miljoen",2],"other":["00 miljoen",2]}],[100000000,{"one":["000 miljoen",3],"other":["000 miljoen",3]}],[1000000000,{"one":["0 miljard",1],"other":["0 miljard",1]}],[10000000000,{"one":["00 miljard",2],"other":["00 miljard",2]}],[100000000000,{"one":["000 miljard",3],"other":["000 miljard",3]}],[1000000000000,{"one":["0 biljoen",1],"other":["0 biljoen",1]}],[10000000000000,{"one":["00 biljoen",2],"other":["00 biljoen",2]}],[100000000000000,{"one":["000 biljoen",3],"other":["000 biljoen",3]}]],"short":[[1000,{"one":["0 k",1],"other":["0 k",1]}],[10000,{"one":["00 k",2],"other":["00 k",2]}],[100000,{"one":["000 k",3],"other":["000 k",3]}],[1000000,{"one":["0 m",1],"other":["0 m",1]}],[10000000,{"one":["00 m",2],"other":["00 m",2]}],[100000000,{"one":["000 m",3],"other":["000 m",3]}],[1000000000,{"one":["0 mjd",1],"other":["0 mjd",1]}],[10000000000,{"one":["00 mjd",2],"other":["00 mjd",2]}],[100000000000,{"one":["000 mjd",3],"other":["000 mjd",3]}],[1000000000000,{"one":["0 bn",1],"other":["0 bn",1]}],[10000000000000,{"one":["00 bn",2],"other":["00 bn",2]}],[100000000000000,{"one":["000 bn",3],"other":["000 bn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"af-NA","parentLocale":"af"});

IntlMessageFormat.__addLocaleData({"locale":"agq","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ak","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"am","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ሺ",1],"other":["0 ሺ",1]}],[10000,{"one":["00 ሺ",2],"other":["00 ሺ",2]}],[100000,{"one":["000 ሺ",3],"other":["000 ሺ",3]}],[1000000,{"one":["0 ሚሊዮን",1],"other":["0 ሚሊዮን",1]}],[10000000,{"one":["00 ሚሊዮን",2],"other":["00 ሚሊዮን",2]}],[100000000,{"one":["000 ሚሊዮን",3],"other":["000 ሚሊዮን",3]}],[1000000000,{"one":["0 ቢሊዮን",1],"other":["0 ቢሊዮን",1]}],[10000000000,{"one":["00 ቢሊዮን",2],"other":["00 ቢሊዮን",2]}],[100000000000,{"one":["000 ቢሊዮን",3],"other":["000 ቢሊዮን",3]}],[1000000000000,{"one":["0 ትሪሊዮን",1],"other":["0 ትሪሊዮን",1]}],[10000000000000,{"one":["00 ትሪሊዮን",2],"other":["00 ትሪሊዮን",2]}],[100000000000000,{"one":["000 ትሪሊዮን",3],"other":["000 ትሪሊዮን",3]}]],"short":[[1000,{"one":["0 ሺ",1],"other":["0 ሺ",1]}],[10000,{"one":["00 ሺ",2],"other":["00 ሺ",2]}],[100000,{"one":["000 ሺ",3],"other":["000 ሺ",3]}],[1000000,{"one":["0 ሜትር",1],"other":["0 ሜትር",1]}],[10000000,{"one":["00 ሜትር",2],"other":["00 ሜትር",2]}],[100000000,{"one":["000ሜ",3],"other":["000ሜ",3]}],[1000000000,{"one":["0 ቢ",1],"other":["0 ቢ",1]}],[10000000000,{"one":["00 ቢ",2],"other":["00 ቢ",2]}],[100000000000,{"one":["000 ቢ",3],"other":["000 ቢ",3]}],[1000000000000,{"one":["0 ት",1],"other":["0 ት",1]}],[10000000000000,{"one":["00 ት",2],"other":["00 ት",2]}],[100000000000000,{"one":["000 ት",3],"other":["000 ት",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ar","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return"other";return n==0?"zero":n==1?"one":n==2?"two":n100>=3&&n100<=10?"few":n100>=11&&n100<=99?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"zero":["0 ألف",1],"one":["0 ألف",1],"two":["0 ألف",1],"few":["0 آلاف",1],"many":["0 ألف",1],"other":["0 ألف",1]}],[10000,{"zero":["00 ألف",2],"one":["00 ألف",2],"two":["00 ألف",2],"few":["00 ألف",2],"many":["00 ألف",2],"other":["00 ألف",2]}],[100000,{"zero":["000 ألف",3],"one":["000 ألف",3],"two":["000 ألف",3],"few":["000 ألف",3],"many":["000 ألف",3],"other":["000 ألف",3]}],[1000000,{"zero":["0 مليون",1],"one":["0 مليون",1],"two":["0 مليون",1],"few":["0 ملايين",1],"many":["0 مليون",1],"other":["0 مليون",1]}],[10000000,{"zero":["00 مليون",2],"one":["00 مليون",2],"two":["00 مليون",2],"few":["00 ملايين",2],"many":["00 مليون",2],"other":["00 مليون",2]}],[100000000,{"zero":["000 مليون",3],"one":["000 مليون",3],"two":["000 مليون",3],"few":["000 مليون",3],"many":["000 مليون",3],"other":["000 مليون",3]}],[1000000000,{"zero":["0 مليار",1],"one":["0 مليار",1],"two":["0 مليار",1],"few":["0 مليار",1],"many":["0 مليار",1],"other":["0 مليار",1]}],[10000000000,{"zero":["00 مليار",2],"one":["00 مليار",2],"two":["00 مليار",2],"few":["00 مليار",2],"many":["00 مليار",2],"other":["00 مليار",2]}],[100000000000,{"zero":["000 مليار",3],"one":["000 مليار",3],"two":["000 مليار",3],"few":["000 مليار",3],"many":["000 مليار",3],"other":["000 مليار",3]}],[1000000000000,{"zero":["0 ترليون",1],"one":["0 ترليون",1],"two":["0 ترليون",1],"few":["0 ترليون",1],"many":["0 ترليون",1],"other":["0 ترليون",1]}],[10000000000000,{"zero":["00 ترليون",2],"one":["00 ترليون",2],"two":["00 ترليون",2],"few":["00 ترليون",2],"many":["00 ترليون",2],"other":["00 ترليون",2]}],[100000000000000,{"zero":["000 ترليون",3],"one":["000 ترليون",3],"two":["000 ترليون",3],"few":["000 ترليون",3],"many":["000 ترليون",3],"other":["000 ترليون",3]}]],"short":[[1000,{"zero":["0 ألف",1],"one":["0 ألف",1],"two":["0 ألف",1],"few":["0 آلاف",1],"many":["0 ألف",1],"other":["0 ألف",1]}],[10000,{"zero":["00 ألف",2],"one":["00 ألف",2],"two":["00 ألف",2],"few":["00 ألف",2],"many":["00 ألف",2],"other":["00 ألف",2]}],[100000,{"zero":["000 ألف",3],"one":["000 ألف",3],"two":["000 ألف",3],"few":["000 ألف",3],"many":["000 ألف",3],"other":["000 ألف",3]}],[1000000,{"zero":["0 مليون",1],"one":["0 مليون",1],"two":["0 مليون",1],"few":["0 مليون",1],"many":["0 مليون",1],"other":["0 مليون",1]}],[10000000,{"zero":["00 مليون",2],"one":["00 مليون",2],"two":["00 مليون",2],"few":["00 مليون",2],"many":["00 مليون",2],"other":["00 مليون",2]}],[100000000,{"zero":["000 مليون",3],"one":["000 مليون",3],"two":["000 مليون",3],"few":["000 مليون",3],"many":["000 مليون",3],"other":["000 مليون",3]}],[1000000000,{"zero":["0 مليار",1],"one":["0 مليار",1],"two":["0 مليار",1],"few":["0 مليار",1],"many":["0 مليار",1],"other":["0 مليار",1]}],[10000000000,{"zero":["00 مليار",2],"one":["00 مليار",2],"two":["00 مليار",2],"few":["00 مليار",2],"many":["00 مليار",2],"other":["00 مليار",2]}],[100000000000,{"zero":["000 مليار",3],"one":["000 مليار",3],"two":["000 مليار",3],"few":["000 مليار",3],"many":["000 مليار",3],"other":["000 مليار",3]}],[1000000000000,{"zero":["0 ترليون",1],"one":["0 ترليون",1],"two":["0 ترليون",1],"few":["0 ترليون",1],"many":["0 ترليون",1],"other":["0 ترليون",1]}],[10000000000000,{"zero":["00 ترليون",2],"one":["00 ترليون",2],"two":["00 ترليون",2],"few":["00 ترليون",2],"many":["00 ترليون",2],"other":["00 ترليون",2]}],[100000000000000,{"zero":["000 ترليون",3],"one":["000 ترليون",3],"two":["000 ترليون",3],"few":["000 ترليون",3],"many":["000 ترليون",3],"other":["000 ترليون",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ar-AE","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-BH","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-DJ","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-DZ","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-EG","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-EH","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-ER","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-IL","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-IQ","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-JO","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-KM","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-KW","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-LB","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-LY","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-MA","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-MR","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-OM","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-PS","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-QA","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-SA","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-SD","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-SO","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-SS","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-SY","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-TD","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-TN","parentLocale":"ar"});
IntlMessageFormat.__addLocaleData({"locale":"ar-YE","parentLocale":"ar"});

IntlMessageFormat.__addLocaleData({"locale":"ars","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return"other";return n==0?"zero":n==1?"one":n==2?"two":n100>=3&&n100<=10?"few":n100>=11&&n100<=99?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"as","pluralRuleFunction":function (n,ord){if(ord)return n==1||n==5||n==7||n==8||n==9||n==10?"one":n==2||n==3?"two":n==4?"few":n==6?"many":"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 হাজাৰ",1],"other":["0 হাজাৰ",1]}],[10000,{"one":["00 হাজাৰ",2],"other":["00 হাজাৰ",2]}],[100000,{"one":["0 লাখ",1],"other":["0 লাখ",1]}],[1000000,{"one":["0 নিযুত",1],"other":["0 নিযুত",1]}],[10000000,{"one":["00 নিযুত",2],"other":["00 নিযুত",2]}],[100000000,{"one":["000 নিযুত",3],"other":["000 নিযুত",3]}],[1000000000,{"one":["0 শত কোটি",1],"other":["0 শত কোটি",1]}],[10000000000,{"one":["00 শত কোটি",2],"other":["00 শত কোটি",2]}],[100000000000,{"one":["000 শত কোটি",3],"other":["000 শত কোটি",3]}],[1000000000000,{"one":["0 শত পৰাৰ্দ্ধ",1],"other":["0 শত পৰাৰ্দ্ধ",1]}],[10000000000000,{"one":["00 শত পৰাৰ্দ্ধ",2],"other":["00 শত পৰাৰ্দ্ধ",2]}],[100000000000000,{"one":["000 শত পৰাৰ্দ্ধ",3],"other":["000 শত পৰাৰ্দ্ধ",3]}]],"short":[[1000,{"one":["0 হাজাৰ",1],"other":["0 হাজাৰ",1]}],[10000,{"one":["00 হাজাৰ",2],"other":["00 হাজাৰ",2]}],[100000,{"one":["0 লাখ",1],"other":["0 লাখ",1]}],[1000000,{"one":["0 নিযুত",1],"other":["0 নিযুত",1]}],[10000000,{"one":["00 নিযুত",2],"other":["00 নিযুত",2]}],[100000000,{"one":["000 নিঃ",3],"other":["000 নিঃ",3]}],[1000000000,{"one":["0 শঃ কোঃ",1],"other":["0 শঃ কোঃ",1]}],[10000000000,{"one":["00 শঃ কোঃ",2],"other":["00 শঃ কোঃ",2]}],[100000000000,{"one":["000 শঃ কঃ",3],"other":["000 শঃ কঃ",3]}],[1000000000000,{"one":["0 শঃ পঃ",1],"other":["0 শঃ পঃ",1]}],[10000000000000,{"one":["00 শঃ পঃ",2],"other":["00 শঃ পঃ",2]}],[100000000000000,{"one":["000 শঃ পঃ",3],"other":["000 শঃ পঃ",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"asa","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ast","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 millar",1],"other":["0 millares",1]}],[10000,{"one":["00 millares",2],"other":["00 millares",2]}],[100000,{"one":["000 millares",3],"other":["000 millares",3]}],[1000000,{"one":["0 millón",1],"other":["0 millones",1]}],[10000000,{"one":["00 millones",2],"other":["00 millones",2]}],[100000000,{"one":["000 millones",3],"other":["000 millones",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"az","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],i10=i.slice(-1),i100=i.slice(-2),i1000=i.slice(-3);if(ord)return i10==1||i10==2||i10==5||i10==7||i10==8||(i100==20||i100==50||i100==70||i100==80)?"one":i10==3||i10==4||(i1000==100||i1000==200||i1000==300||i1000==400||i1000==500||i1000==600||i1000==700||i1000==800||i1000==900)?"few":i==0||i10==6||(i100==40||i100==60||i100==90)?"many":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 min",1],"other":["0 min",1]}],[10000,{"one":["00 min",2],"other":["00 min",2]}],[100000,{"one":["000 min",3],"other":["000 min",3]}],[1000000,{"one":["0 milyon",1],"other":["0 milyon",1]}],[10000000,{"one":["00 milyon",2],"other":["00 milyon",2]}],[100000000,{"one":["000 milyon",3],"other":["000 milyon",3]}],[1000000000,{"one":["0 milyard",1],"other":["0 milyard",1]}],[10000000000,{"one":["00 milyard",2],"other":["00 milyard",2]}],[100000000000,{"one":["000 milyard",3],"other":["000 milyard",3]}],[1000000000000,{"one":["0 trilyon",1],"other":["0 trilyon",1]}],[10000000000000,{"one":["00 trilyon",2],"other":["00 trilyon",2]}],[100000000000000,{"one":["000 trilyon",3],"other":["000 trilyon",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"az-Arab","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"az-Cyrl","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"az-Latn","parentLocale":"az"});

IntlMessageFormat.__addLocaleData({"locale":"bas","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"be","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return(n10==2||n10==3)&&n100!=12&&n100!=13?"few":"other";return n10==1&&n100!=11?"one":n10>=2&&n10<=4&&(n100<12||n100>14)?"few":t0&&n10==0||n10>=5&&n10<=9||n100>=11&&n100<=14?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 тысяча",1],"few":["0 тысячы",1],"many":["0 тысяч",1],"other":["0 тысячы",1]}],[10000,{"one":["00 тысяча",2],"few":["00 тысячы",2],"many":["00 тысяч",2],"other":["00 тысячы",2]}],[100000,{"one":["000 тысяча",3],"few":["000 тысячы",3],"many":["000 тысяч",3],"other":["000 тысячы",3]}],[1000000,{"one":["0 мільён",1],"few":["0 мільёны",1],"many":["0 мільёнаў",1],"other":["0 мільёна",1]}],[10000000,{"one":["00 мільён",2],"few":["00 мільёны",2],"many":["00 мільёнаў",2],"other":["00 мільёна",2]}],[100000000,{"one":["000 мільён",3],"few":["000 мільёны",3],"many":["000 мільёнаў",3],"other":["000 мільёна",3]}],[1000000000,{"one":["0 мільярд",1],"few":["0 мільярды",1],"many":["0 мільярдаў",1],"other":["0 мільярда",1]}],[10000000000,{"one":["00 мільярд",2],"few":["00 мільярды",2],"many":["00 мільярдаў",2],"other":["00 мільярда",2]}],[100000000000,{"one":["000 мільярд",3],"few":["000 мільярды",3],"many":["000 мільярдаў",3],"other":["000 мільярда",3]}],[1000000000000,{"one":["0 трыльён",1],"few":["0 трыльёны",1],"many":["0 трыльёнаў",1],"other":["0 трыльёна",1]}],[10000000000000,{"one":["00 трыльён",2],"few":["00 трыльёны",2],"many":["00 трыльёнаў",2],"other":["00 трыльёна",2]}],[100000000000000,{"one":["000 трыльён",3],"few":["000 трыльёны",3],"many":["000 трыльёнаў",3],"other":["000 трыльёна",3]}]],"short":[[1000,{"one":["0 тыс'.'",1],"few":["0 тыс'.'",1],"many":["0 тыс'.'",1],"other":["0 тыс'.'",1]}],[10000,{"one":["00 тыс'.'",2],"few":["00 тыс'.'",2],"many":["00 тыс'.'",2],"other":["00 тыс'.'",2]}],[100000,{"one":["000 тыс'.'",3],"few":["000 тыс'.'",3],"many":["000 тыс'.'",3],"other":["000 тыс'.'",3]}],[1000000,{"one":["0 млн",1],"few":["0 млн",1],"many":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"few":["00 млн",2],"many":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"few":["000 млн",3],"many":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млрд",1],"few":["0 млрд",1],"many":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"few":["00 млрд",2],"many":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"few":["000 млрд",3],"many":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 трлн",1],"few":["0 трлн",1],"many":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"few":["00 трлн",2],"many":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"few":["000 трлн",3],"many":["000 трлн",3],"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bem","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bez","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bg","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 хил'.'",1],"other":["0 хиляди",1]}],[10000,{"one":["00 хиляди",2],"other":["00 хиляди",2]}],[100000,{"one":["000 хиляди",3],"other":["000 хиляди",3]}],[1000000,{"one":["0 милион",1],"other":["0 милиона",1]}],[10000000,{"one":["00 милиона",2],"other":["00 милиона",2]}],[100000000,{"one":["000 милиона",3],"other":["000 милиона",3]}],[1000000000,{"one":["0 милиард",1],"other":["0 милиарда",1]}],[10000000000,{"one":["00 милиарда",2],"other":["00 милиарда",2]}],[100000000000,{"one":["000 милиарда",3],"other":["000 милиарда",3]}],[1000000000000,{"one":["0 трилион",1],"other":["0 трилиона",1]}],[10000000000000,{"one":["00 трилиона",2],"other":["00 трилиона",2]}],[100000000000000,{"one":["000 трилиона",3],"other":["000 трилиона",3]}]],"short":[[1000,{"one":["0 хил'.'",1],"other":["0 хил'.'",1]}],[10000,{"one":["00 хил'.'",2],"other":["00 хил'.'",2]}],[100000,{"one":["000 хил'.'",3],"other":["000 хил'.'",3]}],[1000000,{"one":["0 млн'.'",1],"other":["0 млн'.'",1]}],[10000000,{"one":["00 млн'.'",2],"other":["00 млн'.'",2]}],[100000000,{"one":["000 млн'.'",3],"other":["000 млн'.'",3]}],[1000000000,{"one":["0 млрд'.'",1],"other":["0 млрд'.'",1]}],[10000000000,{"one":["00 млрд'.'",2],"other":["00 млрд'.'",2]}],[100000000000,{"one":["000 млрд'.'",3],"other":["000 млрд'.'",3]}],[1000000000000,{"one":["0 трлн'.'",1],"other":["0 трлн'.'",1]}],[10000000000000,{"one":["00 трлн'.'",2],"other":["00 трлн'.'",2]}],[100000000000000,{"one":["000 трлн'.'",3],"other":["000 трлн'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bm","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"bm-Nkoo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bn","pluralRuleFunction":function (n,ord){if(ord)return n==1||n==5||n==7||n==8||n==9||n==10?"one":n==2||n==3?"two":n==4?"few":n==6?"many":"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 হাজার",1],"other":["0 হাজার",1]}],[10000,{"one":["00 হাজার",2],"other":["00 হাজার",2]}],[100000,{"one":["0 লাখ",1],"other":["0 লাখ",1]}],[1000000,{"one":["0 মিলিয়ন",1],"other":["0 মিলিয়ন",1]}],[10000000,{"one":["00 মিলিয়ন",2],"other":["00 মিলিয়ন",2]}],[100000000,{"one":["000 মিলিয়ন",3],"other":["000 মিলিয়ন",3]}],[1000000000,{"one":["0 বিলিয়ন",1],"other":["0 বিলিয়ন",1]}],[10000000000,{"one":["00 বিলিয়ন",2],"other":["00 বিলিয়ন",2]}],[100000000000,{"one":["000 বিলিয়ন",3],"other":["000 বিলিয়ন",3]}],[1000000000000,{"one":["0 ট্রিলিয়ন",1],"other":["0 ট্রিলিয়ন",1]}],[10000000000000,{"one":["00 ট্রিলিয়ন",2],"other":["00 ট্রিলিয়ন",2]}],[100000000000000,{"one":["000 ট্রিলিয়ন",3],"other":["000 ট্রিলিয়ন",3]}]],"short":[[1000,{"one":["0 হাজার",1],"other":["0 হাজার",1]}],[10000,{"one":["00 হাজার",2],"other":["00 হাজার",2]}],[100000,{"one":["0 লাখ",1],"other":["0 লাখ",1]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"bn-IN","parentLocale":"bn"});

IntlMessageFormat.__addLocaleData({"locale":"bo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"bo-IN","parentLocale":"bo"});

IntlMessageFormat.__addLocaleData({"locale":"br","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),n1000000=t0&&s[0].slice(-6);if(ord)return"other";return n10==1&&n100!=11&&n100!=71&&n100!=91?"one":n10==2&&n100!=12&&n100!=72&&n100!=92?"two":(n10==3||n10==4||n10==9)&&(n100<10||n100>19)&&(n100<70||n100>79)&&(n100<90||n100>99)?"few":n!=0&&t0&&n1000000==0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 miliad",1],"two":["0 viliad",1],"few":["0 miliad",1],"many":["0 a viliadoù",1],"other":["0 miliad",1]}],[10000,{"one":["00 miliad",2],"two":["00 viliad",2],"few":["00 miliad",2],"many":["00 a viliadoù",2],"other":["00 miliad",2]}],[100000,{"one":["000 miliad",3],"two":["000 viliad",3],"few":["000 miliad",3],"many":["000 a viliadoù",3],"other":["000 miliad",3]}],[1000000,{"one":["0 milion",1],"two":["0 v\u002Fmilion",1],"few":["0 milion",1],"many":["0 a v\u002Fmilionoù",1],"other":["0 milion",1]}],[10000000,{"one":["00 milion",2],"two":["00 v\u002Fmilion",2],"few":["00 milion",2],"many":["00 a v\u002Fmilionoù",2],"other":["00 milion",2]}],[100000000,{"one":["000 milion",3],"two":["000 v\u002Fmilion",3],"few":["000 milion",3],"many":["000 a v\u002Fmilionoù",3],"other":["000 milion",3]}],[1000000000,{"one":["0 miliard",1],"two":["0 viliard",1],"few":["0 miliard",1],"many":["0 a viliardoù",1],"other":["0 miliard",1]}],[10000000000,{"one":["00 miliard",2],"two":["00 viliard",2],"few":["00 miliard",2],"many":["00 a viliardoù",2],"other":["00 miliard",2]}],[100000000000,{"one":["000 miliard",3],"two":["000 viliard",3],"few":["000 miliard",3],"many":["000 a viliardoù",3],"other":["000 miliard",3]}],[1000000000000,{"one":["0 bilion",1],"two":["0 v\u002Fbilion",1],"few":["0 bilion",1],"many":["0 a v\u002Fbilionoù",1],"other":["0 bilion",1]}],[10000000000000,{"one":["00 bilion",2],"two":["00 v\u002Fbilion",2],"few":["00 bilion",2],"many":["00 a v\u002Fbilionoù",2],"other":["00 bilion",2]}],[100000000000000,{"one":["000 bilion",3],"two":["000 v\u002Fbilion",3],"few":["000 bilion",3],"many":["000 a v\u002Fbilionoù",3],"other":["000 bilion",3]}]],"short":[[1000,{"one":["0k",1],"two":["0k",1],"few":["0k",1],"many":["0k",1],"other":["0k",1]}],[10000,{"one":["00k",2],"two":["00k",2],"few":["00k",2],"many":["00k",2],"other":["00k",2]}],[100000,{"one":["000k",3],"two":["000k",3],"few":["000k",3],"many":["000k",3],"other":["000k",3]}],[1000000,{"one":["0M",1],"two":["0M",1],"few":["0M",1],"many":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"two":["00M",2],"few":["00M",2],"many":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"two":["000M",3],"few":["000M",3],"many":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"two":["0G",1],"few":["0G",1],"many":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"two":["00G",2],"few":["00G",2],"many":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"two":["000G",3],"few":["000G",3],"many":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"two":["0T",1],"few":["0T",1],"many":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"two":["00T",2],"few":["00T",2],"many":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"two":["000T",3],"few":["000T",3],"many":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"brx","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"bs","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 hiljada",1],"few":["0 hiljade",1],"other":["0 hiljada",1]}],[10000,{"one":["00 hiljada",2],"few":["00 hiljade",2],"other":["00 hiljada",2]}],[100000,{"one":["000 hiljada",3],"few":["000 hiljade",3],"other":["000 hiljada",3]}],[1000000,{"one":["0 milion",1],"few":["0 miliona",1],"other":["0 miliona",1]}],[10000000,{"one":["00 milion",2],"few":["00 miliona",2],"other":["00 miliona",2]}],[100000000,{"one":["000 milion",3],"few":["000 miliona",3],"other":["000 miliona",3]}],[1000000000,{"one":["0 milijarda",1],"few":["0 milijarde",1],"other":["0 milijardi",1]}],[10000000000,{"one":["00 milijarda",2],"few":["00 milijarde",2],"other":["00 milijardi",2]}],[100000000000,{"one":["000 milijarda",3],"few":["000 milijarde",3],"other":["000 milijardi",3]}],[1000000000000,{"one":["0 bilion",1],"few":["0 biliona",1],"other":["0 biliona",1]}],[10000000000000,{"one":["00 bilion",2],"few":["00 biliona",2],"other":["00 biliona",2]}],[100000000000000,{"one":["000 bilion",3],"few":["000 biliona",3],"other":["000 biliona",3]}]],"short":[[1000,{"one":["0 hilj'.'",1],"few":["0 hilj'.'",1],"other":["0 hilj'.'",1]}],[10000,{"one":["00 hilj'.'",2],"few":["00 hilj'.'",2],"other":["00 hilj'.'",2]}],[100000,{"one":["000 hilj'.'",3],"few":["000 hilj'.'",3],"other":["000 hilj'.'",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mlr'.'",1],"few":["0 mlr'.'",1],"other":["0 mlr'.'",1]}],[10000000000,{"one":["00 mlr'.'",2],"few":["00 mlr'.'",2],"other":["00 mlr'.'",2]}],[100000000000,{"one":["000 mlr'.'",3],"few":["000 mlr'.'",3],"other":["000 mlr'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"bs-Cyrl","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0",1],"few":["0",1],"other":["0",1]}],[10000,{"one":["00 хиљ",2],"few":["00 хиљ",2],"other":["00 хиљ",2]}],[100000,{"one":["000 хиљ",3],"few":["000 хиљ",3],"other":["000 хиљ",3]}],[1000000,{"one":["0 мил",1],"few":["0 мил",1],"other":["0 мил",1]}],[10000000,{"one":["00 мил",2],"few":["00 мил",2],"other":["00 мил",2]}],[100000000,{"one":["000 мил",3],"few":["000 мил",3],"other":["000 мил",3]}],[1000000000,{"one":["0 млрд",1],"few":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"few":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"few":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 бил",1],"few":["0 бил",1],"other":["0 бил",1]}],[10000000000000,{"one":["00 бил",2],"few":["00 бил",2],"other":["00 бил",2]}],[100000000000000,{"one":["000 бил",3],"few":["000 бил",3],"other":["000 бил",3]}]],"short":[[1000,{"one":["0",1],"few":["0",1],"other":["0",1]}],[10000,{"one":["00 хиљ",2],"few":["00 хиљ",2],"other":["00 хиљ",2]}],[100000,{"one":["000 хиљ",3],"few":["000 хиљ",3],"other":["000 хиљ",3]}],[1000000,{"one":["0 мил",1],"few":["0 мил",1],"other":["0 мил",1]}],[10000000,{"one":["00 мил",2],"few":["00 мил",2],"other":["00 мил",2]}],[100000000,{"one":["000 мил",3],"few":["000 мил",3],"other":["000 мил",3]}],[1000000000,{"one":["0 млрд",1],"few":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"few":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"few":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 бил",1],"few":["0 бил",1],"other":["0 бил",1]}],[10000000000000,{"one":["00 бил",2],"few":["00 бил",2],"other":["00 бил",2]}],[100000000000000,{"one":["000 бил",3],"few":["000 бил",3],"other":["000 бил",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"bs-Latn","parentLocale":"bs"});

IntlMessageFormat.__addLocaleData({"locale":"ca","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return n==1||n==3?"one":n==2?"two":n==4?"few":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 miler",1],"other":["0 milers",1]}],[10000,{"one":["00 milers",2],"other":["00 milers",2]}],[100000,{"one":["000 milers",3],"other":["000 milers",3]}],[1000000,{"one":["0 milió",1],"other":["0 milions",1]}],[10000000,{"one":["00 milions",2],"other":["00 milions",2]}],[100000000,{"one":["000 milions",3],"other":["000 milions",3]}],[1000000000,{"one":["0 miler de milions",1],"other":["0 milers de milions",1]}],[10000000000,{"one":["00 milers de milions",2],"other":["00 milers de milions",2]}],[100000000000,{"one":["000 milers de milions",3],"other":["000 milers de milions",3]}],[1000000000000,{"one":["0 bilió",1],"other":["0 bilions",1]}],[10000000000000,{"one":["00 bilions",2],"other":["00 bilions",2]}],[100000000000000,{"one":["000 bilions",3],"other":["000 bilions",3]}]],"short":[[1000,{"one":["0m",1],"other":["0m",1]}],[10000,{"one":["00m",2],"other":["00m",2]}],[100000,{"one":["000m",3],"other":["000m",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0000 M",4],"other":["0000 M",4]}],[10000000000,{"one":["00mM",2],"other":["00mM",2]}],[100000000000,{"one":["000mM",3],"other":["000mM",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ca-AD","parentLocale":"ca"});
IntlMessageFormat.__addLocaleData({"locale":"ca-ES-VALENCIA","parentLocale":"ca-ES","numbers":{"decimal":{"long":[[1000,{"one":["0 miler",1],"other":["0 milers",1]}],[10000,{"one":["00 milers",2],"other":["00 milers",2]}],[100000,{"one":["000 milers",3],"other":["000 milers",3]}],[1000000,{"one":["0 milió",1],"other":["0 milions",1]}],[10000000,{"one":["00 milions",2],"other":["00 milions",2]}],[100000000,{"one":["000 milions",3],"other":["000 milions",3]}],[1000000000,{"one":["0 miler de milions",1],"other":["0 milers de milions",1]}],[10000000000,{"one":["00 milers de milions",2],"other":["00 milers de milions",2]}],[100000000000,{"one":["000 milers de milions",3],"other":["000 milers de milions",3]}],[1000000000000,{"one":["0 bilió",1],"other":["0 bilions",1]}],[10000000000000,{"one":["00 bilions",2],"other":["00 bilions",2]}],[100000000000000,{"one":["000 bilions",3],"other":["000 bilions",3]}]],"short":[[1000,{"one":["0m",1],"other":["0m",1]}],[10000,{"one":["00m",2],"other":["00m",2]}],[100000,{"one":["000m",3],"other":["000m",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0000 M",4],"other":["0000 M",4]}],[10000000000,{"one":["00mM",2],"other":["00mM",2]}],[100000000000,{"one":["000mM",3],"other":["000mM",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ca-ES","parentLocale":"ca"});
IntlMessageFormat.__addLocaleData({"locale":"ca-FR","parentLocale":"ca"});
IntlMessageFormat.__addLocaleData({"locale":"ca-IT","parentLocale":"ca"});

IntlMessageFormat.__addLocaleData({"locale":"ccp","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ccp-IN","parentLocale":"ccp"});

IntlMessageFormat.__addLocaleData({"locale":"ce","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 эзар",1],"other":["0 эзар",1]}],[10000,{"one":["00 эзар",2],"other":["00 эзар",2]}],[100000,{"one":["000 эзар",3],"other":["000 эзар",3]}],[1000000,{"one":["0 миллион",1],"other":["0 миллион",1]}],[10000000,{"one":["00 миллион",2],"other":["00 миллион",2]}],[100000000,{"one":["000 миллион",3],"other":["000 миллион",3]}],[1000000000,{"one":["0 миллиард",1],"other":["0 миллиард",1]}],[10000000000,{"one":["00 миллиард",2],"other":["00 миллиард",2]}],[100000000000,{"one":["000 миллиард",3],"other":["000 миллиард",3]}],[1000000000000,{"one":["0 триллион",1],"other":["0 триллион",1]}],[10000000000000,{"one":["00 триллион",2],"other":["00 триллион",2]}],[100000000000000,{"one":["000 триллион",3],"other":["000 триллион",3]}]],"short":[[1000,{"one":["0 эзар",1],"other":["0 эзар",1]}],[10000,{"one":["00 эзар",2],"other":["00 эзар",2]}],[100000,{"one":["000 эзар",3],"other":["000 эзар",3]}],[1000000,{"one":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"cgg","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"chr","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ᎢᏯᎦᏴᎵ",1],"other":["0 ᎢᏯᎦᏴᎵ",1]}],[10000,{"one":["00 ᎢᏯᎦᏴᎵ",2],"other":["00 ᎢᏯᎦᏴᎵ",2]}],[100000,{"one":["000 ᎢᏯᎦᏴᎵ",3],"other":["000 ᎢᏯᎦᏴᎵ",3]}],[1000000,{"one":["0 ᎢᏳᏆᏗᏅᏛ",1],"other":["0 ᎢᏳᏆᏗᏅᏛ",1]}],[10000000,{"one":["00 ᎢᏳᏆᏗᏅᏛ",2],"other":["00 ᎢᏳᏆᏗᏅᏛ",2]}],[100000000,{"one":["000 ᎢᏳᏆᏗᏅᏛ",3],"other":["000 ᎢᏳᏆᏗᏅᏛ",3]}],[1000000000,{"one":["0 ᎢᏯᏔᎳᏗᏅᏛ",1],"other":["0 ᎢᏯᏔᎳᏗᏅᏛ",1]}],[10000000000,{"one":["00 ᎢᏯᏔᎳᏗᏅᏛ",2],"other":["00 ᎢᏯᏔᎳᏗᏅᏛ",2]}],[100000000000,{"one":["000 ᎢᏯᏔᎳᏗᏅᏛ",3],"other":["000 ᎢᏯᏔᎳᏗᏅᏛ",3]}],[1000000000000,{"one":["0 ᎢᏯᏦᎠᏗᏅᏛ",1],"other":["0 ᎢᏯᏦᎠᏗᏅᏛ",1]}],[10000000000000,{"one":["00 ᎢᏯᏦᎠᏗᏅᏛ",2],"other":["00 ᎢᏯᏦᎠᏗᏅᏛ",2]}],[100000000000000,{"one":["000 ᎢᏯᏦᎠᏗᏅᏛ",3],"other":["000 ᎢᏯᏦᎠᏗᏅᏛ",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ckb","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ckb-IR","parentLocale":"ckb"});

IntlMessageFormat.__addLocaleData({"locale":"cs","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1];if(ord)return"other";return n==1&&v0?"one":i>=2&&i<=4&&v0?"few":!v0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tisíc",1],"few":["0 tisíce",1],"many":["0 tisíce",1],"other":["0 tisíc",1]}],[10000,{"one":["00 tisíc",2],"few":["00 tisíc",2],"many":["00 tisíce",2],"other":["00 tisíc",2]}],[100000,{"one":["000 tisíc",3],"few":["000 tisíc",3],"many":["000 tisíce",3],"other":["000 tisíc",3]}],[1000000,{"one":["0 milion",1],"few":["0 miliony",1],"many":["0 milionu",1],"other":["0 milionů",1]}],[10000000,{"one":["00 milionů",2],"few":["00 milionů",2],"many":["00 milionu",2],"other":["00 milionů",2]}],[100000000,{"one":["000 milionů",3],"few":["000 milionů",3],"many":["000 milionu",3],"other":["000 milionů",3]}],[1000000000,{"one":["0 miliarda",1],"few":["0 miliardy",1],"many":["0 miliardy",1],"other":["0 miliard",1]}],[10000000000,{"one":["00 miliard",2],"few":["00 miliard",2],"many":["00 miliardy",2],"other":["00 miliard",2]}],[100000000000,{"one":["000 miliard",3],"few":["000 miliard",3],"many":["000 miliardy",3],"other":["000 miliard",3]}],[1000000000000,{"one":["0 bilion",1],"few":["0 biliony",1],"many":["0 bilionu",1],"other":["0 bilionů",1]}],[10000000000000,{"one":["00 bilionů",2],"few":["00 bilionů",2],"many":["00 bilionu",2],"other":["00 bilionů",2]}],[100000000000000,{"one":["000 bilionů",3],"few":["000 bilionů",3],"many":["000 bilionu",3],"other":["000 bilionů",3]}]],"short":[[1000,{"one":["0 tis'.'",1],"few":["0 tis'.'",1],"many":["0 tis'.'",1],"other":["0 tis'.'",1]}],[10000,{"one":["00 tis'.'",2],"few":["00 tis'.'",2],"many":["00 tis'.'",2],"other":["00 tis'.'",2]}],[100000,{"one":["000 tis'.'",3],"few":["000 tis'.'",3],"many":["000 tis'.'",3],"other":["000 tis'.'",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"many":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"many":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"many":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mld'.'",1],"few":["0 mld'.'",1],"many":["0 mld'.'",1],"other":["0 mld'.'",1]}],[10000000000,{"one":["00 mld'.'",2],"few":["00 mld'.'",2],"many":["00 mld'.'",2],"other":["00 mld'.'",2]}],[100000000000,{"one":["000 mld'.'",3],"few":["000 mld'.'",3],"many":["000 mld'.'",3],"other":["000 mld'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"few":["0 bil'.'",1],"many":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"few":["00 bil'.'",2],"many":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"few":["000 bil'.'",3],"many":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"cu","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"cy","pluralRuleFunction":function (n,ord){if(ord)return n==0||n==7||n==8||n==9?"zero":n==1?"one":n==2?"two":n==3||n==4?"few":n==5||n==6?"many":"other";return n==0?"zero":n==1?"one":n==2?"two":n==3?"few":n==6?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"zero":["0 mil",1],"one":["0 mil",1],"two":["0K",1],"few":["0K",1],"many":["0K",1],"other":["0 mil",1]}],[10000,{"zero":["00K",2],"one":["00 mil",2],"two":["00K",2],"few":["00K",2],"many":["00K",2],"other":["00 mil",2]}],[100000,{"zero":["000K",3],"one":["000 mil",3],"two":["000K",3],"few":["000K",3],"many":["000K",3],"other":["000 mil",3]}],[1000000,{"zero":["0M",1],"one":["0 miliwn",1],"two":["0M",1],"few":["0M",1],"many":["0M",1],"other":["0 miliwn",1]}],[10000000,{"zero":["00M",2],"one":["00 miliwn",2],"two":["00M",2],"few":["00M",2],"many":["00M",2],"other":["00 miliwn",2]}],[100000000,{"zero":["000M",3],"one":["000 miliwn",3],"two":["000M",3],"few":["000M",3],"many":["000M",3],"other":["000 miliwn",3]}],[1000000000,{"zero":["0B",1],"one":["0 biliwn",1],"two":["0B",1],"few":["0B",1],"many":["0B",1],"other":["0 biliwn",1]}],[10000000000,{"zero":["00B",2],"one":["00 biliwn",2],"two":["00B",2],"few":["00B",2],"many":["00B",2],"other":["00 biliwn",2]}],[100000000000,{"zero":["000B",3],"one":["000 biliwn",3],"two":["000B",3],"few":["000B",3],"many":["000B",3],"other":["000 biliwn",3]}],[1000000000000,{"zero":["0T",1],"one":["0 triliwn",1],"two":["0T",1],"few":["0T",1],"many":["0T",1],"other":["0 triliwn",1]}],[10000000000000,{"zero":["00T",2],"one":["00 triliwn",2],"two":["00T",2],"few":["00T",2],"many":["00T",2],"other":["00 triliwn",2]}],[100000000000000,{"zero":["000T",3],"one":["000T",3],"two":["000T",3],"few":["000T",3],"many":["000T",3],"other":["000 triliwn",3]}]],"short":[[1000,{"zero":["0K",1],"one":["0K",1],"two":["0K",1],"few":["0K",1],"many":["0K",1],"other":["0K",1]}],[10000,{"zero":["00K",2],"one":["00K",2],"two":["00K",2],"few":["00K",2],"many":["00K",2],"other":["00K",2]}],[100000,{"zero":["000K",3],"one":["000K",3],"two":["000K",3],"few":["000K",3],"many":["000K",3],"other":["000K",3]}],[1000000,{"zero":["0M",1],"one":["0M",1],"two":["0M",1],"few":["0M",1],"many":["0M",1],"other":["0M",1]}],[10000000,{"zero":["00M",2],"one":["00M",2],"two":["00M",2],"few":["00M",2],"many":["00M",2],"other":["00M",2]}],[100000000,{"zero":["000M",3],"one":["000M",3],"two":["000M",3],"few":["000M",3],"many":["000M",3],"other":["000M",3]}],[1000000000,{"zero":["0B",1],"one":["0B",1],"two":["0B",1],"few":["0B",1],"many":["0B",1],"other":["0B",1]}],[10000000000,{"zero":["00B",2],"one":["00B",2],"two":["00B",2],"few":["00B",2],"many":["00B",2],"other":["00B",2]}],[100000000000,{"zero":["000B",3],"one":["000B",3],"two":["000B",3],"few":["000B",3],"many":["000B",3],"other":["000B",3]}],[1000000000000,{"zero":["0T",1],"one":["0T",1],"two":["0T",1],"few":["0T",1],"many":["0T",1],"other":["0T",1]}],[10000000000000,{"zero":["00T",2],"one":["00T",2],"two":["00T",2],"few":["00T",2],"many":["00T",2],"other":["00T",2]}],[100000000000000,{"zero":["000T",3],"one":["000T",3],"two":["000T",3],"few":["000T",3],"many":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"da","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],t0=Number(s[0])==n;if(ord)return"other";return n==1||!t0&&(i==0||i==1)?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tusind",1],"other":["0 tusind",1]}],[10000,{"one":["00 tusind",2],"other":["00 tusind",2]}],[100000,{"one":["000 tusind",3],"other":["000 tusind",3]}],[1000000,{"one":["0 million",1],"other":["0 millioner",1]}],[10000000,{"one":["00 millioner",2],"other":["00 millioner",2]}],[100000000,{"one":["000 millioner",3],"other":["000 millioner",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliarder",1]}],[10000000000,{"one":["00 milliarder",2],"other":["00 milliarder",2]}],[100000000000,{"one":["000 milliarder",3],"other":["000 milliarder",3]}],[1000000000000,{"one":["0 billion",1],"other":["0 billioner",1]}],[10000000000000,{"one":["00 billioner",2],"other":["00 billioner",2]}],[100000000000000,{"one":["000 billioner",3],"other":["000 billioner",3]}]],"short":[[1000,{"one":["0 t",1],"other":["0 t",1]}],[10000,{"one":["00 t",2],"other":["00 t",2]}],[100000,{"one":["000 t",3],"other":["000 t",3]}],[1000000,{"one":["0 mio'.'",1],"other":["0 mio'.'",1]}],[10000000,{"one":["00 mio'.'",2],"other":["00 mio'.'",2]}],[100000000,{"one":["000 mio'.'",3],"other":["000 mio'.'",3]}],[1000000000,{"one":["0 mia'.'",1],"other":["0 mia'.'",1]}],[10000000000,{"one":["00 mia'.'",2],"other":["00 mia'.'",2]}],[100000000000,{"one":["000 mia'.'",3],"other":["000 mia'.'",3]}],[1000000000000,{"one":["0 bio'.'",1],"other":["0 bio'.'",1]}],[10000000000000,{"one":["00 bio'.'",2],"other":["00 bio'.'",2]}],[100000000000000,{"one":["000 bio'.'",3],"other":["000 bio'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"da-GL","parentLocale":"da"});

IntlMessageFormat.__addLocaleData({"locale":"dav","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"de","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 Tausend",1],"other":["0 Tausend",1]}],[10000,{"one":["00 Tausend",2],"other":["00 Tausend",2]}],[100000,{"one":["000 Tausend",3],"other":["000 Tausend",3]}],[1000000,{"one":["0 Million",1],"other":["0 Millionen",1]}],[10000000,{"one":["00 Millionen",2],"other":["00 Millionen",2]}],[100000000,{"one":["000 Millionen",3],"other":["000 Millionen",3]}],[1000000000,{"one":["0 Milliarde",1],"other":["0 Milliarden",1]}],[10000000000,{"one":["00 Milliarden",2],"other":["00 Milliarden",2]}],[100000000000,{"one":["000 Milliarden",3],"other":["000 Milliarden",3]}],[1000000000000,{"one":["0 Billion",1],"other":["0 Billionen",1]}],[10000000000000,{"one":["00 Billionen",2],"other":["00 Billionen",2]}],[100000000000000,{"one":["000 Billionen",3],"other":["000 Billionen",3]}]],"short":[[1000,{"one":["0",1],"other":["0",1]}],[10000,{"one":["0",1],"other":["0",1]}],[100000,{"one":["0",1],"other":["0",1]}],[1000000,{"one":["0 Mio'.'",1],"other":["0 Mio'.'",1]}],[10000000,{"one":["00 Mio'.'",2],"other":["00 Mio'.'",2]}],[100000000,{"one":["000 Mio'.'",3],"other":["000 Mio'.'",3]}],[1000000000,{"one":["0 Mrd'.'",1],"other":["0 Mrd'.'",1]}],[10000000000,{"one":["00 Mrd'.'",2],"other":["00 Mrd'.'",2]}],[100000000000,{"one":["000 Mrd'.'",3],"other":["000 Mrd'.'",3]}],[1000000000000,{"one":["0 Bio'.'",1],"other":["0 Bio'.'",1]}],[10000000000000,{"one":["00 Bio'.'",2],"other":["00 Bio'.'",2]}],[100000000000000,{"one":["000 Bio'.'",3],"other":["000 Bio'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"de-AT","parentLocale":"de"});
IntlMessageFormat.__addLocaleData({"locale":"de-BE","parentLocale":"de"});
IntlMessageFormat.__addLocaleData({"locale":"de-CH","parentLocale":"de"});
IntlMessageFormat.__addLocaleData({"locale":"de-IT","parentLocale":"de"});
IntlMessageFormat.__addLocaleData({"locale":"de-LI","parentLocale":"de"});
IntlMessageFormat.__addLocaleData({"locale":"de-LU","parentLocale":"de"});

IntlMessageFormat.__addLocaleData({"locale":"dje","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"dsb","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i100=i.slice(-2),f100=f.slice(-2);if(ord)return"other";return v0&&i100==1||f100==1?"one":v0&&i100==2||f100==2?"two":v0&&(i100==3||i100==4)||(f100==3||f100==4)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tysac",1],"two":["0 tysac",1],"few":["0 tysac",1],"other":["0 tysac",1]}],[10000,{"one":["00 tysac",2],"two":["00 tysac",2],"few":["00 tysac",2],"other":["00 tysac",2]}],[100000,{"one":["000 tysac",3],"two":["000 tysac",3],"few":["000 tysac",3],"other":["000 tysac",3]}],[1000000,{"one":["0 milion",1],"two":["0 miliona",1],"few":["0 miliony",1],"other":["0 milionow",1]}],[10000000,{"one":["00 milionow",2],"two":["00 milionow",2],"few":["00 milionow",2],"other":["00 milionow",2]}],[100000000,{"one":["000 milionow",3],"two":["000 milionow",3],"few":["000 milionow",3],"other":["000 milionow",3]}],[1000000000,{"one":["0 miliarda",1],"two":["0 miliarźe",1],"few":["0 miliardy",1],"other":["0 miliardow",1]}],[10000000000,{"one":["00 miliardow",2],"two":["00 miliardow",2],"few":["00 miliardow",2],"other":["00 miliardow",2]}],[100000000000,{"one":["000 miliardow",3],"two":["000 miliardow",3],"few":["000 miliardow",3],"other":["000 miliardow",3]}],[1000000000000,{"one":["0 bilion",1],"two":["0 biliona",1],"few":["0 biliony",1],"other":["0 bilionow",1]}],[10000000000000,{"one":["00 bilionow",2],"two":["00 bilionow",2],"few":["00 bilionow",2],"other":["00 bilionow",2]}],[100000000000000,{"one":["000 bilionow",3],"two":["000 bilionow",3],"few":["000 bilionow",3],"other":["000 bilionow",3]}]],"short":[[1000,{"one":["0 tys'.'",1],"two":["0 tys'.'",1],"few":["0 tys'.'",1],"other":["0 tys'.'",1]}],[10000,{"one":["00 tys'.'",2],"two":["00 tys'.'",2],"few":["00 tys'.'",2],"other":["00 tys'.'",2]}],[100000,{"one":["000 tys'.'",3],"two":["000 tys'.'",3],"few":["000 tys'.'",3],"other":["000 tys'.'",3]}],[1000000,{"one":["0 mio'.'",1],"two":["0 mio'.'",1],"few":["0 mio'.'",1],"other":["0 mio'.'",1]}],[10000000,{"one":["00 mio'.'",2],"two":["00 mio'.'",2],"few":["00 mio'.'",2],"other":["00 mio'.'",2]}],[100000000,{"one":["000 mio'.'",3],"two":["000 mio'.'",3],"few":["000 mio'.'",3],"other":["000 mio'.'",3]}],[1000000000,{"one":["0 mrd'.'",1],"two":["0 mrd'.'",1],"few":["0 mrd'.'",1],"other":["0 mrd'.'",1]}],[10000000000,{"one":["00 mrd'.'",2],"two":["00 mrd'.'",2],"few":["00 mrd'.'",2],"other":["00 mrd'.'",2]}],[100000000000,{"one":["000 mrd'.'",3],"two":["000 mrd'.'",3],"few":["000 mrd'.'",3],"other":["000 mrd'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"two":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"two":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"two":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"dua","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"dv","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"dyo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"dz","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["སྟོང་ཕྲག 0",1]}],[10000,{"other":["ཁྲི་ཕྲག 0",1]}],[100000,{"other":["འབུམ་ཕྲག 0",1]}],[1000000,{"other":["ས་ཡ་ 0",1]}],[10000000,{"other":["བྱེ་བ་ 0",1]}],[100000000,{"other":["དུང་ཕྱུར་ 0",1]}],[1000000000,{"other":["དུང་ཕྱུར་ 00",2]}],[10000000000,{"other":["དུང་ཕྱུར་བརྒྱ་ 0",1]}],[100000000000,{"other":["དུང་ཕྱུར་སྟོང 0",1]}],[1000000000000,{"other":["དུང་ཕྱུར་ཁྲི་ 0",1]}],[10000000000000,{"other":["དུང་ཕྱུར་འབུམ་ 0",1]}],[100000000000000,{"other":["དུང་ཕྱུར་ས་ཡ་ 0",1]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ebu","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ee","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["akpe 0",1],"other":["akpe 0",1]}],[10000,{"one":["akpe 00",2],"other":["akpe 00",2]}],[100000,{"one":["akpe 000",3],"other":["akpe 000",3]}],[1000000,{"one":["miliɔn 0",1],"other":["miliɔn 0",1]}],[10000000,{"one":["miliɔn 00",2],"other":["miliɔn 00",2]}],[100000000,{"one":["miliɔn 000",3],"other":["miliɔn 000",3]}],[1000000000,{"one":["biliɔn 0",1],"other":["biliɔn 0",1]}],[10000000000,{"one":["biliɔn 00",2],"other":["biliɔn 00",2]}],[100000000000,{"one":["biliɔn 000",3],"other":["biliɔn 000",3]}],[1000000000000,{"one":["0 triliɔn",1],"other":["0 triliɔn",1]}],[10000000000000,{"one":["triliɔn 00",2],"other":["triliɔn 00",2]}],[100000000000000,{"one":["triliɔn 000",3],"other":["triliɔn 000",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ee-TG","parentLocale":"ee"});

IntlMessageFormat.__addLocaleData({"locale":"el","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 χιλιάδα",1],"other":["0 χιλιάδες",1]}],[10000,{"one":["00 χιλιάδες",2],"other":["00 χιλιάδες",2]}],[100000,{"one":["000 χιλιάδες",3],"other":["000 χιλιάδες",3]}],[1000000,{"one":["0 εκατομμύριο",1],"other":["0 εκατομμύρια",1]}],[10000000,{"one":["00 εκατομμύρια",2],"other":["00 εκατομμύρια",2]}],[100000000,{"one":["000 εκατομμύρια",3],"other":["000 εκατομμύρια",3]}],[1000000000,{"one":["0 δισεκατομμύριο",1],"other":["0 δισεκατομμύρια",1]}],[10000000000,{"one":["00 δισεκατομμύρια",2],"other":["00 δισεκατομμύρια",2]}],[100000000000,{"one":["000 δισεκατομμύρια",3],"other":["000 δισεκατομμύρια",3]}],[1000000000000,{"one":["0 τρισεκατομμύριο",1],"other":["0 τρισεκατομμύρια",1]}],[10000000000000,{"one":["00 τρισεκατομμύρια",2],"other":["00 τρισεκατομμύρια",2]}],[100000000000000,{"one":["000 τρισεκατομμύρια",3],"other":["000 τρισεκατομμύρια",3]}]],"short":[[1000,{"one":["0 χιλ'.'",1],"other":["0 χιλ'.'",1]}],[10000,{"one":["00 χιλ'.'",2],"other":["00 χιλ'.'",2]}],[100000,{"one":["000 χιλ'.'",3],"other":["000 χιλ'.'",3]}],[1000000,{"one":["0 εκ'.'",1],"other":["0 εκ'.'",1]}],[10000000,{"one":["00 εκ'.'",2],"other":["00 εκ'.'",2]}],[100000000,{"one":["000 εκ'.'",3],"other":["000 εκ'.'",3]}],[1000000000,{"one":["0 δισ'.'",1],"other":["0 δισ'.'",1]}],[10000000000,{"one":["00 δισ'.'",2],"other":["00 δισ'.'",2]}],[100000000000,{"one":["000 δισ'.'",3],"other":["000 δισ'.'",3]}],[1000000000000,{"one":["0 τρισ'.'",1],"other":["0 τρισ'.'",1]}],[10000000000000,{"one":["00 τρισ'.'",2],"other":["00 τρισ'.'",2]}],[100000000000000,{"one":["000 τρισ'.'",3],"other":["000 τρισ'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"el-CY","parentLocale":"el"});

IntlMessageFormat.__addLocaleData({"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 thousand",1],"other":["0 thousand",1]}],[10000,{"one":["00 thousand",2],"other":["00 thousand",2]}],[100000,{"one":["000 thousand",3],"other":["000 thousand",3]}],[1000000,{"one":["0 million",1],"other":["0 million",1]}],[10000000,{"one":["00 million",2],"other":["00 million",2]}],[100000000,{"one":["000 million",3],"other":["000 million",3]}],[1000000000,{"one":["0 billion",1],"other":["0 billion",1]}],[10000000000,{"one":["00 billion",2],"other":["00 billion",2]}],[100000000000,{"one":["000 billion",3],"other":["000 billion",3]}],[1000000000000,{"one":["0 trillion",1],"other":["0 trillion",1]}],[10000000000000,{"one":["00 trillion",2],"other":["00 trillion",2]}],[100000000000000,{"one":["000 trillion",3],"other":["000 trillion",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"en-001","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-150","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-AG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-AI","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-AS","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-AT","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-AU","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BB","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BE","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BI","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-BM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BS","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BW","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-BZ","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CA","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CC","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CH","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-CK","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CX","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-CY","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-DE","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-DG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-DK","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-DM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-Dsrt","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"en-ER","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-FI","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-FJ","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-FK","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-FM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GB","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GD","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GH","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GI","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-GU","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-GY","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-HK","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-IE","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-IL","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-IM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-IN","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-IO","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-JE","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-JM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-KE","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-KI","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-KN","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-KY","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-LC","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-LR","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-LS","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MH","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-MO","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MP","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-MS","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MT","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MU","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MW","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-MY","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NA","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NF","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NL","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-NR","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NU","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-NZ","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-PG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-PH","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-PK","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-PN","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-PR","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-PW","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-RW","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SB","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SC","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SD","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SE","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-SG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SH","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SI","parentLocale":"en-150"});
IntlMessageFormat.__addLocaleData({"locale":"en-SL","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SS","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SX","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-SZ","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-Shaw","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"en-TC","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-TK","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-TO","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-TT","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-TV","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-TZ","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-UG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-UM","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-US","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-VC","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-VG","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-VI","parentLocale":"en"});
IntlMessageFormat.__addLocaleData({"locale":"en-VU","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-WS","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-ZA","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-ZM","parentLocale":"en-001"});
IntlMessageFormat.__addLocaleData({"locale":"en-ZW","parentLocale":"en-001"});

IntlMessageFormat.__addLocaleData({"locale":"eo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"es","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 millón",1],"other":["0 millones",1]}],[10000000,{"one":["00 millones",2],"other":["00 millones",2]}],[100000000,{"one":["000 millones",3],"other":["000 millones",3]}],[1000000000,{"one":["0 mil millones",1],"other":["0 mil millones",1]}],[10000000000,{"one":["00 mil millones",2],"other":["00 mil millones",2]}],[100000000000,{"one":["000 mil millones",3],"other":["000 mil millones",3]}],[1000000000000,{"one":["0 billón",1],"other":["0 billones",1]}],[10000000000000,{"one":["00 billones",2],"other":["00 billones",2]}],[100000000000000,{"one":["000 billones",3],"other":["000 billones",3]}]],"short":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0000 M",4],"other":["0000 M",4]}],[10000000000,{"one":["00 mil M",2],"other":["00 mil M",2]}],[100000000000,{"one":["000 mil M",3],"other":["000 mil M",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"es-419","parentLocale":"es","numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 millón",1],"other":["0 millones",1]}],[10000000,{"one":["00 millones",2],"other":["00 millones",2]}],[100000000,{"one":["000 millones",3],"other":["000 millones",3]}],[1000000000,{"one":["0 mil millones",1],"other":["0 mil millones",1]}],[10000000000,{"one":["00 mil millones",2],"other":["00 mil millones",2]}],[100000000000,{"one":["000 mil millones",3],"other":["000 mil millones",3]}],[1000000000000,{"one":["0 billón",1],"other":["0 billón",1]}],[10000000000000,{"one":["00 billones",2],"other":["00 billones",2]}],[100000000000000,{"one":["000 billones",3],"other":["000 billones",3]}]],"short":[[1000,{"one":["0 K",1],"other":["0 K",1]}],[10000,{"one":["00 k",2],"other":["00 k",2]}],[100000,{"one":["000 k",3],"other":["000 k",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0k M",1],"other":["0k M",1]}],[10000000000,{"one":["00k M",2],"other":["00k M",2]}],[100000000000,{"one":["000k M",3],"other":["000k M",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"es-AR","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-BO","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-BR","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-BZ","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-CL","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-CO","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-CR","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-CU","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-DO","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-EA","parentLocale":"es"});
IntlMessageFormat.__addLocaleData({"locale":"es-EC","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-GQ","parentLocale":"es"});
IntlMessageFormat.__addLocaleData({"locale":"es-GT","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-HN","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-IC","parentLocale":"es"});
IntlMessageFormat.__addLocaleData({"locale":"es-MX","parentLocale":"es-419","numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 millón",1],"other":["0 millones",1]}],[10000000,{"one":["00 millones",2],"other":["00 millones",2]}],[100000000,{"one":["000 millones",3],"other":["000 millones",3]}],[1000000000,{"one":["0 mil millones",1],"other":["0 mil millones",1]}],[10000000000,{"one":["00 mil millones",2],"other":["00 mil millones",2]}],[100000000000,{"one":["000 mil millones",3],"other":["000 mil millones",3]}],[1000000000000,{"one":["0 billón",1],"other":["0 billones",1]}],[10000000000000,{"one":["00 billones",2],"other":["00 billones",2]}],[100000000000000,{"one":["000 billones",3],"other":["000 billones",3]}]],"short":[[1000,{"one":["0 k",1],"other":["0 k",1]}],[10000,{"one":["00 k",2],"other":["00 k",2]}],[100000,{"one":["000 k",3],"other":["000 k",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0000 M",4],"other":["0000 M",4]}],[10000000000,{"one":["00 mil M",2],"other":["00 mil M",2]}],[100000000000,{"one":["000 mil M",3],"other":["000 mil M",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"es-NI","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-PA","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-PE","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-PH","parentLocale":"es"});
IntlMessageFormat.__addLocaleData({"locale":"es-PR","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-PY","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-SV","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-US","parentLocale":"es-419","numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 millón",1],"other":["0 millones",1]}],[10000000,{"one":["00 millones",2],"other":["00 millones",2]}],[100000000,{"one":["000 millones",3],"other":["000 millones",3]}],[1000000000,{"one":["0 billón",1],"other":["0 billones",1]}],[10000000000,{"one":["00 billones",2],"other":["00 billones",2]}],[100000000000,{"one":["000 billones",3],"other":["000 billones",3]}],[1000000000000,{"one":["0 trillón",1],"other":["0 trillones",1]}],[10000000000000,{"one":["00 trillones",2],"other":["00 trillones",2]}],[100000000000000,{"one":["000 trillones",3],"other":["000 trillones",3]}]],"short":[[1000,{"one":["0 K",1],"other":["0 K",1]}],[10000,{"one":["00 K",2],"other":["00 K",2]}],[100000,{"one":["000 K",3],"other":["000 K",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000,{"one":["000 B",3],"other":["000 B",3]}],[1000000000000,{"one":["0 T",1],"other":["0 T",1]}],[10000000000000,{"one":["00 T",2],"other":["00 T",2]}],[100000000000000,{"one":["000 T",3],"other":["000 T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"es-UY","parentLocale":"es-419"});
IntlMessageFormat.__addLocaleData({"locale":"es-VE","parentLocale":"es-419"});

IntlMessageFormat.__addLocaleData({"locale":"et","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tuhat",1],"other":["0 tuhat",1]}],[10000,{"one":["00 tuhat",2],"other":["00 tuhat",2]}],[100000,{"one":["000 tuhat",3],"other":["000 tuhat",3]}],[1000000,{"one":["0 miljon",1],"other":["0 miljonit",1]}],[10000000,{"one":["00 miljonit",2],"other":["00 miljonit",2]}],[100000000,{"one":["000 miljonit",3],"other":["000 miljonit",3]}],[1000000000,{"one":["0 miljard",1],"other":["0 miljardit",1]}],[10000000000,{"one":["00 miljardit",2],"other":["00 miljardit",2]}],[100000000000,{"one":["000 miljardit",3],"other":["000 miljardit",3]}],[1000000000000,{"one":["0 triljon",1],"other":["0 triljonit",1]}],[10000000000000,{"one":["00 triljonit",2],"other":["00 triljonit",2]}],[100000000000000,{"one":["000 triljonit",3],"other":["000 triljonit",3]}]],"short":[[1000,{"one":["0 tuh",1],"other":["0 tuh",1]}],[10000,{"one":["00 tuh",2],"other":["00 tuh",2]}],[100000,{"one":["000 tuh",3],"other":["000 tuh",3]}],[1000000,{"one":["0 mln",1],"other":["0 mln",1]}],[10000000,{"one":["00 mln",2],"other":["00 mln",2]}],[100000000,{"one":["000 mln",3],"other":["000 mln",3]}],[1000000000,{"one":["0 mld",1],"other":["0 mld",1]}],[10000000000,{"one":["00 mld",2],"other":["00 mld",2]}],[100000000000,{"one":["000 mld",3],"other":["000 mld",3]}],[1000000000000,{"one":["0 trl",1],"other":["0 trl",1]}],[10000000000000,{"one":["00 trl",2],"other":["00 trl",2]}],[100000000000000,{"one":["000 trl",3],"other":["000 trl",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"eu","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0000",4],"other":["0000",4]}],[10000,{"one":["00000",5],"other":["00000",5]}],[100000,{"one":["000000",6],"other":["000000",6]}],[1000000,{"one":["0 milioi",1],"other":["0 milioi",1]}],[10000000,{"one":["00 milioi",2],"other":["00 milioi",2]}],[100000000,{"one":["000 milioi",3],"other":["000 milioi",3]}],[1000000000,{"one":["0000 milioi",4],"other":["0000 milioi",4]}],[10000000000,{"one":["00000 milioi",5],"other":["00000 milioi",5]}],[100000000000,{"one":["000000 milioi",6],"other":["000000 milioi",6]}],[1000000000000,{"one":["0 bilioi",1],"other":["0 bilioi",1]}],[10000000000000,{"one":["00 bilioi",2],"other":["00 bilioi",2]}],[100000000000000,{"one":["000 bilioi",3],"other":["000 bilioi",3]}]],"short":[[1000,{"one":["0000",4],"other":["0000",4]}],[10000,{"one":["00000",5],"other":["00000",5]}],[100000,{"one":["000000",6],"other":["000000",6]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0000 M",4],"other":["0000 M",4]}],[10000000000,{"one":["00000 M",5],"other":["00000 M",5]}],[100000000000,{"one":["000000 M",6],"other":["000000 M",6]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ewo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"fa","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 هزار",1],"other":["0 هزار",1]}],[10000,{"one":["00 هزار",2],"other":["00 هزار",2]}],[100000,{"one":["000 هزار",3],"other":["000 هزار",3]}],[1000000,{"one":["0 میلیون",1],"other":["0 میلیون",1]}],[10000000,{"one":["00 میلیون",2],"other":["00 میلیون",2]}],[100000000,{"one":["000 میلیون",3],"other":["000 میلیون",3]}],[1000000000,{"one":["0 میلیارد",1],"other":["0 میلیارد",1]}],[10000000000,{"one":["00 میلیارد",2],"other":["00 میلیارد",2]}],[100000000000,{"one":["000 میلیارد",3],"other":["000 میلیارد",3]}],[1000000000000,{"one":["0 هزارمیلیارد",1],"other":["0 هزارمیلیارد",1]}],[10000000000000,{"one":["00 هزارمیلیارد",2],"other":["00 هزارمیلیارد",2]}],[100000000000000,{"one":["000 هزارمیلیارد",3],"other":["000 هزارمیلیارد",3]}]],"short":[[1000,{"one":["0 هزار",1],"other":["0 هزار",1]}],[10000,{"one":["00 هزار",2],"other":["00 هزار",2]}],[100000,{"one":["000 هزار",3],"other":["000 هزار",3]}],[1000000,{"one":["0 میلیون",1],"other":["0 میلیون",1]}],[10000000,{"one":["00 میلیون",2],"other":["00 میلیون",2]}],[100000000,{"one":["000 م",3],"other":["000 م",3]}],[1000000000,{"one":["0 م",1],"other":["0 م",1]}],[10000000000,{"one":["00 م",2],"other":["00 م",2]}],[100000000000,{"one":["000 میلیارد",3],"other":["000 میلیارد",3]}],[1000000000000,{"one":["0 تریلیون",1],"other":["0 تریلیون",1]}],[10000000000000,{"one":["00 ت",2],"other":["00 ت",2]}],[100000000000000,{"one":["000 ت",3],"other":["000 ت",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"fa-AF","parentLocale":"fa"});

IntlMessageFormat.__addLocaleData({"locale":"ff","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<2?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ff-Adlm","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn","parentLocale":"ff"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-BF","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-CM","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-GH","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-GM","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-GN","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-GW","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-LR","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-MR","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-NE","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-NG","parentLocale":"ff-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"ff-Latn-SL","parentLocale":"ff-Latn"});

IntlMessageFormat.__addLocaleData({"locale":"fi","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tuhat",1],"other":["0 tuhatta",1]}],[10000,{"one":["00 tuhatta",2],"other":["00 tuhatta",2]}],[100000,{"one":["000 tuhatta",3],"other":["000 tuhatta",3]}],[1000000,{"one":["0 miljoona",1],"other":["0 miljoonaa",1]}],[10000000,{"one":["00 miljoonaa",2],"other":["00 miljoonaa",2]}],[100000000,{"one":["000 miljoonaa",3],"other":["000 miljoonaa",3]}],[1000000000,{"one":["0 miljardi",1],"other":["0 miljardia",1]}],[10000000000,{"one":["00 miljardia",2],"other":["00 miljardia",2]}],[100000000000,{"one":["000 miljardia",3],"other":["000 miljardia",3]}],[1000000000000,{"one":["0 biljoona",1],"other":["0 biljoonaa",1]}],[10000000000000,{"one":["00 biljoonaa",2],"other":["00 biljoonaa",2]}],[100000000000000,{"one":["000 biljoonaa",3],"other":["000 biljoonaa",3]}]],"short":[[1000,{"one":["0 t'.'",1],"other":["0 t'.'",1]}],[10000,{"one":["00 t'.'",2],"other":["00 t'.'",2]}],[100000,{"one":["000 t'.'",3],"other":["000 t'.'",3]}],[1000000,{"one":["0 milj'.'",1],"other":["0 milj'.'",1]}],[10000000,{"one":["00 milj'.'",2],"other":["00 milj'.'",2]}],[100000000,{"one":["000 milj'.'",3],"other":["000 milj'.'",3]}],[1000000000,{"one":["0 mrd'.'",1],"other":["0 mrd'.'",1]}],[10000000000,{"one":["00 mrd'.'",2],"other":["00 mrd'.'",2]}],[100000000000,{"one":["000 mrd'.'",3],"other":["000 mrd'.'",3]}],[1000000000000,{"one":["0 bilj'.'",1],"other":["0 bilj'.'",1]}],[10000000000000,{"one":["00 bilj'.'",2],"other":["00 bilj'.'",2]}],[100000000000000,{"one":["000 bilj'.'",3],"other":["000 bilj'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"fil","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),f10=f.slice(-1);if(ord)return n==1?"one":"other";return v0&&(i==1||i==2||i==3)||v0&&i10!=4&&i10!=6&&i10!=9||!v0&&f10!=4&&f10!=6&&f10!=9?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 libo",1],"other":["0 na libo",1]}],[10000,{"one":["00 libo",2],"other":["00 na libo",2]}],[100000,{"one":["000 libo",3],"other":["000 na libo",3]}],[1000000,{"one":["0 milyon",1],"other":["0 na milyon",1]}],[10000000,{"one":["00 milyon",2],"other":["00 na milyon",2]}],[100000000,{"one":["000 milyon",3],"other":["000 na milyon",3]}],[1000000000,{"one":["0 bilyon",1],"other":["0 na bilyon",1]}],[10000000000,{"one":["00 bilyon",2],"other":["00 na bilyon",2]}],[100000000000,{"one":["000 bilyon",3],"other":["000 na bilyon",3]}],[1000000000000,{"one":["0 trilyon",1],"other":["0 na trilyon",1]}],[10000000000000,{"one":["00 trilyon",2],"other":["00 na trilyon",2]}],[100000000000000,{"one":["000 trilyon",3],"other":["000 na trilyon",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"fo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 túsund",1],"other":["0 túsund",1]}],[10000,{"one":["00 túsund",2],"other":["00 túsund",2]}],[100000,{"one":["000 túsund",3],"other":["000 túsund",3]}],[1000000,{"one":["0 millión",1],"other":["0 milliónir",1]}],[10000000,{"one":["00 milliónir",2],"other":["00 milliónir",2]}],[100000000,{"one":["000 milliónir",3],"other":["000 milliónir",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliardir",1]}],[10000000000,{"one":["00 milliardir",2],"other":["00 milliardir",2]}],[100000000000,{"one":["000 milliardir",3],"other":["000 milliardir",3]}],[1000000000000,{"one":["0 billión",1],"other":["0 billiónir",1]}],[10000000000000,{"one":["00 billiónir",2],"other":["00 billiónir",2]}],[100000000000000,{"one":["000 billiónir",3],"other":["000 billiónir",3]}]],"short":[[1000,{"one":["0 tús'.'",1],"other":["0 tús'.'",1]}],[10000,{"one":["00 tús'.'",2],"other":["00 tús'.'",2]}],[100000,{"one":["000 tús'.'",3],"other":["000 tús'.'",3]}],[1000000,{"one":["0 mió'.'",1],"other":["0 mió'.'",1]}],[10000000,{"one":["00 mió'.'",2],"other":["00 mió'.'",2]}],[100000000,{"one":["000 mió'.'",3],"other":["000 mió'.'",3]}],[1000000000,{"one":["0 mia'.'",1],"other":["0 mia'.'",1]}],[10000000000,{"one":["00 mia'.'",2],"other":["00 mia'.'",2]}],[100000000000,{"one":["000 mia'.'",3],"other":["000 mia'.'",3]}],[1000000000000,{"one":["0 bió'.'",1],"other":["0 bió'.'",1]}],[10000000000000,{"one":["00 bió'.'",2],"other":["00 bió'.'",2]}],[100000000000000,{"one":["000 bió'.'",3],"other":["000 bió'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"fo-DK","parentLocale":"fo"});

IntlMessageFormat.__addLocaleData({"locale":"fr","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return n>=0&&n<2?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 millier",1],"other":["0 mille",1]}],[10000,{"one":["00 mille",2],"other":["00 mille",2]}],[100000,{"one":["000 mille",3],"other":["000 mille",3]}],[1000000,{"one":["0 million",1],"other":["0 millions",1]}],[10000000,{"one":["00 million",2],"other":["00 millions",2]}],[100000000,{"one":["000 million",3],"other":["000 millions",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliards",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliards",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliards",3]}],[1000000000000,{"one":["0 billion",1],"other":["0 billions",1]}],[10000000000000,{"one":["00 billion",2],"other":["00 billions",2]}],[100000000000000,{"one":["000 billion",3],"other":["000 billions",3]}]],"short":[[1000,{"one":["0 k",1],"other":["0 k",1]}],[10000,{"one":["00 k",2],"other":["00 k",2]}],[100000,{"one":["000 k",3],"other":["000 k",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0 Md",1],"other":["0 Md",1]}],[10000000000,{"one":["00 Md",2],"other":["00 Md",2]}],[100000000000,{"one":["000 Md",3],"other":["000 Md",3]}],[1000000000000,{"one":["0 Bn",1],"other":["0 Bn",1]}],[10000000000000,{"one":["00 Bn",2],"other":["00 Bn",2]}],[100000000000000,{"one":["000 Bn",3],"other":["000 Bn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"fr-BE","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-BF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-BI","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-BJ","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-BL","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CA","parentLocale":"fr","numbers":{"decimal":{"long":[[1000,{"one":["0 mille",1],"other":["0 mille",1]}],[10000,{"one":["00 mille",2],"other":["00 mille",2]}],[100000,{"one":["000 mille",3],"other":["000 mille",3]}],[1000000,{"one":["0 million",1],"other":["0 millions",1]}],[10000000,{"one":["00 million",2],"other":["00 millions",2]}],[100000000,{"one":["000 million",3],"other":["000 millions",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliards",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliards",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliards",3]}],[1000000000000,{"one":["0 billion",1],"other":["0 billions",1]}],[10000000000000,{"one":["00 billion",2],"other":["00 billions",2]}],[100000000000000,{"one":["000 billion",3],"other":["000 billions",3]}]],"short":[[1000,{"one":["0 k",1],"other":["0 k",1]}],[10000,{"one":["00 k",2],"other":["00 k",2]}],[100000,{"one":["000 k",3],"other":["000 k",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0 G",1],"other":["0 G",1]}],[10000000000,{"one":["00 G",2],"other":["00 G",2]}],[100000000000,{"one":["000 G",3],"other":["000 G",3]}],[1000000000000,{"one":["0 T",1],"other":["0 T",1]}],[10000000000000,{"one":["00 T",2],"other":["00 T",2]}],[100000000000000,{"one":["000 T",3],"other":["000 T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"fr-CD","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CG","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CH","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CI","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-CM","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-DJ","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-DZ","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-GA","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-GF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-GN","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-GP","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-GQ","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-HT","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-KM","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-LU","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MA","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MC","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MG","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-ML","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MQ","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MR","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-MU","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-NC","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-NE","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-PF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-PM","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-RE","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-RW","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-SC","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-SN","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-SY","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-TD","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-TG","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-TN","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-VU","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-WF","parentLocale":"fr"});
IntlMessageFormat.__addLocaleData({"locale":"fr-YT","parentLocale":"fr"});

IntlMessageFormat.__addLocaleData({"locale":"fur","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"fy","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tûzen",1],"other":["0 tûzen",1]}],[10000,{"one":["00 tûzen",2],"other":["00 tûzen",2]}],[100000,{"one":["000 tûzen",3],"other":["000 tûzen",3]}],[1000000,{"one":["0 miljoen",1],"other":["0 miljoen",1]}],[10000000,{"one":["00 miljoen",2],"other":["00 miljoen",2]}],[100000000,{"one":["000 miljoen",3],"other":["000 miljoen",3]}],[1000000000,{"one":["0 miljard",1],"other":["0 miljard",1]}],[10000000000,{"one":["00 miljard",2],"other":["00 miljard",2]}],[100000000000,{"one":["000 miljard",3],"other":["000 miljard",3]}],[1000000000000,{"one":["0 biljoen",1],"other":["0 biljoen",1]}],[10000000000000,{"one":["00 biljoen",2],"other":["00 biljoen",2]}],[100000000000000,{"one":["000 biljoen",3],"other":["000 biljoen",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0 mln'.'",1],"other":["0 mln'.'",1]}],[10000000,{"one":["00 mln'.'",2],"other":["00 mln'.'",2]}],[100000000,{"one":["000 mln'.'",3],"other":["000 mln'.'",3]}],[1000000000,{"one":["0 mld'.'",1],"other":["0 mld'.'",1]}],[10000000000,{"one":["00 mld'.'",2],"other":["00 mld'.'",2]}],[100000000000,{"one":["000 mld'.'",3],"other":["000 mld'.'",3]}],[1000000000000,{"one":["0 bln'.'",1],"other":["0 bln'.'",1]}],[10000000000000,{"one":["00 bln'.'",2],"other":["00 bln'.'",2]}],[100000000000000,{"one":["000 bln'.'",3],"other":["000 bln'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ga","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return n==1?"one":"other";return n==1?"one":n==2?"two":t0&&n>=3&&n<=6?"few":t0&&n>=7&&n<=10?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mhíle",1],"two":["0 mhíle",1],"few":["0 mhíle",1],"many":["0 míle",1],"other":["0 míle",1]}],[10000,{"one":["00 míle",2],"two":["00 míle",2],"few":["00 míle",2],"many":["00 míle",2],"other":["00 míle",2]}],[100000,{"one":["000 míle",3],"two":["000 míle",3],"few":["000 míle",3],"many":["000 míle",3],"other":["000 míle",3]}],[1000000,{"one":["0 mhilliún",1],"two":["0 mhilliún",1],"few":["0 mhilliún",1],"many":["0 milliún",1],"other":["0 milliún",1]}],[10000000,{"one":["00 milliún",2],"two":["00 milliún",2],"few":["00 milliún",2],"many":["00 milliún",2],"other":["00 milliún",2]}],[100000000,{"one":["000 milliún",3],"two":["000 milliún",3],"few":["000 milliún",3],"many":["000 milliún",3],"other":["000 milliún",3]}],[1000000000,{"one":["0 bhilliún",1],"two":["0 bhilliún",1],"few":["0 bhilliún",1],"many":["0 mbilliún",1],"other":["0 billiún",1]}],[10000000000,{"one":["00 billiún",2],"two":["00 billiún",2],"few":["00 billiún",2],"many":["00 mbilliún",2],"other":["00 billiún",2]}],[100000000000,{"one":["000 billiún",3],"two":["000 billiún",3],"few":["000 billiún",3],"many":["000 billiún",3],"other":["000 billiún",3]}],[1000000000000,{"one":["0 trilliún",1],"two":["0 thrilliún",1],"few":["0 thrilliún",1],"many":["0 dtrilliún",1],"other":["0 trilliún",1]}],[10000000000000,{"one":["00 trilliún",2],"two":["00 trilliún",2],"few":["00 trilliún",2],"many":["00 dtrilliún",2],"other":["00 trilliún",2]}],[100000000000000,{"one":["000 trilliún",3],"two":["000 trilliún",3],"few":["000 trilliún",3],"many":["000 trilliún",3],"other":["000 trilliún",3]}]],"short":[[1000,{"one":["0k",1],"two":["0k",1],"few":["0k",1],"many":["0k",1],"other":["0k",1]}],[10000,{"one":["00k",2],"two":["00k",2],"few":["00k",2],"many":["00k",2],"other":["00k",2]}],[100000,{"one":["000k",3],"two":["000k",3],"few":["000k",3],"many":["000k",3],"other":["000k",3]}],[1000000,{"one":["0M",1],"two":["0M",1],"few":["0M",1],"many":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"two":["00M",2],"few":["00M",2],"many":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"two":["000M",3],"few":["000M",3],"many":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"two":["0B",1],"few":["0B",1],"many":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"two":["00B",2],"few":["00B",2],"many":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"two":["000B",3],"few":["000B",3],"many":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"two":["0T",1],"few":["0T",1],"many":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"two":["00T",2],"few":["00T",2],"many":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"two":["000T",3],"few":["000T",3],"many":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"gd","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return n==1||n==11?"one":n==2||n==12?"two":n==3||n==13?"few":"other";return n==1||n==11?"one":n==2||n==12?"two":t0&&n>=3&&n<=10||t0&&n>=13&&n<=19?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mhìle",1],"two":["0 mhìle",1],"few":["0 mìltean",1],"other":["0 mìle",1]}],[10000,{"one":["00 mhìle",2],"two":["00 mhìle",2],"few":["00 mìltean",2],"other":["00 mìle",2]}],[100000,{"one":["000 mhìle",3],"two":["000 mhìle",3],"few":["000 mìltean",3],"other":["000 mìle",3]}],[1000000,{"one":["0 mhillean",1],"two":["0 mhillean",1],"few":["0 milleanan",1],"other":["0 millean",1]}],[10000000,{"one":["00 mhillean",2],"two":["00 mhillean",2],"few":["00 milleanan",2],"other":["00 millean",2]}],[100000000,{"one":["000 mhillean",3],"two":["000 mhillean",3],"few":["000 milleanan",3],"other":["000 millean",3]}],[1000000000,{"one":["0 bhillean",1],"two":["0 bhillean",1],"few":["0 billeanan",1],"other":["0 billean",1]}],[10000000000,{"one":["00 bhillean",2],"two":["00 bhillean",2],"few":["00 billeanan",2],"other":["00 billean",2]}],[100000000000,{"one":["000 bhillean",3],"two":["000 bhillean",3],"few":["000 billeanan",3],"other":["000 billean",3]}],[1000000000000,{"one":["0 trillean",1],"two":["0 thrillean",1],"few":["0 trilleanan",1],"other":["0 trillean",1]}],[10000000000000,{"one":["00 trillean",2],"two":["00 thrillean",2],"few":["00 trilleanan",2],"other":["00 trillean",2]}],[100000000000000,{"one":["000 trillean",3],"two":["000 thrillean",3],"few":["000 trilleanan",3],"other":["000 trillean",3]}]],"short":[[1000,{"one":["0K",1],"two":["0K",1],"few":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"two":["00K",2],"few":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"two":["000K",3],"few":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"two":["0M",1],"few":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"two":["00M",2],"few":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"two":["000M",3],"few":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"two":["0B",1],"few":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"two":["00B",2],"few":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"two":["000B",3],"few":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"two":["0T",1],"few":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"two":["00T",2],"few":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"two":["000T",3],"few":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"gl","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0",1],"other":["0",1]}],[10000,{"one":["0",1],"other":["0",1]}],[100000,{"one":["0",1],"other":["0",1]}],[1000000,{"one":["0 millón",1],"other":["0 millóns",1]}],[10000000,{"one":["00 millóns",2],"other":["00 millóns",2]}],[100000000,{"one":["000 millóns",3],"other":["000 millóns",3]}],[1000000000,{"one":["0",1],"other":["0",1]}],[10000000000,{"one":["0",1],"other":["0",1]}],[100000000000,{"one":["0",1],"other":["0",1]}],[1000000000000,{"one":["0 billón",1],"other":["0 billóns",1]}],[10000000000000,{"one":["00 billóns",2],"other":["00 billóns",2]}],[100000000000000,{"one":["000 billóns",3],"other":["000 billóns",3]}]],"short":[[1000,{"one":["0",1],"other":["0",1]}],[10000,{"one":["0",1],"other":["0",1]}],[100000,{"one":["0",1],"other":["0",1]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0",1],"other":["0",1]}],[10000000000,{"one":["0",1],"other":["0",1]}],[100000000000,{"one":["0",1],"other":["0",1]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"gsw","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 Tuusig",1],"other":["0 Tuusig",1]}],[10000,{"one":["00 Tuusig",2],"other":["00 Tuusig",2]}],[100000,{"one":["000 Tuusig",3],"other":["000 Tuusig",3]}],[1000000,{"one":["0 Millioon",1],"other":["0 Millioone",1]}],[10000000,{"one":["00 Millioon",2],"other":["00 Millioone",2]}],[100000000,{"one":["000 Millioon",3],"other":["000 Millioone",3]}],[1000000000,{"one":["0 Milliarde",1],"other":["0 Milliarde",1]}],[10000000000,{"one":["00 Milliarde",2],"other":["00 Milliarde",2]}],[100000000000,{"one":["000 Milliarde",3],"other":["000 Milliarde",3]}],[1000000000000,{"one":["0 Billioon",1],"other":["0 Billioone",1]}],[10000000000000,{"one":["00 Billioon",2],"other":["00 Billioone",2]}],[100000000000000,{"one":["000 Billioon",3],"other":["000 Billioone",3]}]],"short":[[1000,{"one":["0 Tsg'.'",1],"other":["0 Tsg'.'",1]}],[10000,{"one":["00 Tsg'.'",2],"other":["00 Tsg'.'",2]}],[100000,{"one":["000 Tsg'.'",3],"other":["000 Tsg'.'",3]}],[1000000,{"one":["0 Mio'.'",1],"other":["0 Mio'.'",1]}],[10000000,{"one":["00 Mio'.'",2],"other":["00 Mio'.'",2]}],[100000000,{"one":["000 Mio'.'",3],"other":["000 Mio'.'",3]}],[1000000000,{"one":["0 Mrd'.'",1],"other":["0 Mrd'.'",1]}],[10000000000,{"one":["00 Mrd'.'",2],"other":["00 Mrd'.'",2]}],[100000000000,{"one":["000 Mrd'.'",3],"other":["000 Mrd'.'",3]}],[1000000000000,{"one":["0 Bio'.'",1],"other":["0 Bio'.'",1]}],[10000000000000,{"one":["00 Bio'.'",2],"other":["00 Bio'.'",2]}],[100000000000000,{"one":["000 Bio'.'",3],"other":["000 Bio'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"gsw-FR","parentLocale":"gsw"});
IntlMessageFormat.__addLocaleData({"locale":"gsw-LI","parentLocale":"gsw"});

IntlMessageFormat.__addLocaleData({"locale":"gu","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":n==2||n==3?"two":n==4?"few":n==6?"many":"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 હજાર",1],"other":["0 હજાર",1]}],[10000,{"one":["00 હજાર",2],"other":["00 હજાર",2]}],[100000,{"one":["0 લાખ",1],"other":["0 લાખ",1]}],[1000000,{"one":["00 લાખ",2],"other":["00 લાખ",2]}],[10000000,{"one":["0 કરોડ",1],"other":["0 કરોડ",1]}],[100000000,{"one":["00 કરોડ",2],"other":["00 કરોડ",2]}],[1000000000,{"one":["0 અબજ",1],"other":["0 અબજ",1]}],[10000000000,{"one":["00 અબજ",2],"other":["00 અબજ",2]}],[100000000000,{"one":["0 નિખર્વ",1],"other":["0 નિખર્વ",1]}],[1000000000000,{"one":["0 મહાપદ્મ",1],"other":["0 મહાપદ્મ",1]}],[10000000000000,{"one":["0 શંકુ",1],"other":["0 શંકુ",1]}],[100000000000000,{"one":["0 જલધિ",1],"other":["0 જલધિ",1]}]],"short":[[1000,{"one":["0 હજાર",1],"other":["0 હજાર",1]}],[10000,{"one":["00 હજાર",2],"other":["00 હજાર",2]}],[100000,{"one":["0 લાખ",1],"other":["0 લાખ",1]}],[1000000,{"one":["00 લાખ",2],"other":["00 લાખ",2]}],[10000000,{"one":["0 કરોડ",1],"other":["0 કરોડ",1]}],[100000000,{"one":["00 કરોડ",2],"other":["00 કરોડ",2]}],[1000000000,{"one":["0 અબજ",1],"other":["0 અબજ",1]}],[10000000000,{"one":["00 અબજ",2],"other":["00 અબજ",2]}],[100000000000,{"one":["0 નિખર્વ",1],"other":["0 નિખર્વ",1]}],[1000000000000,{"one":["0 મહાપદ્મ",1],"other":["0 મહાપદ્મ",1]}],[10000000000000,{"one":["0 શંકુ",1],"other":["0 શંકુ",1]}],[100000000000000,{"one":["0 જલધિ",1],"other":["0 જલધિ",1]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"guw","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"guz","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"gv","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return"other";return v0&&i10==1?"one":v0&&i10==2?"two":v0&&(i100==0||i100==20||i100==40||i100==60||i100==80)?"few":!v0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ha","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["Dubu 0",1],"other":["Dubu 0",1]}],[10000,{"one":["Dubu 00",2],"other":["Dubu 00",2]}],[100000,{"one":["Dubu 000",3],"other":["Dubu 000",3]}],[1000000,{"one":["Miliyan 0",1],"other":["Miliyan 0",1]}],[10000000,{"one":["Miliyan 00",2],"other":["Miliyan 00",2]}],[100000000,{"one":["Miliyan 000",3],"other":["Miliyan 000",3]}],[1000000000,{"one":["Biliyan 0",1],"other":["Biliyan 0",1]}],[10000000000,{"one":["Biliyan 00",2],"other":["Biliyan 00",2]}],[100000000000,{"one":["Biliyan 000",3],"other":["Biliyan 000",3]}],[1000000000000,{"one":["Triliyan 0",1],"other":["Triliyan 0",1]}],[10000000000000,{"one":["Triliyan 00",2],"other":["Triliyan 00",2]}],[100000000000000,{"one":["Triliyan 000",3],"other":["Triliyan 000",3]}]],"short":[[1000,{"one":["0D",1],"other":["0D",1]}],[10000,{"one":["00D",2],"other":["00D",2]}],[100000,{"one":["000D",3],"other":["000D",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ha-Arab","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ha-GH","parentLocale":"ha"});
IntlMessageFormat.__addLocaleData({"locale":"ha-NE","parentLocale":"ha"});

IntlMessageFormat.__addLocaleData({"locale":"haw","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"he","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return"other";return n==1&&v0?"one":i==2&&v0?"two":v0&&(n<0||n>10)&&t0&&n10==0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["‏0 אלף",1],"two":["‏0 אלף",1],"many":["‏0 אלף",1],"other":["‏0 אלף",1]}],[10000,{"one":["‏00 אלף",2],"two":["‏00 אלף",2],"many":["‏00 אלף",2],"other":["‏00 אלף",2]}],[100000,{"one":["‏000 אלף",3],"two":["‏000 אלף",3],"many":["‏000 אלף",3],"other":["‏000 אלף",3]}],[1000000,{"one":["‏0 מיליון",1],"two":["‏0 מיליון",1],"many":["‏0 מיליון",1],"other":["‏0 מיליון",1]}],[10000000,{"one":["‏00 מיליון",2],"two":["‏00 מיליון",2],"many":["‏00 מיליון",2],"other":["‏00 מיליון",2]}],[100000000,{"one":["‏000 מיליון",3],"two":["‏000 מיליון",3],"many":["‏000 מיליון",3],"other":["‏000 מיליון",3]}],[1000000000,{"one":["‏0 מיליארד",1],"two":["‏0 מיליארד",1],"many":["‏0 מיליארד",1],"other":["‏0 מיליארד",1]}],[10000000000,{"one":["‏00 מיליארד",2],"two":["‏00 מיליארד",2],"many":["‏00 מיליארד",2],"other":["‏00 מיליארד",2]}],[100000000000,{"one":["‏000 מיליארד",3],"two":["‏000 מיליארד",3],"many":["‏000 מיליארד",3],"other":["‏000 מיליארד",3]}],[1000000000000,{"one":["‏0 טריליון",1],"two":["‏0 טריליון",1],"many":["‏0 טריליון",1],"other":["‏0 טריליון",1]}],[10000000000000,{"one":["‏00 טריליון",2],"two":["‏00 טריליון",2],"many":["‏00 טריליון",2],"other":["‏00 טריליון",2]}],[100000000000000,{"one":["‏000 טריליון",3],"two":["‏000 טריליון",3],"many":["‏000 טריליון",3],"other":["‏000 טריליון",3]}]],"short":[[1000,{"one":["0K",1],"two":["0K",1],"many":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"two":["00K",2],"many":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"two":["000K",3],"many":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"two":["0M",1],"many":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"two":["00M",2],"many":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"two":["000M",3],"many":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"two":["0B",1],"many":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"two":["00B",2],"many":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"two":["000B",3],"many":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"two":["0T",1],"many":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"two":["00T",2],"many":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"two":["000T",3],"many":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"hi","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":n==2||n==3?"two":n==4?"few":n==6?"many":"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 हज़ार",1],"other":["0 हज़ार",1]}],[10000,{"one":["00 हज़ार",2],"other":["00 हज़ार",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["00 लाख",2],"other":["00 लाख",2]}],[10000000,{"one":["0 करोड़",1],"other":["0 करोड़",1]}],[100000000,{"one":["00 करोड़",2],"other":["00 करोड़",2]}],[1000000000,{"one":["0 अरब",1],"other":["0 अरब",1]}],[10000000000,{"one":["00 अरब",2],"other":["00 अरब",2]}],[100000000000,{"one":["0 खरब",1],"other":["0 खरब",1]}],[1000000000000,{"one":["00 खरब",2],"other":["00 खरब",2]}],[10000000000000,{"one":["000 खरब",3],"other":["000 खरब",3]}],[100000000000000,{"one":["0000 खरब",4],"other":["0000 खरब",4]}]],"short":[[1000,{"one":["0 हज़ार",1],"other":["0 हज़ार",1]}],[10000,{"one":["00 हज़ार",2],"other":["00 हज़ार",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["00 लाख",2],"other":["00 लाख",2]}],[10000000,{"one":["0 क॰",1],"other":["0 क॰",1]}],[100000000,{"one":["00 क॰",2],"other":["00 क॰",2]}],[1000000000,{"one":["0 अ॰",1],"other":["0 अ॰",1]}],[10000000000,{"one":["00 अ॰",2],"other":["00 अ॰",2]}],[100000000000,{"one":["0 ख॰",1],"other":["0 ख॰",1]}],[1000000000000,{"one":["00 ख॰",2],"other":["00 ख॰",2]}],[10000000000000,{"one":["0 नील",1],"other":["0 नील",1]}],[100000000000000,{"one":["00 नील",2],"other":["00 नील",2]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"hr","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tisuća",1],"few":["0 tisuće",1],"other":["0 tisuća",1]}],[10000,{"one":["00 tisuća",2],"few":["00 tisuće",2],"other":["00 tisuća",2]}],[100000,{"one":["000 tisuća",3],"few":["000 tisuće",3],"other":["000 tisuća",3]}],[1000000,{"one":["0 milijun",1],"few":["0 milijuna",1],"other":["0 milijuna",1]}],[10000000,{"one":["00 milijun",2],"few":["00 milijuna",2],"other":["00 milijuna",2]}],[100000000,{"one":["000 milijun",3],"few":["000 milijuna",3],"other":["000 milijuna",3]}],[1000000000,{"one":["0 milijarda",1],"few":["0 milijarde",1],"other":["0 milijardi",1]}],[10000000000,{"one":["00 milijarda",2],"few":["00 milijarde",2],"other":["00 milijardi",2]}],[100000000000,{"one":["000 milijarda",3],"few":["000 milijarde",3],"other":["000 milijardi",3]}],[1000000000000,{"one":["0 bilijun",1],"few":["0 bilijuna",1],"other":["0 bilijuna",1]}],[10000000000000,{"one":["00 bilijun",2],"few":["00 bilijuna",2],"other":["00 bilijuna",2]}],[100000000000000,{"one":["000 bilijun",3],"few":["000 bilijuna",3],"other":["000 bilijuna",3]}]],"short":[[1000,{"one":["0 tis'.'",1],"few":["0 tis'.'",1],"other":["0 tis'.'",1]}],[10000,{"one":["00 tis'.'",2],"few":["00 tis'.'",2],"other":["00 tis'.'",2]}],[100000,{"one":["000 tis'.'",3],"few":["000 tis'.'",3],"other":["000 tis'.'",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mlr'.'",1],"few":["0 mlr'.'",1],"other":["0 mlr'.'",1]}],[10000000000,{"one":["00 mlr'.'",2],"few":["00 mlr'.'",2],"other":["00 mlr'.'",2]}],[100000000000,{"one":["000 mlr'.'",3],"few":["000 mlr'.'",3],"other":["000 mlr'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"hr-BA","parentLocale":"hr"});

IntlMessageFormat.__addLocaleData({"locale":"hsb","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i100=i.slice(-2),f100=f.slice(-2);if(ord)return"other";return v0&&i100==1||f100==1?"one":v0&&i100==2||f100==2?"two":v0&&(i100==3||i100==4)||(f100==3||f100==4)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tysac",1],"two":["0 tysac",1],"few":["0 tysac",1],"other":["0 tysac",1]}],[10000,{"one":["00 tysac",2],"two":["00 tysac",2],"few":["00 tysac",2],"other":["00 tysac",2]}],[100000,{"one":["000 tysac",3],"two":["000 tysac",3],"few":["000 tysac",3],"other":["000 tysac",3]}],[1000000,{"one":["0 milion",1],"two":["0 milionaj",1],"few":["0 miliony",1],"other":["0 milionow",1]}],[10000000,{"one":["00 milionow",2],"two":["00 milionow",2],"few":["00 milionow",2],"other":["00 milionow",2]}],[100000000,{"one":["000 milionow",3],"two":["000 milionow",3],"few":["000 milionow",3],"other":["000 milionow",3]}],[1000000000,{"one":["0 miliarda",1],"two":["0 miliardźe",1],"few":["0 miliardy",1],"other":["0 miliardow",1]}],[10000000000,{"one":["00 miliardow",2],"two":["00 miliardow",2],"few":["00 miliardow",2],"other":["00 miliardow",2]}],[100000000000,{"one":["000 miliardow",3],"two":["000 miliardow",3],"few":["000 miliardow",3],"other":["000 miliardow",3]}],[1000000000000,{"one":["0 bilion",1],"two":["0 bilionaj",1],"few":["0 biliony",1],"other":["0 bilionow",1]}],[10000000000000,{"one":["00 bilionow",2],"two":["00 bilionow",2],"few":["00 bilionow",2],"other":["00 bilionow",2]}],[100000000000000,{"one":["000 bilionow",3],"two":["000 bilionow",3],"few":["000 bilionow",3],"other":["000 bilionow",3]}]],"short":[[1000,{"one":["0 tys'.'",1],"two":["0 tys'.'",1],"few":["0 tys'.'",1],"other":["0 tys'.'",1]}],[10000,{"one":["00 tys'.'",2],"two":["00 tys'.'",2],"few":["00 tys'.'",2],"other":["00 tys'.'",2]}],[100000,{"one":["000 tys'.'",3],"two":["000 tys'.'",3],"few":["000 tys'.'",3],"other":["000 tys'.'",3]}],[1000000,{"one":["0 mio'.'",1],"two":["0 mio'.'",1],"few":["0 mio'.'",1],"other":["0 mio'.'",1]}],[10000000,{"one":["00 mio'.'",2],"two":["00 mio'.'",2],"few":["00 mio'.'",2],"other":["00 mio'.'",2]}],[100000000,{"one":["000 mio'.'",3],"two":["000 mio'.'",3],"few":["000 mio'.'",3],"other":["000 mio'.'",3]}],[1000000000,{"one":["0 mrd'.'",1],"two":["0 mrd'.'",1],"few":["0 mrd'.'",1],"other":["0 mrd'.'",1]}],[10000000000,{"one":["00 mrd'.'",2],"two":["00 mrd'.'",2],"few":["00 mrd'.'",2],"other":["00 mrd'.'",2]}],[100000000000,{"one":["000 mrd'.'",3],"two":["000 mrd'.'",3],"few":["000 mrd'.'",3],"other":["000 mrd'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"two":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"two":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"two":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"hu","pluralRuleFunction":function (n,ord){if(ord)return n==1||n==5?"one":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ezer",1],"other":["0 ezer",1]}],[10000,{"one":["00 ezer",2],"other":["00 ezer",2]}],[100000,{"one":["000 ezer",3],"other":["000 ezer",3]}],[1000000,{"one":["0 millió",1],"other":["0 millió",1]}],[10000000,{"one":["00 millió",2],"other":["00 millió",2]}],[100000000,{"one":["000 millió",3],"other":["000 millió",3]}],[1000000000,{"one":["0 milliárd",1],"other":["0 milliárd",1]}],[10000000000,{"one":["00 milliárd",2],"other":["00 milliárd",2]}],[100000000000,{"one":["000 milliárd",3],"other":["000 milliárd",3]}],[1000000000000,{"one":["0 billió",1],"other":["0 billió",1]}],[10000000000000,{"one":["00 billió",2],"other":["00 billió",2]}],[100000000000000,{"one":["000 billió",3],"other":["000 billió",3]}]],"short":[[1000,{"one":["0 E",1],"other":["0 E",1]}],[10000,{"one":["00 E",2],"other":["00 E",2]}],[100000,{"one":["000 E",3],"other":["000 E",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0 Mrd",1],"other":["0 Mrd",1]}],[10000000000,{"one":["00 Mrd",2],"other":["00 Mrd",2]}],[100000000000,{"one":["000 Mrd",3],"other":["000 Mrd",3]}],[1000000000000,{"one":["0 B",1],"other":["0 B",1]}],[10000000000000,{"one":["00 B",2],"other":["00 B",2]}],[100000000000000,{"one":["000 B",3],"other":["000 B",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"hy","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return n>=0&&n<2?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 հազար",1],"other":["0 հազար",1]}],[10000,{"one":["00 հազար",2],"other":["00 հազար",2]}],[100000,{"one":["000 հազար",3],"other":["000 հազար",3]}],[1000000,{"one":["0 միլիոն",1],"other":["0 միլիոն",1]}],[10000000,{"one":["00 միլիոն",2],"other":["00 միլիոն",2]}],[100000000,{"one":["000 միլիոն",3],"other":["000 միլիոն",3]}],[1000000000,{"one":["0 միլիարդ",1],"other":["0 միլիարդ",1]}],[10000000000,{"one":["00 միլիարդ",2],"other":["00 միլիարդ",2]}],[100000000000,{"one":["000 միլիարդ",3],"other":["000 միլիարդ",3]}],[1000000000000,{"one":["0 տրիլիոն",1],"other":["0 տրիլիոն",1]}],[10000000000000,{"one":["00 տրիլիոն",2],"other":["00 տրիլիոն",2]}],[100000000000000,{"one":["000 տրիլիոն",3],"other":["000 տրիլիոն",3]}]],"short":[[1000,{"one":["0 հզր",1],"other":["0 հզր",1]}],[10000,{"one":["00 հզր",2],"other":["00 հզր",2]}],[100000,{"one":["000 հզր",3],"other":["000 հզր",3]}],[1000000,{"one":["0 մլն",1],"other":["0 մլն",1]}],[10000000,{"one":["00 մլն",2],"other":["00 մլն",2]}],[100000000,{"one":["000 մլն",3],"other":["000 մլն",3]}],[1000000000,{"one":["0 մլրդ",1],"other":["0 մլրդ",1]}],[10000000000,{"one":["00 մլրդ",2],"other":["00 մլրդ",2]}],[100000000000,{"one":["000 մլրդ",3],"other":["000 մլրդ",3]}],[1000000000000,{"one":["0 տրլն",1],"other":["0 տրլն",1]}],[10000000000000,{"one":["00 տրլն",2],"other":["00 տրլն",2]}],[100000000000000,{"one":["000 տրլն",3],"other":["000 տրլն",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ia","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"id","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 ribu",1]}],[10000,{"other":["00 ribu",2]}],[100000,{"other":["000 ribu",3]}],[1000000,{"other":["0 juta",1]}],[10000000,{"other":["00 juta",2]}],[100000000,{"other":["000 juta",3]}],[1000000000,{"other":["0 miliar",1]}],[10000000000,{"other":["00 miliar",2]}],[100000000000,{"other":["000 miliar",3]}],[1000000000000,{"other":["0 triliun",1]}],[10000000000000,{"other":["00 triliun",2]}],[100000000000000,{"other":["000 triliun",3]}]],"short":[[1000,{"other":["0 rb",1]}],[10000,{"other":["00 rb",2]}],[100000,{"other":["000 rb",3]}],[1000000,{"other":["0 jt",1]}],[10000000,{"other":["00 jt",2]}],[100000000,{"other":["000 jt",3]}],[1000000000,{"other":["0 M",1]}],[10000000000,{"other":["00 M",2]}],[100000000000,{"other":["000 M",3]}],[1000000000000,{"other":["0 T",1]}],[10000000000000,{"other":["00 T",2]}],[100000000000000,{"other":["000 T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ig","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ii","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"in","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"io","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"is","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],t0=Number(s[0])==n,i10=i.slice(-1),i100=i.slice(-2);if(ord)return"other";return t0&&i10==1&&i100!=11||!t0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 þúsund",1],"other":["0 þúsund",1]}],[10000,{"one":["00 þúsund",2],"other":["00 þúsund",2]}],[100000,{"one":["000 þúsund",3],"other":["000 þúsund",3]}],[1000000,{"one":["0 milljón",1],"other":["0 milljónir",1]}],[10000000,{"one":["00 milljón",2],"other":["00 milljónir",2]}],[100000000,{"one":["000 milljón",3],"other":["000 milljónir",3]}],[1000000000,{"one":["0 milljarður",1],"other":["0 milljarðar",1]}],[10000000000,{"one":["00 milljarður",2],"other":["00 milljarðar",2]}],[100000000000,{"one":["000 milljarður",3],"other":["000 milljarðar",3]}],[1000000000000,{"one":["0 billjón",1],"other":["0 billjónir",1]}],[10000000000000,{"one":["00 billjón",2],"other":["00 billjónir",2]}],[100000000000000,{"one":["000 billjón",3],"other":["000 billjónir",3]}]],"short":[[1000,{"one":["0 þ'.'",1],"other":["0 þ'.'",1]}],[10000,{"one":["00 þ'.'",2],"other":["00 þ'.'",2]}],[100000,{"one":["000 þ'.'",3],"other":["000 þ'.'",3]}],[1000000,{"one":["0 m'.'",1],"other":["0 m'.'",1]}],[10000000,{"one":["00 m'.'",2],"other":["00 m'.'",2]}],[100000000,{"one":["000 m'.'",3],"other":["000 m'.'",3]}],[1000000000,{"one":["0 ma'.'",1],"other":["0 ma'.'",1]}],[10000000000,{"one":["00 ma'.'",2],"other":["00 ma'.'",2]}],[100000000000,{"one":["000 ma'.'",3],"other":["000 ma'.'",3]}],[1000000000000,{"one":["0 bn",1],"other":["0 bn",1]}],[10000000000000,{"one":["00 bn",2],"other":["00 bn",2]}],[100000000000000,{"one":["000 bn",3],"other":["000 bn",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"it","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?"many":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mille",1],"other":["0 mila",1]}],[10000,{"one":["00 mila",2],"other":["00 mila",2]}],[100000,{"one":["000 mila",3],"other":["000 mila",3]}],[1000000,{"one":["0 milione",1],"other":["0 milioni",1]}],[10000000,{"one":["00 milioni",2],"other":["00 milioni",2]}],[100000000,{"one":["000 milioni",3],"other":["000 milioni",3]}],[1000000000,{"one":["0 miliardo",1],"other":["0 miliardi",1]}],[10000000000,{"one":["00 miliardi",2],"other":["00 miliardi",2]}],[100000000000,{"one":["000 miliardi",3],"other":["000 miliardi",3]}],[1000000000000,{"one":["0 mille miliardi",1],"other":["0 mila miliardi",1]}],[10000000000000,{"one":["00 mila miliardi",2],"other":["00 mila miliardi",2]}],[100000000000000,{"one":["000 mila miliardi",3],"other":["000 mila miliardi",3]}]],"short":[[1000,{"one":["0",1],"other":["0",1]}],[10000,{"one":["0",1],"other":["0",1]}],[100000,{"one":["0",1],"other":["0",1]}],[1000000,{"one":["0 Mln",1],"other":["0 Mln",1]}],[10000000,{"one":["00 Mln",2],"other":["00 Mln",2]}],[100000000,{"one":["000 Mln",3],"other":["000 Mln",3]}],[1000000000,{"one":["0 Mrd",1],"other":["0 Mrd",1]}],[10000000000,{"one":["00 Mrd",2],"other":["00 Mrd",2]}],[100000000000,{"one":["000 Mrd",3],"other":["000 Mrd",3]}],[1000000000000,{"one":["0 Bln",1],"other":["0 Bln",1]}],[10000000000000,{"one":["00 Bln",2],"other":["00 Bln",2]}],[100000000000000,{"one":["000 Bln",3],"other":["000 Bln",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"it-CH","parentLocale":"it"});
IntlMessageFormat.__addLocaleData({"locale":"it-SM","parentLocale":"it"});
IntlMessageFormat.__addLocaleData({"locale":"it-VA","parentLocale":"it"});

IntlMessageFormat.__addLocaleData({"locale":"iu","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"iu-Latn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"iw","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return"other";return n==1&&v0?"one":i==2&&v0?"two":v0&&(n<0||n>10)&&t0&&n10==0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ja","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"jbo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"jgo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ji","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"jmc","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"jv","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"jw","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ka","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],i100=i.slice(-2);if(ord)return i==1?"one":i==0||(i100>=2&&i100<=20||i100==40||i100==60||i100==80)?"many":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ათასი",1],"other":["0 ათასი",1]}],[10000,{"one":["00 ათასი",2],"other":["00 ათასი",2]}],[100000,{"one":["000 ათასი",3],"other":["000 ათასი",3]}],[1000000,{"one":["0 მილიონი",1],"other":["0 მილიონი",1]}],[10000000,{"one":["00 მილიონი",2],"other":["00 მილიონი",2]}],[100000000,{"one":["000 მილიონი",3],"other":["000 მილიონი",3]}],[1000000000,{"one":["0 მილიარდი",1],"other":["0 მილიარდი",1]}],[10000000000,{"one":["00 მილიარდი",2],"other":["00 მილიარდი",2]}],[100000000000,{"one":["000 მილიარდი",3],"other":["000 მილიარდი",3]}],[1000000000000,{"one":["0 ტრილიონი",1],"other":["0 ტრილიონი",1]}],[10000000000000,{"one":["00 ტრილიონი",2],"other":["00 ტრილიონი",2]}],[100000000000000,{"one":["000 ტრილიონი",3],"other":["000 ტრილიონი",3]}]],"short":[[1000,{"one":["0 ათ'.'",1],"other":["0 ათ'.'",1]}],[10000,{"one":["00 ათ'.'",2],"other":["00 ათ'.'",2]}],[100000,{"one":["000 ათ'.'",3],"other":["000 ათ'.'",3]}],[1000000,{"one":["0 მლნ'.'",1],"other":["0 მლნ'.'",1]}],[10000000,{"one":["00 მლნ'.'",2],"other":["00 მლნ'.'",2]}],[100000000,{"one":["000 მლნ'.'",3],"other":["000 მლნ'.'",3]}],[1000000000,{"one":["0 მლრდ'.'",1],"other":["0 მლრდ'.'",1]}],[10000000000,{"one":["00 მლრდ'.'",2],"other":["00 მლრდ'.'",2]}],[100000000000,{"one":["000 მლრ'.'",3],"other":["000 მლრ'.'",3]}],[1000000000000,{"one":["0 ტრლ'.'",1],"other":["0 ტრლ'.'",1]}],[10000000000000,{"one":["00 ტრლ'.'",2],"other":["00 ტრლ'.'",2]}],[100000000000000,{"one":["000 ტრლ'.'",3],"other":["000 ტრლ'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kab","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<2?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kaj","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kam","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kcg","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kde","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kea","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 mil",1]}],[10000,{"other":["00 mil",2]}],[100000,{"other":["000 mil",3]}],[1000000,{"other":["0 milhãu",1]}],[10000000,{"other":["00 milhãu",2]}],[100000000,{"other":["000 milhãu",3]}],[1000000000,{"other":["0 mil milhãu",1]}],[10000000000,{"other":["00 mil milhãu",2]}],[100000000000,{"other":["000 mil milhãu",3]}],[1000000000000,{"other":["0 bilhãu",1]}],[10000000000000,{"other":["00 bilhãu",2]}],[100000000000000,{"other":["000 bilhãu",3]}]],"short":[[1000,{"other":["0 mil",1]}],[10000,{"other":["00 mil",2]}],[100000,{"other":["000 mil",3]}],[1000000,{"other":["0 M",1]}],[10000000,{"other":["00 M",2]}],[100000000,{"other":["000 M",3]}],[1000000000,{"other":["0 MM",1]}],[10000000000,{"other":["00 MM",2]}],[100000000000,{"other":["000 MM",3]}],[1000000000000,{"other":["0 Bi",1]}],[10000000000000,{"other":["00 Bi",2]}],[100000000000000,{"other":["000 Bi",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"khq","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ki","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kk","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return n10==6||n10==9||t0&&n10==0&&n!=0?"many":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 мың",1],"other":["0 мың",1]}],[10000,{"one":["00 мың",2],"other":["00 мың",2]}],[100000,{"one":["000 мың",3],"other":["000 мың",3]}],[1000000,{"one":["0 миллион",1],"other":["0 миллион",1]}],[10000000,{"one":["00 миллион",2],"other":["00 миллион",2]}],[100000000,{"one":["000 миллион",3],"other":["000 миллион",3]}],[1000000000,{"one":["0 миллиард",1],"other":["0 миллиард",1]}],[10000000000,{"one":["00 миллиард",2],"other":["00 миллиард",2]}],[100000000000,{"one":["000 миллиард",3],"other":["000 миллиард",3]}],[1000000000000,{"one":["0 триллион",1],"other":["0 триллион",1]}],[10000000000000,{"one":["00 триллион",2],"other":["00 триллион",2]}],[100000000000000,{"one":["000 триллион",3],"other":["000 триллион",3]}]],"short":[[1000,{"one":["0 мың",1],"other":["0 мың",1]}],[10000,{"one":["00 мың",2],"other":["00 мың",2]}],[100000,{"one":["000 м'.'",3],"other":["000 м'.'",3]}],[1000000,{"one":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kkj","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kl","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kln","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"km","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 ពាន់",1]}],[10000,{"other":["00 ពាន់",2]}],[100000,{"other":["000ពាន់",3]}],[1000000,{"other":["0 លាន",1]}],[10000000,{"other":["00 លាន",2]}],[100000000,{"other":["000 លាន",3]}],[1000000000,{"other":["0 ប៊ីលាន",1]}],[10000000000,{"other":["00 ប៊ីលាន",2]}],[100000000000,{"other":["000 ប៊ីលាន",3]}],[1000000000000,{"other":["0 ទ្រីលាន",1]}],[10000000000000,{"other":["00 ទ្រីលាន",2]}],[100000000000000,{"other":["000 ទ្រីលាន",3]}]],"short":[[1000,{"other":["0ពាន់",1]}],[10000,{"other":["00 ពាន់",2]}],[100000,{"other":["000 ពាន់",3]}],[1000000,{"other":["0 លាន",1]}],[10000000,{"other":["00 លាន",2]}],[100000000,{"other":["000 លាន",3]}],[1000000000,{"other":["0 ប៊ីលាន",1]}],[10000000000,{"other":["00 ប៊ីលាន",2]}],[100000000000,{"other":["000 ប៊ីលាន",3]}],[1000000000000,{"other":["0 ទ្រីលាន",1]}],[10000000000000,{"other":["00 ទ្រីលាន",2]}],[100000000000000,{"other":["000 ទ្រីលាន",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ಸಾವಿರ",1],"other":["0 ಸಾವಿರ",1]}],[10000,{"one":["00 ಸಾವಿರ",2],"other":["00 ಸಾವಿರ",2]}],[100000,{"one":["000 ಸಾವಿರ",3],"other":["000 ಸಾವಿರ",3]}],[1000000,{"one":["0 ಮಿಲಿಯನ್",1],"other":["0 ಮಿಲಿಯನ್",1]}],[10000000,{"one":["00 ಮಿಲಿಯನ್",2],"other":["00 ಮಿಲಿಯನ್",2]}],[100000000,{"one":["000 ಮಿಲಿಯನ್",3],"other":["000 ಮಿಲಿಯನ್",3]}],[1000000000,{"one":["0 ಬಿಲಿಯನ್",1],"other":["0 ಬಿಲಿಯನ್",1]}],[10000000000,{"one":["00 ಬಿಲಿಯನ್",2],"other":["00 ಬಿಲಿಯನ್",2]}],[100000000000,{"one":["000 ಬಿಲಿಯನ್",3],"other":["000 ಬಿಲಿಯನ್",3]}],[1000000000000,{"one":["0 ಟ್ರಿಲಿಯನ್‌",1],"other":["0 ಟ್ರಿಲಿಯನ್‌",1]}],[10000000000000,{"one":["00 ಟ್ರಿಲಿಯನ್‌",2],"other":["00 ಟ್ರಿಲಿಯನ್‌",2]}],[100000000000000,{"one":["000 ಟ್ರಿಲಿಯನ್‌",3],"other":["000 ಟ್ರಿಲಿಯನ್‌",3]}]],"short":[[1000,{"one":["0ಸಾ",1],"other":["0ಸಾ",1]}],[10000,{"one":["00ಸಾ",2],"other":["00ಸಾ",2]}],[100000,{"one":["000ಸಾ",3],"other":["000ಸಾ",3]}],[1000000,{"one":["0ಮಿ",1],"other":["0ಮಿ",1]}],[10000000,{"one":["00ಮಿ",2],"other":["00ಮಿ",2]}],[100000000,{"one":["000ಮಿ",3],"other":["000ಮಿ",3]}],[1000000000,{"one":["0ಬಿ",1],"other":["0ಬಿ",1]}],[10000000000,{"one":["00ಬಿ",2],"other":["00ಬಿ",2]}],[100000000000,{"one":["000ಬಿ",3],"other":["000ಬಿ",3]}],[1000000000000,{"one":["0ಟ್ರಿ",1],"other":["0ಟ್ರಿ",1]}],[10000000000000,{"one":["00ಟ್ರಿ",2],"other":["00ಟ್ರಿ",2]}],[100000000000000,{"one":["000ಟ್ರಿ",3],"other":["000ಟ್ರಿ",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ko","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0천",1]}],[10000,{"other":["0만",1]}],[100000,{"other":["00만",2]}],[1000000,{"other":["000만",3]}],[10000000,{"other":["0000만",4]}],[100000000,{"other":["0억",1]}],[1000000000,{"other":["00억",2]}],[10000000000,{"other":["000억",3]}],[100000000000,{"other":["0000억",4]}],[1000000000000,{"other":["0조",1]}],[10000000000000,{"other":["00조",2]}],[100000000000000,{"other":["000조",3]}]],"short":[[1000,{"other":["0천",1]}],[10000,{"other":["0만",1]}],[100000,{"other":["00만",2]}],[1000000,{"other":["000만",3]}],[10000000,{"other":["0000만",4]}],[100000000,{"other":["0억",1]}],[1000000000,{"other":["00억",2]}],[10000000000,{"other":["000억",3]}],[100000000000,{"other":["0000억",4]}],[1000000000000,{"other":["0조",1]}],[10000000000000,{"other":["00조",2]}],[100000000000000,{"other":["000조",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ko-KP","parentLocale":"ko"});

IntlMessageFormat.__addLocaleData({"locale":"kok","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ks","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ksb","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ksf","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ksh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0?"zero":n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"zero":["0 Dousend",1],"one":["0 Dousend",1],"other":["0 Dousend",1]}],[10000,{"zero":["00 Dousend",2],"one":["00 Dousend",2],"other":["00 Dousend",2]}],[100000,{"zero":["000 Dousend",3],"one":["000 Dousend",3],"other":["000 Dousend",3]}],[1000000,{"zero":["0 Milljuhne",1],"one":["0 Million",1],"other":["0 Milljuhne",1]}],[10000000,{"zero":["00 Milljuhne",2],"one":["00 Milljuhne",2],"other":["00 Millionen",2]}],[100000000,{"zero":["000 Milljuhne",3],"one":["000 Milljuhne",3],"other":["000 Millionen",3]}],[1000000000,{"zero":["0 Milljard",1],"one":["0 Milliarde",1],"other":["0 Milljarde",1]}],[10000000000,{"zero":["00 Milljarde",2],"one":["00 Milljarde",2],"other":["00 Milliarden",2]}],[100000000000,{"zero":["000 Milljarde",3],"one":["000 Milliarde",3],"other":["000 Milliarden",3]}],[1000000000000,{"zero":["0 Billjuhn",1],"one":["0 Billjuhn",1],"other":["0 Billjuhn",1]}],[10000000000000,{"zero":["00 Billjuhn",2],"one":["00 Billion",2],"other":["00 Billionen",2]}],[100000000000000,{"zero":["000 Billjuhn",3],"one":["000 Billion",3],"other":["000 Billionen",3]}]],"short":[[1000,{"zero":["0 tsd",1],"one":["0 tsd",1],"other":["0 tsd",1]}],[10000,{"zero":["00 tsd",2],"one":["00 tsd",2],"other":["00 tsd",2]}],[100000,{"zero":["000 tsd",3],"one":["000 tsd",3],"other":["000 tsd",3]}],[1000000,{"zero":["0 Mio",1],"one":["0 Mio",1],"other":["0 Mio",1]}],[10000000,{"zero":["00 Mio",2],"one":["00 Mio",2],"other":["00 Mio",2]}],[100000000,{"zero":["000 Mio",3],"one":["000 Mio",3],"other":["000 Mio",3]}],[1000000000,{"zero":["0 Mrd",1],"one":["0 Mrd",1],"other":["0 Mrd",1]}],[10000000000,{"zero":["00 Mrd",2],"one":["00 Mrd",2],"other":["00 Mrd",2]}],[100000000000,{"zero":["000 Mrd",3],"one":["000 Mrd",3],"other":["000 Mrd",3]}],[1000000000000,{"zero":["0 Bio",1],"one":["0 Bio",1],"other":["0 Bio",1]}],[10000000000000,{"zero":["00 Bio",2],"one":["00 Bio",2],"other":["00 Bio",2]}],[100000000000000,{"zero":["000 Bio",3],"one":["000 Bio",3],"other":["000 Bio",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ku","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"kw","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ky","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 миң",1],"other":["0 миң",1]}],[10000,{"one":["00 миң",2],"other":["00 миң",2]}],[100000,{"one":["000 миң",3],"other":["000 миң",3]}],[1000000,{"one":["0 миллион",1],"other":["0 миллион",1]}],[10000000,{"one":["00 миллион",2],"other":["00 миллион",2]}],[100000000,{"one":["000 миллион",3],"other":["000 миллион",3]}],[1000000000,{"one":["0 миллиард",1],"other":["0 миллиард",1]}],[10000000000,{"one":["00 миллиард",2],"other":["00 миллиард",2]}],[100000000000,{"one":["000 миллиард",3],"other":["000 миллиард",3]}],[1000000000000,{"one":["0 триллион",1],"other":["0 триллион",1]}],[10000000000000,{"one":["00 триллион",2],"other":["00 триллион",2]}],[100000000000000,{"one":["000 триллион",3],"other":["000 триллион",3]}]],"short":[[1000,{"one":["0 миң",1],"other":["0 миң",1]}],[10000,{"one":["00 миң",2],"other":["00 миң",2]}],[100000,{"one":["000 миң",3],"other":["000 миң",3]}],[1000000,{"one":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млд",1],"other":["0 млд",1]}],[10000000000,{"one":["00 млд",2],"other":["00 млд",2]}],[100000000000,{"one":["000 млд",3],"other":["000 млд",3]}],[1000000000000,{"one":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lag","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0];if(ord)return"other";return n==0?"zero":(i==0||i==1)&&n!=0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lb","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 Dausend",1],"other":["0 Dausend",1]}],[10000,{"one":["00 Dausend",2],"other":["00 Dausend",2]}],[100000,{"one":["000 Dausend",3],"other":["000 Dausend",3]}],[1000000,{"one":["0 Millioun",1],"other":["0 Milliounen",1]}],[10000000,{"one":["00 Milliounen",2],"other":["00 Milliounen",2]}],[100000000,{"one":["000 Milliounen",3],"other":["000 Milliounen",3]}],[1000000000,{"one":["0 Milliard",1],"other":["0 Milliarden",1]}],[10000000000,{"one":["00 Milliarden",2],"other":["00 Milliarden",2]}],[100000000000,{"one":["000 Milliarden",3],"other":["000 Milliarden",3]}],[1000000000000,{"one":["0 Billioun",1],"other":["0 Billiounen",1]}],[10000000000000,{"one":["00 Billiounen",2],"other":["00 Billiounen",2]}],[100000000000000,{"one":["000 Billiounen",3],"other":["000 Billiounen",3]}]],"short":[[1000,{"one":["0 Dsd'.'",1],"other":["0 Dsd'.'",1]}],[10000,{"one":["00 Dsd'.'",2],"other":["00 Dsd'.'",2]}],[100000,{"one":["000 Dsd'.'",3],"other":["000 Dsd'.'",3]}],[1000000,{"one":["0 Mio'.'",1],"other":["0 Mio'.'",1]}],[10000000,{"one":["00 Mio'.'",2],"other":["00 Mio'.'",2]}],[100000000,{"one":["000 Mio'.'",3],"other":["000 Mio'.'",3]}],[1000000000,{"one":["0 Mrd'.'",1],"other":["0 Mrd'.'",1]}],[10000000000,{"one":["00 Mrd'.'",2],"other":["00 Mrd'.'",2]}],[100000000000,{"one":["000 Mrd'.'",3],"other":["000 Mrd'.'",3]}],[1000000000000,{"one":["0 Bio'.'",1],"other":["0 Bio'.'",1]}],[10000000000000,{"one":["00 Bio'.'",2],"other":["00 Bio'.'",2]}],[100000000000000,{"one":["000 Bio'.'",3],"other":["000 Bio'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lg","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lkt","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ln","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ln-AO","parentLocale":"ln"});
IntlMessageFormat.__addLocaleData({"locale":"ln-CF","parentLocale":"ln"});
IntlMessageFormat.__addLocaleData({"locale":"ln-CG","parentLocale":"ln"});

IntlMessageFormat.__addLocaleData({"locale":"lo","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 ພັນ",1]}],[10000,{"other":["00 ພັນ",2]}],[100000,{"other":["0 ແສນ",1]}],[1000000,{"other":["0 ລ້ານ",1]}],[10000000,{"other":["00 ລ້ານ",2]}],[100000000,{"other":["000 ລ້ານ",3]}],[1000000000,{"other":["0 ຕື້",1]}],[10000000000,{"other":["00 ຕື້",2]}],[100000000000,{"other":["000 ຕື້",3]}],[1000000000000,{"other":["0 ລ້ານລ້ານ",1]}],[10000000000000,{"other":["00 ລ້ານລ້ານ",2]}],[100000000000000,{"other":["000 ລ້ານລ້ານ",3]}]],"short":[[1000,{"other":["0 ພັນ",1]}],[10000,{"other":["00 ພັນ",2]}],[100000,{"other":["000 ກີບ",3]}],[1000000,{"other":["0 ລ້ານ",1]}],[10000000,{"other":["00 ລ້ານ",2]}],[100000000,{"other":["000 ລ້ານ",3]}],[1000000000,{"other":["0 ຕື້",1]}],[10000000000,{"other":["00 ຕື້",2]}],[100000000000,{"other":["000 ຕື້",3]}],[1000000000000,{"other":["0 ລ້ານລ້ານ",1]}],[10000000000000,{"other":["00ລລ",2]}],[100000000000000,{"other":["000ລລ",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lrc","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"lrc-IQ","parentLocale":"lrc"});

IntlMessageFormat.__addLocaleData({"locale":"lt","pluralRuleFunction":function (n,ord){var s=String(n).split("."),f=s[1]||"",t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return"other";return n10==1&&(n100<11||n100>19)?"one":n10>=2&&n10<=9&&(n100<11||n100>19)?"few":f!=0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tūkstantis",1],"few":["0 tūkstančiai",1],"many":["0 tūkstančio",1],"other":["0 tūkstančių",1]}],[10000,{"one":["00 tūkstantis",2],"few":["00 tūkstančiai",2],"many":["00 tūkstančio",2],"other":["00 tūkstančių",2]}],[100000,{"one":["000 tūkstantis",3],"few":["000 tūkstančiai",3],"many":["000 tūkstančio",3],"other":["000 tūkstančių",3]}],[1000000,{"one":["0 milijonas",1],"few":["0 milijonai",1],"many":["0 milijono",1],"other":["0 milijonų",1]}],[10000000,{"one":["00 milijonas",2],"few":["00 milijonai",2],"many":["00 milijono",2],"other":["00 milijonų",2]}],[100000000,{"one":["000 milijonas",3],"few":["000 milijonai",3],"many":["000 milijono",3],"other":["000 milijonų",3]}],[1000000000,{"one":["0 milijardas",1],"few":["0 milijardai",1],"many":["0 milijardo",1],"other":["0 milijardų",1]}],[10000000000,{"one":["00 milijardas",2],"few":["00 milijardai",2],"many":["00 milijardo",2],"other":["00 milijardų",2]}],[100000000000,{"one":["000 milijardas",3],"few":["000 milijardai",3],"many":["000 milijardo",3],"other":["000 milijardų",3]}],[1000000000000,{"one":["0 trilijonas",1],"few":["0 trilijonai",1],"many":["0 trilijono",1],"other":["0 trilijonų",1]}],[10000000000000,{"one":["00 trilijonas",2],"few":["00 trilijonai",2],"many":["00 trilijono",2],"other":["00 trilijonų",2]}],[100000000000000,{"one":["000 trilijonas",3],"few":["000 trilijonai",3],"many":["000 trilijono",3],"other":["000 trilijonų",3]}]],"short":[[1000,{"one":["0 tūkst'.'",1],"few":["0 tūkst'.'",1],"many":["0 tūkst'.'",1],"other":["0 tūkst'.'",1]}],[10000,{"one":["00 tūkst'.'",2],"few":["00 tūkst'.'",2],"many":["00 tūkst'.'",2],"other":["00 tūkst'.'",2]}],[100000,{"one":["000 tūkst'.'",3],"few":["000 tūkst'.'",3],"many":["000 tūkst'.'",3],"other":["000 tūkst'.'",3]}],[1000000,{"one":["0 mln'.'",1],"few":["0 mln'.'",1],"many":["0 mln'.'",1],"other":["0 mln'.'",1]}],[10000000,{"one":["00 mln'.'",2],"few":["00 mln'.'",2],"many":["00 mln'.'",2],"other":["00 mln'.'",2]}],[100000000,{"one":["000 mln'.'",3],"few":["000 mln'.'",3],"many":["000 mln'.'",3],"other":["000 mln'.'",3]}],[1000000000,{"one":["0 mlrd'.'",1],"few":["0 mlrd'.'",1],"many":["0 mlrd'.'",1],"other":["0 mlrd'.'",1]}],[10000000000,{"one":["00 mlrd'.'",2],"few":["00 mlrd'.'",2],"many":["00 mlrd'.'",2],"other":["00 mlrd'.'",2]}],[100000000000,{"one":["000 mlrd'.'",3],"few":["000 mlrd'.'",3],"many":["000 mlrd'.'",3],"other":["000 mlrd'.'",3]}],[1000000000000,{"one":["0 trln'.'",1],"few":["0 trln'.'",1],"many":["0 trln'.'",1],"other":["0 trln'.'",1]}],[10000000000000,{"one":["00 trln'.'",2],"few":["00 trln'.'",2],"many":["00 trln'.'",2],"other":["00 trln'.'",2]}],[100000000000000,{"one":["000 trln'.'",3],"few":["000 trln'.'",3],"many":["000 trln'.'",3],"other":["000 trln'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lu","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"luo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"luy","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"lv","pluralRuleFunction":function (n,ord){var s=String(n).split("."),f=s[1]||"",v=f.length,t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),f100=f.slice(-2),f10=f.slice(-1);if(ord)return"other";return t0&&n10==0||n100>=11&&n100<=19||v==2&&(f100>=11&&f100<=19)?"zero":n10==1&&n100!=11||v==2&&f10==1&&f100!=11||v!=2&&f10==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"zero":["0 tūkstošu",1],"one":["0 tūkstotis",1],"other":["0 tūkstoši",1]}],[10000,{"zero":["00 tūkstoši",2],"one":["00 tūkstotis",2],"other":["00 tūkstoši",2]}],[100000,{"zero":["000 tūkstoši",3],"one":["000 tūkstotis",3],"other":["000 tūkstoši",3]}],[1000000,{"zero":["0 miljonu",1],"one":["0 miljons",1],"other":["0 miljoni",1]}],[10000000,{"zero":["00 miljoni",2],"one":["00 miljons",2],"other":["00 miljoni",2]}],[100000000,{"zero":["000 miljoni",3],"one":["000 miljons",3],"other":["000 miljoni",3]}],[1000000000,{"zero":["0 miljardu",1],"one":["0 miljards",1],"other":["0 miljardi",1]}],[10000000000,{"zero":["00 miljardi",2],"one":["00 miljards",2],"other":["00 miljardi",2]}],[100000000000,{"zero":["000 miljardi",3],"one":["000 miljards",3],"other":["000 miljardi",3]}],[1000000000000,{"zero":["0 triljonu",1],"one":["0 triljons",1],"other":["0 triljoni",1]}],[10000000000000,{"zero":["00 triljoni",2],"one":["00 triljons",2],"other":["00 triljoni",2]}],[100000000000000,{"zero":["000 triljoni",3],"one":["000 triljons",3],"other":["000 triljoni",3]}]],"short":[[1000,{"zero":["0 tūkst'.'",1],"one":["0 tūkst'.'",1],"other":["0 tūkst'.'",1]}],[10000,{"zero":["00 tūkst'.'",2],"one":["00 tūkst'.'",2],"other":["00 tūkst'.'",2]}],[100000,{"zero":["000 tūkst'.'",3],"one":["000 tūkst'.'",3],"other":["000 tūkst'.'",3]}],[1000000,{"zero":["0 milj'.'",1],"one":["0 milj'.'",1],"other":["0 milj'.'",1]}],[10000000,{"zero":["00 milj'.'",2],"one":["00 milj'.'",2],"other":["00 milj'.'",2]}],[100000000,{"zero":["000 milj'.'",3],"one":["000 milj'.'",3],"other":["000 milj'.'",3]}],[1000000000,{"zero":["0 mljrd'.'",1],"one":["0 mljrd'.'",1],"other":["0 mljrd'.'",1]}],[10000000000,{"zero":["00 mljrd'.'",2],"one":["00 mljrd'.'",2],"other":["00 mljrd'.'",2]}],[100000000000,{"zero":["000 mljrd'.'",3],"one":["000 mljrd'.'",3],"other":["000 mljrd'.'",3]}],[1000000000000,{"zero":["0 trilj'.'",1],"one":["0 trilj'.'",1],"other":["0 trilj'.'",1]}],[10000000000000,{"zero":["00 trilj'.'",2],"one":["00 trilj'.'",2],"other":["00 trilj'.'",2]}],[100000000000000,{"zero":["000 trilj'.'",3],"one":["000 trilj'.'",3],"other":["000 trilj'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mas","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"mas-TZ","parentLocale":"mas"});

IntlMessageFormat.__addLocaleData({"locale":"mer","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mfe","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mg","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mgh","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mgo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mi","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mk","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return i10==1&&i100!=11?"one":i10==2&&i100!=12?"two":(i10==7||i10==8)&&i100!=17&&i100!=18?"many":"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 илјада",1],"other":["0 илјади",1]}],[10000,{"one":["00 илјада",2],"other":["00 илјади",2]}],[100000,{"one":["000 илјада",3],"other":["000 илјади",3]}],[1000000,{"one":["0 милион",1],"other":["0 милиони",1]}],[10000000,{"one":["00 милион",2],"other":["00 милиони",2]}],[100000000,{"one":["000 милион",3],"other":["000 милиони",3]}],[1000000000,{"one":["0 милијарда",1],"other":["0 милијарди",1]}],[10000000000,{"one":["00 милијарда",2],"other":["00 милијарди",2]}],[100000000000,{"one":["000 милијарда",3],"other":["000 милијарди",3]}],[1000000000000,{"one":["0 билион",1],"other":["0 билиони",1]}],[10000000000000,{"one":["00 билион",2],"other":["00 билиони",2]}],[100000000000000,{"one":["000 билион",3],"other":["000 билиони",3]}]],"short":[[1000,{"one":["0 илј'.'",1],"other":["0 илј'.'",1]}],[10000,{"one":["00 илј'.'",2],"other":["00 илј'.'",2]}],[100000,{"one":["000 илј'.'",3],"other":["000 илј'.'",3]}],[1000000,{"one":["0 мил'.'",1],"other":["0 мил'.'",1]}],[10000000,{"one":["00 мил'.'",2],"other":["00 мил'.'",2]}],[100000000,{"one":["000 М",3],"other":["000 М",3]}],[1000000000,{"one":["0 милј'.'",1],"other":["0 милј'.'",1]}],[10000000000,{"one":["00 милј'.'",2],"other":["00 милј'.'",2]}],[100000000000,{"one":["000 мј'.'",3],"other":["000 ми'.'",3]}],[1000000000000,{"one":["0 бил'.'",1],"other":["0 бил'.'",1]}],[10000000000000,{"one":["00 бил'.'",2],"other":["00 бил'.'",2]}],[100000000000000,{"one":["000 бил'.'",3],"other":["000 бил'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ml","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ആയിരം",1],"other":["0 ആയിരം",1]}],[10000,{"one":["00 ആയിരം",2],"other":["00 ആയിരം",2]}],[100000,{"one":["000 ആയിരം",3],"other":["000 ആയിരം",3]}],[1000000,{"one":["0 ദശലക്ഷം",1],"other":["0 ദശലക്ഷം",1]}],[10000000,{"one":["00 ദശലക്ഷം",2],"other":["00 ദശലക്ഷം",2]}],[100000000,{"one":["000 ദശലക്ഷം",3],"other":["000 ദശലക്ഷം",3]}],[1000000000,{"one":["0 ലക്ഷം കോടി",1],"other":["0 ലക്ഷം കോടി",1]}],[10000000000,{"one":["00 ലക്ഷം കോടി",2],"other":["00 ലക്ഷം കോടി",2]}],[100000000000,{"one":["000 ലക്ഷം കോടി",3],"other":["000 ലക്ഷം കോടി",3]}],[1000000000000,{"one":["0 ട്രില്യൺ",1],"other":["0 ട്രില്യൺ",1]}],[10000000000000,{"one":["00 ട്രില്യൺ",2],"other":["00 ട്രില്യൺ",2]}],[100000000000000,{"one":["000 ട്രില്യൺ",3],"other":["000 ട്രില്യൺ",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 мянга",1],"other":["0 мянга",1]}],[10000,{"one":["00 мянга",2],"other":["00 мянга",2]}],[100000,{"one":["000 мянга",3],"other":["000 мянга",3]}],[1000000,{"one":["0 сая",1],"other":["0 сая",1]}],[10000000,{"one":["00 сая",2],"other":["00 сая",2]}],[100000000,{"one":["000 сая",3],"other":["000 сая",3]}],[1000000000,{"one":["0 тэрбум",1],"other":["0 тэрбум",1]}],[10000000000,{"one":["00 тэрбум",2],"other":["00 тэрбум",2]}],[100000000000,{"one":["000 тэрбум",3],"other":["000 тэрбум",3]}],[1000000000000,{"one":["0 их наяд",1],"other":["0 их наяд",1]}],[10000000000000,{"one":["00 их наяд",2],"other":["00 их наяд",2]}],[100000000000000,{"one":["000 их наяд",3],"other":["000 их наяд",3]}]],"short":[[1000,{"one":["0 мянга",1],"other":["0 мянга",1]}],[10000,{"one":["00 мянга",2],"other":["00 мянга",2]}],[100000,{"one":["000 мянга",3],"other":["000 мянга",3]}],[1000000,{"one":["0 сая",1],"other":["0 сая",1]}],[10000000,{"one":["00 сая",2],"other":["00 сая",2]}],[100000000,{"one":["000 сая",3],"other":["000 сая",3]}],[1000000000,{"one":["0 тэрбум",1],"other":["0 тэрбум",1]}],[10000000000,{"one":["00 тэрбум",2],"other":["00 тэрбум",2]}],[100000000000,{"one":["000Т",3],"other":["000Т",3]}],[1000000000000,{"one":["0ИН",1],"other":["0ИН",1]}],[10000000000000,{"one":["00ИН",2],"other":["00ИН",2]}],[100000000000000,{"one":["000ИН",3],"other":["000ИН",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"mn-Mong","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mo","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return n==1?"one":"other";return n==1&&v0?"one":!v0||n==0||n!=1&&(n100>=1&&n100<=19)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mr","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":n==2||n==3?"two":n==4?"few":"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 हजार",1],"other":["0 हजार",1]}],[10000,{"one":["00 हजार",2],"other":["00 हजार",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["00 लाख",2],"other":["00 लाख",2]}],[10000000,{"one":["0 कोटी",1],"other":["0 कोटी",1]}],[100000000,{"one":["00 कोटी",2],"other":["00 कोटी",2]}],[1000000000,{"one":["0 अब्ज",1],"other":["0 अब्ज",1]}],[10000000000,{"one":["00 अब्ज",2],"other":["00 अब्ज",2]}],[100000000000,{"one":["0 खर्व",1],"other":["0 खर्व",1]}],[1000000000000,{"one":["00 खर्व",2],"other":["00 खर्व",2]}],[10000000000000,{"one":["0 पद्म",1],"other":["0 पद्म",1]}],[100000000000000,{"one":["00 पद्म",2],"other":["00 पद्म",2]}]],"short":[[1000,{"one":["0 ह",1],"other":["0 ह",1]}],[10000,{"one":["00 ह",2],"other":["00 ह",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["00 लाख",2],"other":["00 लाख",2]}],[10000000,{"one":["0 कोटी",1],"other":["0 कोटी",1]}],[100000000,{"one":["00 कोटी",2],"other":["00 कोटी",2]}],[1000000000,{"one":["0 अब्ज",1],"other":["0 अब्ज",1]}],[10000000000,{"one":["00 अब्ज",2],"other":["00 अब्ज",2]}],[100000000000,{"one":["0 खर्व",1],"other":["0 खर्व",1]}],[1000000000000,{"one":["00 खर्व",2],"other":["00 खर्व",2]}],[10000000000000,{"one":["0 पद्म",1],"other":["0 पद्म",1]}],[100000000000000,{"one":["00 पद्म",2],"other":["00 पद्म",2]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ms","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 ribu",1]}],[10000,{"other":["00 ribu",2]}],[100000,{"other":["000 ribu",3]}],[1000000,{"other":["0 juta",1]}],[10000000,{"other":["00 juta",2]}],[100000000,{"other":["000 juta",3]}],[1000000000,{"other":["0 bilion",1]}],[10000000000,{"other":["00 bilion",2]}],[100000000000,{"other":["000 bilion",3]}],[1000000000000,{"other":["0 trilion",1]}],[10000000000000,{"other":["00 trilion",2]}],[100000000000000,{"other":["000 trilion",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0J",1]}],[10000000,{"other":["00J",2]}],[100000000,{"other":["000J",3]}],[1000000000,{"other":["0B",1]}],[10000000000,{"other":["00B",2]}],[100000000000,{"other":["000B",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ms-Arab","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ms-BN","parentLocale":"ms"});
IntlMessageFormat.__addLocaleData({"locale":"ms-SG","parentLocale":"ms"});

IntlMessageFormat.__addLocaleData({"locale":"mt","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return"other";return n==1?"one":n==0||n100>=2&&n100<=10?"few":n100>=11&&n100<=19?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mua","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"my","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0ထောင်",1]}],[10000,{"other":["0သောင်း",1]}],[100000,{"other":["0သိန်း",1]}],[1000000,{"other":["0သန်း",1]}],[10000000,{"other":["0ကုဋေ",1]}],[100000000,{"other":["00ကုဋေ",2]}],[1000000000,{"other":["ကုဋေ000",3]}],[10000000000,{"other":["ကုဋေ0000",4]}],[100000000000,{"other":["ကုဋေ0သောင်း",1]}],[1000000000000,{"other":["ကုဋေ0သိန်း",1]}],[10000000000000,{"other":["ကုဋေ0သန်း",1]}],[100000000000000,{"other":["0ကောဋိ",1]}]],"short":[[1000,{"other":["0ထောင်",1]}],[10000,{"other":["0သောင်း",1]}],[100000,{"other":["0သိန်း",1]}],[1000000,{"other":["0သန်း",1]}],[10000000,{"other":["0ကုဋေ",1]}],[100000000,{"other":["00ကုဋေ",2]}],[1000000000,{"other":["ကုဋေ000",3]}],[10000000000,{"other":["ကုဋေ0ထ",1]}],[100000000000,{"other":["ကုဋေ0သ",1]}],[1000000000000,{"other":["ဋေ0သိန်း",1]}],[10000000000000,{"other":["ဋေ0သန်း",1]}],[100000000000000,{"other":["0ကောဋိ",1]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"mzn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nah","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"naq","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nb","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tusen",1],"other":["0 tusen",1]}],[10000,{"one":["00 tusen",2],"other":["00 tusen",2]}],[100000,{"one":["000 tusen",3],"other":["000 tusen",3]}],[1000000,{"one":["0 million",1],"other":["0 millioner",1]}],[10000000,{"one":["00 million",2],"other":["00 millioner",2]}],[100000000,{"one":["000 million",3],"other":["000 millioner",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliarder",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliarder",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliarder",3]}],[1000000000000,{"one":["0 billion",1],"other":["0 billioner",1]}],[10000000000000,{"one":["00 billioner",2],"other":["00 billioner",2]}],[100000000000000,{"one":["000 billioner",3],"other":["000 billioner",3]}]],"short":[[1000,{"one":["0k",1],"other":["0k",1]}],[10000,{"one":["00k",2],"other":["00k",2]}],[100000,{"one":["000k",3],"other":["000k",3]}],[1000000,{"one":["0 mill'.'",1],"other":["0 mill'.'",1]}],[10000000,{"one":["00 mill'.'",2],"other":["00 mill'.'",2]}],[100000000,{"one":["000 mill'.'",3],"other":["000 mill'.'",3]}],[1000000000,{"one":["0 mrd'.'",1],"other":["0 mrd'.'",1]}],[10000000000,{"one":["00 mrd'.'",2],"other":["00 mrd'.'",2]}],[100000000000,{"one":["000 mrd'.'",3],"other":["000 mrd'.'",3]}],[1000000000000,{"one":["0 bill'.'",1],"other":["0 bill'.'",1]}],[10000000000000,{"one":["00 bill'.'",2],"other":["00 bill'.'",2]}],[100000000000000,{"one":["000 bill'.'",3],"other":["000 bill'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"nb-SJ","parentLocale":"nb"});

IntlMessageFormat.__addLocaleData({"locale":"nd","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nds","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"nds-NL","parentLocale":"nds"});

IntlMessageFormat.__addLocaleData({"locale":"ne","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return t0&&n>=1&&n<=4?"one":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 हजार",1],"other":["0 हजार",1]}],[10000,{"one":["00 हजार",2],"other":["00 हजार",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["0 करोड",1],"other":["0 करोड",1]}],[10000000,{"one":["00 करोड",2],"other":["00 करोड",2]}],[100000000,{"one":["000 करोड",3],"other":["000 करोड",3]}],[1000000000,{"one":["0 अरब",1],"other":["0 अरब",1]}],[10000000000,{"one":["00 अरब",2],"other":["00 अरब",2]}],[100000000000,{"one":["000 अरब",3],"other":["000 अरब",3]}],[1000000000000,{"one":["00 खरब",2],"other":["00 खरब",2]}],[10000000000000,{"one":["0 शंख",1],"other":["0 शंख",1]}],[100000000000000,{"one":["00 शंख",2],"other":["00 शंख",2]}]],"short":[[1000,{"one":["0 हजार",1],"other":["0 हजार",1]}],[10000,{"one":["00 हजार",2],"other":["00 हजार",2]}],[100000,{"one":["0 लाख",1],"other":["0 लाख",1]}],[1000000,{"one":["00 लाख",2],"other":["00 लाख",2]}],[10000000,{"one":["0 करोड",1],"other":["0 करोड",1]}],[100000000,{"one":["00 करोड",2],"other":["00 करोड",2]}],[1000000000,{"one":["0 अरब",1],"other":["0 अरब",1]}],[10000000000,{"one":["00 अरब",2],"other":["00 अरब",2]}],[100000000000,{"one":["0 खरब",1],"other":["0 खरब",1]}],[1000000000000,{"one":["00 खरब",2],"other":["00 खरब",2]}],[10000000000000,{"one":["0 शंख",1],"other":["0 शंख",1]}],[100000000000000,{"one":["00 शंख",2],"other":["00 शंख",2]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ne-IN","parentLocale":"ne"});

IntlMessageFormat.__addLocaleData({"locale":"nl","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 duizend",1],"other":["0 duizend",1]}],[10000,{"one":["00 duizend",2],"other":["00 duizend",2]}],[100000,{"one":["000 duizend",3],"other":["000 duizend",3]}],[1000000,{"one":["0 miljoen",1],"other":["0 miljoen",1]}],[10000000,{"one":["00 miljoen",2],"other":["00 miljoen",2]}],[100000000,{"one":["000 miljoen",3],"other":["000 miljoen",3]}],[1000000000,{"one":["0 miljard",1],"other":["0 miljard",1]}],[10000000000,{"one":["00 miljard",2],"other":["00 miljard",2]}],[100000000000,{"one":["000 miljard",3],"other":["000 miljard",3]}],[1000000000000,{"one":["0 biljoen",1],"other":["0 biljoen",1]}],[10000000000000,{"one":["00 biljoen",2],"other":["00 biljoen",2]}],[100000000000000,{"one":["000 biljoen",3],"other":["000 biljoen",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0 mln'.'",1],"other":["0 mln'.'",1]}],[10000000,{"one":["00 mln'.'",2],"other":["00 mln'.'",2]}],[100000000,{"one":["000 mln'.'",3],"other":["000 mln'.'",3]}],[1000000000,{"one":["0 mld'.'",1],"other":["0 mld'.'",1]}],[10000000000,{"one":["00 mld'.'",2],"other":["00 mld'.'",2]}],[100000000000,{"one":["000 mld'.'",3],"other":["000 mld'.'",3]}],[1000000000000,{"one":["0 bln'.'",1],"other":["0 bln'.'",1]}],[10000000000000,{"one":["00 bln'.'",2],"other":["00 bln'.'",2]}],[100000000000000,{"one":["000 bln'.'",3],"other":["000 bln'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"nl-AW","parentLocale":"nl"});
IntlMessageFormat.__addLocaleData({"locale":"nl-BE","parentLocale":"nl"});
IntlMessageFormat.__addLocaleData({"locale":"nl-BQ","parentLocale":"nl"});
IntlMessageFormat.__addLocaleData({"locale":"nl-CW","parentLocale":"nl"});
IntlMessageFormat.__addLocaleData({"locale":"nl-SR","parentLocale":"nl"});
IntlMessageFormat.__addLocaleData({"locale":"nl-SX","parentLocale":"nl"});

IntlMessageFormat.__addLocaleData({"locale":"nmg","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tusen",1],"other":["0 tusen",1]}],[10000,{"one":["00 tusen",2],"other":["00 tusen",2]}],[100000,{"one":["000 tusen",3],"other":["000 tusen",3]}],[1000000,{"one":["0 million",1],"other":["0 millionar",1]}],[10000000,{"one":["00 million",2],"other":["00 millionar",2]}],[100000000,{"one":["000 million",3],"other":["000 millionar",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliardar",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliardar",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliardar",3]}],[1000000000000,{"one":["0 billion",1],"other":["0 billionar",1]}],[10000000000000,{"one":["00 billion",2],"other":["00 billionar",2]}],[100000000000000,{"one":["000 billion",3],"other":["000 billionar",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nnh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"no","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nqo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nr","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nso","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nus","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ny","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"nyn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"om","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"om-KE","parentLocale":"om"});

IntlMessageFormat.__addLocaleData({"locale":"or","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return n==1||n==5||t0&&n>=7&&n<=9?"one":n==2||n==3?"two":n==4?"few":n==6?"many":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ହଜାର",1],"other":["0 ହଜାର",1]}],[10000,{"one":["00 ହଜାର",2],"other":["00 ହଜାର",2]}],[100000,{"one":["000 ହଜାର",3],"other":["000 ହଜାର",3]}],[1000000,{"one":["0 ନିୟୁତ",1],"other":["0 ନିୟୁତ",1]}],[10000000,{"one":["00 ନିୟୁତ",2],"other":["00 ନିୟୁତ",2]}],[100000000,{"one":["000 ନିୟୁତ",3],"other":["000 ନିୟୁତ",3]}],[1000000000,{"one":["0 ଶହକୋଟି",1],"other":["0 ଶହକୋଟି",1]}],[10000000000,{"one":["00 ଶହକୋଟି",2],"other":["00 ଶହକୋଟି",2]}],[100000000000,{"one":["000 ଶହକୋଟି",3],"other":["000 ଶହକୋଟି",3]}],[1000000000000,{"one":["0 ଲକ୍ଷକୋଟି",1],"other":["0 ଲକ୍ଷକୋଟି",1]}],[10000000000000,{"one":["00 ଲକ୍ଷକୋଟି",2],"other":["00 ଲକ୍ଷକୋଟି",2]}],[100000000000000,{"one":["000 ଲକ୍ଷକୋଟି",3],"other":["000 ଲକ୍ଷକୋଟି",3]}]],"short":[[1000,{"one":["0ହ",1],"other":["0ହ",1]}],[10000,{"one":["00ହ",2],"other":["00ହ",2]}],[100000,{"one":["000ହ",3],"other":["000ହ",3]}],[1000000,{"one":["0ନି",1],"other":["0ନି",1]}],[10000000,{"one":["00ନି",2],"other":["00ନି",2]}],[100000000,{"one":["000ନି",3],"other":["000ନି",3]}],[1000000000,{"one":["0ବି",1],"other":["0ବି",1]}],[10000000000,{"one":["00ବି",2],"other":["00ବି",2]}],[100000000000,{"one":["000ବି",3],"other":["000ବି",3]}],[1000000000000,{"one":["0ଟ୍ରି",1],"other":["0ଟ୍ରି",1]}],[10000000000000,{"one":["00ଟ୍ରି",2],"other":["00ଟ୍ରି",2]}],[100000000000000,{"one":["000ଟ୍ରି",3],"other":["000ଟ୍ରି",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"os","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"os-RU","parentLocale":"os"});

IntlMessageFormat.__addLocaleData({"locale":"pa","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ਹਜ਼ਾਰ",1],"other":["0 ਹਜ਼ਾਰ",1]}],[10000,{"one":["00 ਹਜ਼ਾਰ",2],"other":["00 ਹਜ਼ਾਰ",2]}],[100000,{"one":["0 ਲੱਖ",1],"other":["0 ਲੱਖ",1]}],[1000000,{"one":["00 ਲੱਖ",2],"other":["00 ਲੱਖ",2]}],[10000000,{"one":["0 ਕਰੋੜ",1],"other":["0 ਕਰੋੜ",1]}],[100000000,{"one":["00 ਕਰੋੜ",2],"other":["00 ਕਰੋੜ",2]}],[1000000000,{"one":["0 ਅਰਬ",1],"other":["0 ਅਰਬ",1]}],[10000000000,{"one":["00 ਅਰਬ",2],"other":["00 ਅਰਬ",2]}],[100000000000,{"one":["0 ਖਰਬ",1],"other":["0 ਖਰਬ",1]}],[1000000000000,{"one":["00 ਖਰਬ",2],"other":["00 ਖਰਬ",2]}],[10000000000000,{"one":["0 ਨੀਲ",1],"other":["0 ਨੀਲ",1]}],[100000000000000,{"one":["00 ਨੀਲ",2],"other":["00 ਨੀਲ",2]}]],"short":[[1000,{"one":["0 ਹਜ਼ਾਰ",1],"other":["0 ਹਜ਼ਾਰ",1]}],[10000,{"one":["00 ਹਜ਼ਾਰ",2],"other":["00 ਹਜ਼ਾਰ",2]}],[100000,{"one":["0 ਲੱਖ",1],"other":["0 ਲੱਖ",1]}],[1000000,{"one":["00 ਲੱਖ",2],"other":["00 ਲੱਖ",2]}],[10000000,{"one":["0 ਕਰੋੜ",1],"other":["0 ਕਰੋੜ",1]}],[100000000,{"one":["00 ਕਰੋੜ",2],"other":["00 ਕਰੋੜ",2]}],[1000000000,{"one":["0 ਅਰਬ",1],"other":["0 ਅਰਬ",1]}],[10000000000,{"one":["00 ਅਰਬ",2],"other":["00 ਅਰਬ",2]}],[100000000000,{"one":["0 ਖਰਬ",1],"other":["0 ਖਰਬ",1]}],[1000000000000,{"one":["00 ਖਰਬ",2],"other":["00 ਖਰਬ",2]}],[10000000000000,{"one":["0 ਨੀਲ",1],"other":["0 ਨੀਲ",1]}],[100000000000000,{"one":["00 ਨੀਲ",2],"other":["00 ਨੀਲ",2]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"pa-Arab","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"pa-Guru","parentLocale":"pa"});

IntlMessageFormat.__addLocaleData({"locale":"pap","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"pl","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return"other";return n==1&&v0?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)?"few":v0&&i!=1&&(i10==0||i10==1)||v0&&(i10>=5&&i10<=9)||v0&&(i100>=12&&i100<=14)?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tysiąc",1],"few":["0 tysiące",1],"many":["0 tysięcy",1],"other":["0 tysiąca",1]}],[10000,{"one":["00 tysiąc",2],"few":["00 tysiące",2],"many":["00 tysięcy",2],"other":["00 tysiąca",2]}],[100000,{"one":["000 tysiąc",3],"few":["000 tysiące",3],"many":["000 tysięcy",3],"other":["000 tysiąca",3]}],[1000000,{"one":["0 milion",1],"few":["0 miliony",1],"many":["0 milionów",1],"other":["0 miliona",1]}],[10000000,{"one":["00 milion",2],"few":["00 miliony",2],"many":["00 milionów",2],"other":["00 miliona",2]}],[100000000,{"one":["000 milion",3],"few":["000 miliony",3],"many":["000 milionów",3],"other":["000 miliona",3]}],[1000000000,{"one":["0 miliard",1],"few":["0 miliardy",1],"many":["0 miliardów",1],"other":["0 miliarda",1]}],[10000000000,{"one":["00 miliard",2],"few":["00 miliardy",2],"many":["00 miliardów",2],"other":["00 miliarda",2]}],[100000000000,{"one":["000 miliard",3],"few":["000 miliardy",3],"many":["000 miliardów",3],"other":["000 miliarda",3]}],[1000000000000,{"one":["0 bilion",1],"few":["0 biliony",1],"many":["0 bilionów",1],"other":["0 biliona",1]}],[10000000000000,{"one":["00 bilion",2],"few":["00 biliony",2],"many":["00 bilionów",2],"other":["00 biliona",2]}],[100000000000000,{"one":["000 bilion",3],"few":["000 biliony",3],"many":["000 bilionów",3],"other":["000 biliona",3]}]],"short":[[1000,{"one":["0 tys'.'",1],"few":["0 tys'.'",1],"many":["0 tys'.'",1],"other":["0 tys'.'",1]}],[10000,{"one":["00 tys'.'",2],"few":["00 tys'.'",2],"many":["00 tys'.'",2],"other":["00 tys'.'",2]}],[100000,{"one":["000 tys'.'",3],"few":["000 tys'.'",3],"many":["000 tys'.'",3],"other":["000 tys'.'",3]}],[1000000,{"one":["0 mln",1],"few":["0 mln",1],"many":["0 mln",1],"other":["0 mln",1]}],[10000000,{"one":["00 mln",2],"few":["00 mln",2],"many":["00 mln",2],"other":["00 mln",2]}],[100000000,{"one":["000 mln",3],"few":["000 mln",3],"many":["000 mln",3],"other":["000 mln",3]}],[1000000000,{"one":["0 mld",1],"few":["0 mld",1],"many":["0 mld",1],"other":["0 mld",1]}],[10000000000,{"one":["00 mld",2],"few":["00 mld",2],"many":["00 mld",2],"other":["00 mld",2]}],[100000000000,{"one":["000 mld",3],"few":["000 mld",3],"many":["000 mld",3],"other":["000 mld",3]}],[1000000000000,{"one":["0 bln",1],"few":["0 bln",1],"many":["0 bln",1],"other":["0 bln",1]}],[10000000000000,{"one":["00 bln",2],"few":["00 bln",2],"many":["00 bln",2],"other":["00 bln",2]}],[100000000000000,{"one":["000 bln",3],"few":["000 bln",3],"many":["000 bln",3],"other":["000 bln",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"prg","pluralRuleFunction":function (n,ord){var s=String(n).split("."),f=s[1]||"",v=f.length,t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),f100=f.slice(-2),f10=f.slice(-1);if(ord)return"other";return t0&&n10==0||n100>=11&&n100<=19||v==2&&(f100>=11&&f100<=19)?"zero":n10==1&&n100!=11||v==2&&f10==1&&f100!=11||v!=2&&f10==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ps","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000G",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"pt","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0];if(ord)return"other";return i==0||i==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 milhão",1],"other":["0 milhões",1]}],[10000000,{"one":["00 milhão",2],"other":["00 milhões",2]}],[100000000,{"one":["000 milhão",3],"other":["000 milhões",3]}],[1000000000,{"one":["0 bilhão",1],"other":["0 bilhões",1]}],[10000000000,{"one":["00 bilhão",2],"other":["00 bilhões",2]}],[100000000000,{"one":["000 bilhão",3],"other":["000 bilhões",3]}],[1000000000000,{"one":["0 trilhão",1],"other":["0 trilhões",1]}],[10000000000000,{"one":["00 trilhão",2],"other":["00 trilhões",2]}],[100000000000000,{"one":["000 trilhão",3],"other":["000 trilhões",3]}]],"short":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 mi",1],"other":["0 mi",1]}],[10000000,{"one":["00 mi",2],"other":["00 mi",2]}],[100000000,{"one":["000 mi",3],"other":["000 mi",3]}],[1000000000,{"one":["0 bi",1],"other":["0 bi",1]}],[10000000000,{"one":["00 bi",2],"other":["00 bi",2]}],[100000000000,{"one":["000 bi",3],"other":["000 bi",3]}],[1000000000000,{"one":["0 tri",1],"other":["0 tri",1]}],[10000000000000,{"one":["00 tri",2],"other":["00 tri",2]}],[100000000000000,{"one":["000 tri",3],"other":["000 tri",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"pt-AO","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-PT","parentLocale":"pt","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 milhão",1],"other":["0 milhões",1]}],[10000000,{"one":["00 milhões",2],"other":["00 milhões",2]}],[100000000,{"one":["000 milhões",3],"other":["000 milhões",3]}],[1000000000,{"one":["0 mil milhões",1],"other":["0 mil milhões",1]}],[10000000000,{"one":["00 mil milhões",2],"other":["00 mil milhões",2]}],[100000000000,{"one":["000 mil milhões",3],"other":["000 mil milhões",3]}],[1000000000000,{"one":["0 bilião",1],"other":["0 biliões",1]}],[10000000000000,{"one":["00 biliões",2],"other":["00 biliões",2]}],[100000000000000,{"one":["000 biliões",3],"other":["000 biliões",3]}]],"short":[[1000,{"one":["0 mil",1],"other":["0 mil",1]}],[10000,{"one":["00 mil",2],"other":["00 mil",2]}],[100000,{"one":["000 mil",3],"other":["000 mil",3]}],[1000000,{"one":["0 M",1],"other":["0 M",1]}],[10000000,{"one":["00 M",2],"other":["00 M",2]}],[100000000,{"one":["000 M",3],"other":["000 M",3]}],[1000000000,{"one":["0 mM",1],"other":["0 mM",1]}],[10000000000,{"one":["00 mM",2],"other":["00 mM",2]}],[100000000000,{"one":["000 mM",3],"other":["000 mM",3]}],[1000000000000,{"one":["0 Bi",1],"other":["0 Bi",1]}],[10000000000000,{"one":["00 Bi",2],"other":["00 Bi",2]}],[100000000000000,{"one":["000 Bi",3],"other":["000 Bi",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"pt-CH","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-CV","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-GQ","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-GW","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-LU","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-MO","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-MZ","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-ST","parentLocale":"pt-PT"});
IntlMessageFormat.__addLocaleData({"locale":"pt-TL","parentLocale":"pt-PT"});

IntlMessageFormat.__addLocaleData({"locale":"qu","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"qu-BO","parentLocale":"qu"});
IntlMessageFormat.__addLocaleData({"locale":"qu-EC","parentLocale":"qu"});

IntlMessageFormat.__addLocaleData({"locale":"rm","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"rn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ro","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return n==1?"one":"other";return n==1&&v0?"one":!v0||n==0||n!=1&&(n100>=1&&n100<=19)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mie",1],"few":["0 mii",1],"other":["0 de mii",1]}],[10000,{"one":["00 mie",2],"few":["00 mii",2],"other":["00 de mii",2]}],[100000,{"one":["000 mie",3],"few":["000 mii",3],"other":["000 de mii",3]}],[1000000,{"one":["0 milion",1],"few":["0 milioane",1],"other":["0 de milioane",1]}],[10000000,{"one":["00 milion",2],"few":["00 milioane",2],"other":["00 de milioane",2]}],[100000000,{"one":["000 milion",3],"few":["000 milioane",3],"other":["000 de milioane",3]}],[1000000000,{"one":["0 miliard",1],"few":["0 miliarde",1],"other":["0 de miliarde",1]}],[10000000000,{"one":["00 miliard",2],"few":["00 miliarde",2],"other":["00 de miliarde",2]}],[100000000000,{"one":["000 miliard",3],"few":["000 miliarde",3],"other":["000 de miliarde",3]}],[1000000000000,{"one":["0 trilion",1],"few":["0 trilioane",1],"other":["0 de trilioane",1]}],[10000000000000,{"one":["00 trilion",2],"few":["00 trilioane",2],"other":["00 de trilioane",2]}],[100000000000000,{"one":["000 trilion",3],"few":["000 trilioane",3],"other":["000 de trilioane",3]}]],"short":[[1000,{"one":["0 K",1],"few":["0 K",1],"other":["0 K",1]}],[10000,{"one":["00 K",2],"few":["00 K",2],"other":["00 K",2]}],[100000,{"one":["000 K",3],"few":["000 K",3],"other":["000 K",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mld'.'",1],"few":["0 mld'.'",1],"other":["0 mld'.'",1]}],[10000000000,{"one":["00 mld'.'",2],"few":["00 mld'.'",2],"other":["00 mld'.'",2]}],[100000000000,{"one":["000 mld'.'",3],"few":["000 mld'.'",3],"other":["000 mld'.'",3]}],[1000000000000,{"one":["0 tril'.'",1],"few":["0 tril'.'",1],"other":["0 tril'.'",1]}],[10000000000000,{"one":["00 tril'.'",2],"few":["00 tril'.'",2],"other":["00 tril'.'",2]}],[100000000000000,{"one":["000 tril'.'",3],"few":["000 tril'.'",3],"other":["000 tril'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ro-MD","parentLocale":"ro"});

IntlMessageFormat.__addLocaleData({"locale":"rof","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ru","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)?"few":v0&&i10==0||v0&&(i10>=5&&i10<=9)||v0&&(i100>=11&&i100<=14)?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 тысяча",1],"few":["0 тысячи",1],"many":["0 тысяч",1],"other":["0 тысячи",1]}],[10000,{"one":["00 тысяча",2],"few":["00 тысячи",2],"many":["00 тысяч",2],"other":["00 тысячи",2]}],[100000,{"one":["000 тысяча",3],"few":["000 тысячи",3],"many":["000 тысяч",3],"other":["000 тысячи",3]}],[1000000,{"one":["0 миллион",1],"few":["0 миллиона",1],"many":["0 миллионов",1],"other":["0 миллиона",1]}],[10000000,{"one":["00 миллион",2],"few":["00 миллиона",2],"many":["00 миллионов",2],"other":["00 миллиона",2]}],[100000000,{"one":["000 миллион",3],"few":["000 миллиона",3],"many":["000 миллионов",3],"other":["000 миллиона",3]}],[1000000000,{"one":["0 миллиард",1],"few":["0 миллиарда",1],"many":["0 миллиардов",1],"other":["0 миллиарда",1]}],[10000000000,{"one":["00 миллиард",2],"few":["00 миллиарда",2],"many":["00 миллиардов",2],"other":["00 миллиарда",2]}],[100000000000,{"one":["000 миллиард",3],"few":["000 миллиарда",3],"many":["000 миллиардов",3],"other":["000 миллиарда",3]}],[1000000000000,{"one":["0 триллион",1],"few":["0 триллиона",1],"many":["0 триллионов",1],"other":["0 триллиона",1]}],[10000000000000,{"one":["00 триллион",2],"few":["00 триллиона",2],"many":["00 триллионов",2],"other":["00 триллиона",2]}],[100000000000000,{"one":["000 триллион",3],"few":["000 триллиона",3],"many":["000 триллионов",3],"other":["000 триллиона",3]}]],"short":[[1000,{"one":["0 тыс'.'",1],"few":["0 тыс'.'",1],"many":["0 тыс'.'",1],"other":["0 тыс'.'",1]}],[10000,{"one":["00 тыс'.'",2],"few":["00 тыс'.'",2],"many":["00 тыс'.'",2],"other":["00 тыс'.'",2]}],[100000,{"one":["000 тыс'.'",3],"few":["000 тыс'.'",3],"many":["000 тыс'.'",3],"other":["000 тыс'.'",3]}],[1000000,{"one":["0 млн",1],"few":["0 млн",1],"many":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"few":["00 млн",2],"many":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"few":["000 млн",3],"many":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млрд",1],"few":["0 млрд",1],"many":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"few":["00 млрд",2],"many":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"few":["000 млрд",3],"many":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 трлн",1],"few":["0 трлн",1],"many":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"few":["00 трлн",2],"many":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"few":["000 трлн",3],"many":["000 трлн",3],"other":["000 трлн",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ru-BY","parentLocale":"ru"});
IntlMessageFormat.__addLocaleData({"locale":"ru-KG","parentLocale":"ru"});
IntlMessageFormat.__addLocaleData({"locale":"ru-KZ","parentLocale":"ru"});
IntlMessageFormat.__addLocaleData({"locale":"ru-MD","parentLocale":"ru"});
IntlMessageFormat.__addLocaleData({"locale":"ru-UA","parentLocale":"ru"});

IntlMessageFormat.__addLocaleData({"locale":"rw","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"rwk","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sah","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 тыһыынча",1]}],[10000,{"other":["00 тыһыынча",2]}],[100000,{"other":["000 тыһыынча",3]}],[1000000,{"other":["0 мөлүйүөн",1]}],[10000000,{"other":["00 мөлүйүөн",2]}],[100000000,{"other":["000 мөлүйүөн",3]}],[1000000000,{"other":["0 миллиард",1]}],[10000000000,{"other":["00 миллиард",2]}],[100000000000,{"other":["000 миллиард",3]}],[1000000000000,{"other":["0 триллион",1]}],[10000000000000,{"other":["00 триллион",2]}],[100000000000000,{"other":["000 триллион",3]}]],"short":[[1000,{"other":["0 тыһ'.'",1]}],[10000,{"other":["00 тыһ'.'",2]}],[100000,{"other":["000 тыһ'.'",3]}],[1000000,{"other":["0 мөл",1]}],[10000000,{"other":["00 мөл",2]}],[100000000,{"other":["000 мөл",3]}],[1000000000,{"other":["0 млрд",1]}],[10000000000,{"other":["00 млрд",2]}],[100000000000,{"other":["000 млрд",3]}],[1000000000000,{"other":["0 трлн",1]}],[10000000000000,{"other":["00 трлн",2]}],[100000000000000,{"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"saq","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sbp","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sc","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?"many":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"scn","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?"many":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sd","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ھزار",1],"other":["0 ھزار",1]}],[10000,{"one":["00 ھزار",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sdh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"se","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 duhát",1],"two":["0 duháhat",1],"other":["0 duháhat",1]}],[10000,{"one":["00 duhát",2],"two":["00 duháhat",2],"other":["00 duháhat",2]}],[100000,{"one":["000 duhát",3],"two":["000 duháhat",3],"other":["000 duháhat",3]}],[1000000,{"one":["0 miljona",1],"two":["0 miljonat",1],"other":["0 miljonat",1]}],[10000000,{"one":["00 miljona",2],"two":["00 miljonat",2],"other":["00 miljonat",2]}],[100000000,{"one":["000 miljona",3],"two":["000 miljonat",3],"other":["000 miljonat",3]}],[1000000000,{"one":["0 miljardi",1],"two":["0 miljardit",1],"other":["0 miljardit",1]}],[10000000000,{"one":["00 miljardi",2],"two":["00 miljardit",2],"other":["00 miljardit",2]}],[100000000000,{"one":["000 miljardi",3],"two":["000 miljardit",3],"other":["000 miljardit",3]}],[1000000000000,{"one":["0 biljona",1],"two":["0 biljonat",1],"other":["0 biljonat",1]}],[10000000000000,{"one":["00 biljona",2],"two":["00 biljonat",2],"other":["00 biljonat",2]}],[100000000000000,{"one":["000 biljona",3],"two":["000 biljonat",3],"other":["000 biljonat",3]}]],"short":[[1000,{"one":["0 dt",1],"two":["0 dt",1],"other":["0 dt",1]}],[10000,{"one":["00 dt",2],"two":["00 dt",2],"other":["00 dt",2]}],[100000,{"one":["000 dt",3],"two":["000 dt",3],"other":["000 dt",3]}],[1000000,{"one":["0 mn",1],"two":["0 mn",1],"other":["0 mn",1]}],[10000000,{"one":["00 mn",2],"two":["00 mn",2],"other":["00 mn",2]}],[100000000,{"one":["000 mn",3],"two":["000 mn",3],"other":["000 mn",3]}],[1000000000,{"one":["0 md",1],"two":["0 md",1],"other":["0 md",1]}],[10000000000,{"one":["00 md",2],"two":["00 md",2],"other":["00 md",2]}],[100000000000,{"one":["000 md",3],"two":["000 md",3],"other":["000 md",3]}],[1000000000000,{"one":["0 bn",1],"two":["0 bn",1],"other":["0 bn",1]}],[10000000000000,{"one":["00 bn",2],"two":["00 bn",2],"other":["00 bn",2]}],[100000000000000,{"one":["000 bn",3],"two":["000 bn",3],"other":["000 bn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"se-FI","parentLocale":"se","numbers":{"decimal":{"long":[[1000,{"one":["0 duhát",1],"two":["0 dt",1],"other":["0 duháhat",1]}],[10000,{"one":["00 duháhat",2],"two":["00 dt",2],"other":["00 duháhat",2]}],[100000,{"one":["000 duháhat",3],"two":["000 dt",3],"other":["000 duháhat",3]}],[1000000,{"one":["0 miljona",1],"two":["0 mn",1],"other":["0 miljonat",1]}],[10000000,{"one":["00 miljonat",2],"two":["00 mn",2],"other":["00 miljonat",2]}],[100000000,{"one":["000 miljonat",3],"two":["000 mn",3],"other":["000 miljonat",3]}],[1000000000,{"one":["0 miljárda",1],"two":["0 miljárdat",1],"other":["0 miljárdat",1]}],[10000000000,{"one":["00 miljárdat",2],"two":["00 md",2],"other":["00 miljárdat",2]}],[100000000000,{"one":["000 miljárdat",3],"two":["000 md",3],"other":["000 miljárdat",3]}],[1000000000000,{"one":["0 biljovdna",1],"two":["0 bn",1],"other":["0 biljovdnat",1]}],[10000000000000,{"one":["00 biljovdnat",2],"two":["00 bn",2],"other":["00 biljovdnat",2]}],[100000000000000,{"one":["000 biljovdnat",3],"two":["000 bn",3],"other":["000 biljovdnat",3]}]],"short":[[1000,{"one":["0 dt",1],"two":["0 dt",1],"other":["0 dt",1]}],[10000,{"one":["00 dt",2],"two":["00 dt",2],"other":["00 dt",2]}],[100000,{"one":["000 dt",3],"two":["000 dt",3],"other":["000 dt",3]}],[1000000,{"one":["0 mn",1],"two":["0 mn",1],"other":["0 mn",1]}],[10000000,{"one":["00 mn",2],"two":["00 mn",2],"other":["00 mn",2]}],[100000000,{"one":["000 mn",3],"two":["000 mn",3],"other":["000 mn",3]}],[1000000000,{"one":["0 md",1],"two":["0 md",1],"other":["0 md",1]}],[10000000000,{"one":["00 md",2],"two":["00 md",2],"other":["00 md",2]}],[100000000000,{"one":["000 md",3],"two":["000 md",3],"other":["000 md",3]}],[1000000000000,{"one":["0 bn",1],"two":["0 bn",1],"other":["0 bn",1]}],[10000000000000,{"one":["00 bn",2],"two":["00 bn",2],"other":["00 bn",2]}],[100000000000000,{"one":["000 bn",3],"two":["000 bn",3],"other":["000 bn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"se-SE","parentLocale":"se"});

IntlMessageFormat.__addLocaleData({"locale":"seh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ses","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sg","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sh","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"shi","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return"other";return n>=0&&n<=1?"one":t0&&n>=2&&n<=10?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"shi-Latn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"shi-Tfng","parentLocale":"shi"});

IntlMessageFormat.__addLocaleData({"locale":"si","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"";if(ord)return"other";return n==0||n==1||i==0&&f==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["දහස 0",1],"other":["දහස 0",1]}],[10000,{"one":["දහස 00",2],"other":["දහස 00",2]}],[100000,{"one":["දහස 000",3],"other":["දහස 000",3]}],[1000000,{"one":["මිලියන 0",1],"other":["මිලියන 0",1]}],[10000000,{"one":["මිලියන 00",2],"other":["මිලියන 00",2]}],[100000000,{"one":["මිලියන 000",3],"other":["මිලියන 000",3]}],[1000000000,{"one":["බිලියන 0",1],"other":["බිලියන 0",1]}],[10000000000,{"one":["බිලියන 00",2],"other":["බිලියන 00",2]}],[100000000000,{"one":["බිලියන 000",3],"other":["බිලියන 000",3]}],[1000000000000,{"one":["ට්‍රිලියන 0",1],"other":["ට්‍රිලියන 0",1]}],[10000000000000,{"one":["ට්‍රිලියන 00",2],"other":["ට්‍රිලියන 00",2]}],[100000000000000,{"one":["ට්‍රිලියන 000",3],"other":["ට්‍රිලියන 000",3]}]],"short":[[1000,{"one":["ද0",1],"other":["ද0",1]}],[10000,{"one":["ද00",2],"other":["ද00",2]}],[100000,{"one":["ද000",3],"other":["ද000",3]}],[1000000,{"one":["මි0",1],"other":["මි0",1]}],[10000000,{"one":["මි00",2],"other":["මි00",2]}],[100000000,{"one":["මි000",3],"other":["මි000",3]}],[1000000000,{"one":["බි0",1],"other":["බි0",1]}],[10000000000,{"one":["බි00",2],"other":["බි00",2]}],[100000000000,{"one":["බි000",3],"other":["බි000",3]}],[1000000000000,{"one":["ට්‍රි0",1],"other":["ට්‍රි0",1]}],[10000000000000,{"one":["ට්‍රි00",2],"other":["ට්‍රි00",2]}],[100000000000000,{"one":["ට්‍රි000",3],"other":["ට්‍රි000",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sk","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1];if(ord)return"other";return n==1&&v0?"one":i>=2&&i<=4&&v0?"few":!v0?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tisíc",1],"few":["0 tisíce",1],"many":["0 tisíca",1],"other":["0 tisíc",1]}],[10000,{"one":["00 tisíc",2],"few":["00 tisíc",2],"many":["00 tisíca",2],"other":["00 tisíc",2]}],[100000,{"one":["000 tisíc",3],"few":["000 tisíc",3],"many":["000 tisíca",3],"other":["000 tisíc",3]}],[1000000,{"one":["0 milión",1],"few":["0 milióny",1],"many":["0 milióna",1],"other":["0 miliónov",1]}],[10000000,{"one":["00 miliónov",2],"few":["00 miliónov",2],"many":["00 milióna",2],"other":["00 miliónov",2]}],[100000000,{"one":["000 miliónov",3],"few":["000 miliónov",3],"many":["000 milióna",3],"other":["000 miliónov",3]}],[1000000000,{"one":["0 miliarda",1],"few":["0 miliardy",1],"many":["0 miliardy",1],"other":["0 miliárd",1]}],[10000000000,{"one":["00 miliárd",2],"few":["00 miliárd",2],"many":["00 miliardy",2],"other":["00 miliárd",2]}],[100000000000,{"one":["000 miliárd",3],"few":["000 miliárd",3],"many":["000 miliardy",3],"other":["000 miliárd",3]}],[1000000000000,{"one":["0 bilión",1],"few":["0 bilióny",1],"many":["0 bilióna",1],"other":["0 biliónov",1]}],[10000000000000,{"one":["00 biliónov",2],"few":["00 biliónov",2],"many":["00 bilióna",2],"other":["00 biliónov",2]}],[100000000000000,{"one":["000 biliónov",3],"few":["000 biliónov",3],"many":["000 bilióna",3],"other":["000 biliónov",3]}]],"short":[[1000,{"one":["0 tis'.'",1],"few":["0 tis'.'",1],"many":["0 tis'.'",1],"other":["0 tis'.'",1]}],[10000,{"one":["00 tis'.'",2],"few":["00 tis'.'",2],"many":["00 tis'.'",2],"other":["00 tis'.'",2]}],[100000,{"one":["000 tis'.'",3],"few":["000 tis'.'",3],"many":["000 tis'.'",3],"other":["000 tis'.'",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"many":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"many":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"many":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mld'.'",1],"few":["0 mld'.'",1],"many":["0 mld'.'",1],"other":["0 mld'.'",1]}],[10000000000,{"one":["00 mld'.'",2],"few":["00 mld'.'",2],"many":["00 mld'.'",2],"other":["00 mld'.'",2]}],[100000000000,{"one":["000 mld'.'",3],"few":["000 mld'.'",3],"many":["000 mld'.'",3],"other":["000 mld'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"few":["0 bil'.'",1],"many":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"few":["00 bil'.'",2],"many":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"few":["000 bil'.'",3],"many":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sl","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],i100=i.slice(-2);if(ord)return"other";return v0&&i100==1?"one":v0&&i100==2?"two":v0&&(i100==3||i100==4)||!v0?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tisoč",1],"two":["0 tisoč",1],"few":["0 tisoč",1],"other":["0 tisoč",1]}],[10000,{"one":["00 tisoč",2],"two":["00 tisoč",2],"few":["00 tisoč",2],"other":["00 tisoč",2]}],[100000,{"one":["000 tisoč",3],"two":["000 tisoč",3],"few":["000 tisoč",3],"other":["000 tisoč",3]}],[1000000,{"one":["0 milijon",1],"two":["0 milijona",1],"few":["0 milijone",1],"other":["0 milijonov",1]}],[10000000,{"one":["00 milijon",2],"two":["00 milijona",2],"few":["00 milijoni",2],"other":["00 milijonov",2]}],[100000000,{"one":["000 milijon",3],"two":["000 milijona",3],"few":["000 milijoni",3],"other":["000 milijonov",3]}],[1000000000,{"one":["0 milijarda",1],"two":["0 milijardi",1],"few":["0 milijarde",1],"other":["0 milijard",1]}],[10000000000,{"one":["00 milijarda",2],"two":["00 milijardi",2],"few":["00 milijarde",2],"other":["00 milijard",2]}],[100000000000,{"one":["000 milijarda",3],"two":["000 milijardi",3],"few":["000 milijarde",3],"other":["000 milijard",3]}],[1000000000000,{"one":["0 bilijon",1],"two":["0 bilijona",1],"few":["0 bilijoni",1],"other":["0 bilijonov",1]}],[10000000000000,{"one":["00 bilijon",2],"two":["00 bilijona",2],"few":["00 bilijoni",2],"other":["00 bilijonov",2]}],[100000000000000,{"one":["000 bilijon",3],"two":["000 bilijona",3],"few":["000 bilijoni",3],"other":["000 bilijonov",3]}]],"short":[[1000,{"one":["0 tis'.'",1],"two":["0 tis'.'",1],"few":["0 tis'.'",1],"other":["0 tis'.'",1]}],[10000,{"one":["00 tis'.'",2],"two":["00 tis'.'",2],"few":["00 tis'.'",2],"other":["00 tis'.'",2]}],[100000,{"one":["000 tis'.'",3],"two":["000 tis'.'",3],"few":["000 tis'.'",3],"other":["000 tis'.'",3]}],[1000000,{"one":["0 mio'.'",1],"two":["0 mio'.'",1],"few":["0 mio'.'",1],"other":["0 mio'.'",1]}],[10000000,{"one":["00 mio'.'",2],"two":["00 mio'.'",2],"few":["00 mio'.'",2],"other":["00 mio'.'",2]}],[100000000,{"one":["000 mio'.'",3],"two":["000 mio'.'",3],"few":["000 mio'.'",3],"other":["000 mio'.'",3]}],[1000000000,{"one":["0 mrd'.'",1],"two":["0 mrd'.'",1],"few":["0 mrd'.'",1],"other":["0 mrd'.'",1]}],[10000000000,{"one":["00 mrd'.'",2],"two":["00 mrd'.'",2],"few":["00 mrd'.'",2],"other":["00 mrd'.'",2]}],[100000000000,{"one":["000 mrd'.'",3],"two":["000 mrd'.'",3],"few":["000 mrd'.'",3],"other":["000 mrd'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"two":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"two":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"two":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sma","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"smi","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"smj","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"smn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tuhháát",1],"two":["0 tuhháát",1],"other":["0 tuhháát",1]}],[10000,{"one":["00 tuhháát",2],"two":["00 tuhháát",2],"other":["00 tuhháát",2]}],[100000,{"one":["000 tuhháát",3],"two":["000 tuhháát",3],"other":["000 tuhháát",3]}],[1000000,{"one":["0 miljovn",1],"two":["0 miljovn",1],"other":["0 miljovn",1]}],[10000000,{"one":["00 miljovn",2],"two":["00 miljovn",2],"other":["00 miljovn",2]}],[100000000,{"one":["000 miljovn",3],"two":["000 miljovn",3],"other":["000 miljovn",3]}],[1000000000,{"one":["0 miljard",1],"two":["0 miljard",1],"other":["0 miljard",1]}],[10000000000,{"one":["00 miljard",2],"two":["00 miljard",2],"other":["00 miljard",2]}],[100000000000,{"one":["000 miljard",3],"two":["000 miljard",3],"other":["000 miljard",3]}],[1000000000000,{"one":["0 biljovn",1],"two":["0 biljovn",1],"other":["0 biljovn",1]}],[10000000000000,{"one":["00 biljovn",2],"two":["00 biljovn",2],"other":["00 biljovn",2]}],[100000000000000,{"one":["000 biljovn",3],"two":["000 biljovn",3],"other":["000 biljovn",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sms","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":n==2?"two":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"so","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"so-DJ","parentLocale":"so"});
IntlMessageFormat.__addLocaleData({"locale":"so-ET","parentLocale":"so"});
IntlMessageFormat.__addLocaleData({"locale":"so-KE","parentLocale":"so"});

IntlMessageFormat.__addLocaleData({"locale":"sq","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n==1?"one":n10==4&&n100!=14?"many":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 mijë",1],"other":["0 mijë",1]}],[10000,{"one":["00 mijë",2],"other":["00 mijë",2]}],[100000,{"one":["000 mijë",3],"other":["000 mijë",3]}],[1000000,{"one":["0 milion",1],"other":["0 milion",1]}],[10000000,{"one":["00 milion",2],"other":["00 milion",2]}],[100000000,{"one":["000 milion",3],"other":["000 milion",3]}],[1000000000,{"one":["0 miliard",1],"other":["0 miliard",1]}],[10000000000,{"one":["00 miliard",2],"other":["00 miliard",2]}],[100000000000,{"one":["000 miliard",3],"other":["000 miliard",3]}],[1000000000000,{"one":["0 bilion",1],"other":["0 bilion",1]}],[10000000000000,{"one":["00 bilion",2],"other":["00 bilion",2]}],[100000000000000,{"one":["000 bilion",3],"other":["000 bilion",3]}]],"short":[[1000,{"one":["0 mijë",1],"other":["0 mijë",1]}],[10000,{"one":["00 mijë",2],"other":["00 mijë",2]}],[100000,{"one":["000 mijë",3],"other":["000 mijë",3]}],[1000000,{"one":["0 mln",1],"other":["0 mln",1]}],[10000000,{"one":["00 mln",2],"other":["00 mln",2]}],[100000000,{"one":["000 mln",3],"other":["000 mln",3]}],[1000000000,{"one":["0 mld",1],"other":["0 mld",1]}],[10000000000,{"one":["00 mld",2],"other":["00 mld",2]}],[100000000000,{"one":["000 mld",3],"other":["000 mld",3]}],[1000000000000,{"one":["0 bln",1],"other":["0 bln",1]}],[10000000000000,{"one":["00 bln",2],"other":["00 bln",2]}],[100000000000000,{"one":["000 bln",3],"other":["000 bln",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"sq-MK","parentLocale":"sq"});
IntlMessageFormat.__addLocaleData({"locale":"sq-XK","parentLocale":"sq"});

IntlMessageFormat.__addLocaleData({"locale":"sr","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?"few":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 хиљада",1],"few":["0 хиљаде",1],"other":["0 хиљада",1]}],[10000,{"one":["00 хиљада",2],"few":["00 хиљаде",2],"other":["00 хиљада",2]}],[100000,{"one":["000 хиљада",3],"few":["000 хиљаде",3],"other":["000 хиљада",3]}],[1000000,{"one":["0 милион",1],"few":["0 милиона",1],"other":["0 милиона",1]}],[10000000,{"one":["00 милион",2],"few":["00 милиона",2],"other":["00 милиона",2]}],[100000000,{"one":["000 милион",3],"few":["000 милиона",3],"other":["000 милиона",3]}],[1000000000,{"one":["0 милијарда",1],"few":["0 милијарде",1],"other":["0 милијарди",1]}],[10000000000,{"one":["00 милијарда",2],"few":["00 милијарде",2],"other":["00 милијарди",2]}],[100000000000,{"one":["000 милијарда",3],"few":["000 милијарде",3],"other":["000 милијарди",3]}],[1000000000000,{"one":["0 билион",1],"few":["0 билиона",1],"other":["0 билиона",1]}],[10000000000000,{"one":["00 билион",2],"few":["00 билиона",2],"other":["00 билиона",2]}],[100000000000000,{"one":["000 билион",3],"few":["000 билиона",3],"other":["000 билиона",3]}]],"short":[[1000,{"one":["0 хиљ'.'",1],"few":["0 хиљ'.'",1],"other":["0 хиљ'.'",1]}],[10000,{"one":["00 хиљ'.'",2],"few":["00 хиљ'.'",2],"other":["00 хиљ'.'",2]}],[100000,{"one":["000 хиљ'.'",3],"few":["000 хиљ'.'",3],"other":["000 хиљ'.'",3]}],[1000000,{"one":["0 мил'.'",1],"few":["0 мил'.'",1],"other":["0 мил'.'",1]}],[10000000,{"one":["00 мил'.'",2],"few":["00 мил'.'",2],"other":["00 мил'.'",2]}],[100000000,{"one":["000 мил'.'",3],"few":["000 мил'.'",3],"other":["000 мил'.'",3]}],[1000000000,{"one":["0 млрд'.'",1],"few":["0 млрд'.'",1],"other":["0 млрд'.'",1]}],[10000000000,{"one":["00 млрд'.'",2],"few":["00 млрд'.'",2],"other":["00 млрд'.'",2]}],[100000000000,{"one":["000 млрд'.'",3],"few":["000 млрд'.'",3],"other":["000 млрд'.'",3]}],[1000000000000,{"one":["0 бил'.'",1],"few":["0 бил'.'",1],"other":["0 бил'.'",1]}],[10000000000000,{"one":["00 бил'.'",2],"few":["00 бил'.'",2],"other":["00 бил'.'",2]}],[100000000000000,{"one":["000 бил'.'",3],"few":["000 бил'.'",3],"other":["000 бил'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"sr-Cyrl","parentLocale":"sr"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Cyrl-BA","parentLocale":"sr-Cyrl"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Cyrl-ME","parentLocale":"sr-Cyrl"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Cyrl-XK","parentLocale":"sr-Cyrl"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Latn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 hiljada",1],"few":["0 hiljade",1],"other":["0 hiljada",1]}],[10000,{"one":["00 hiljada",2],"few":["00 hiljade",2],"other":["00 hiljada",2]}],[100000,{"one":["000 hiljada",3],"few":["000 hiljade",3],"other":["000 hiljada",3]}],[1000000,{"one":["0 milion",1],"few":["0 miliona",1],"other":["0 miliona",1]}],[10000000,{"one":["00 milion",2],"few":["00 miliona",2],"other":["00 miliona",2]}],[100000000,{"one":["000 milion",3],"few":["000 miliona",3],"other":["000 miliona",3]}],[1000000000,{"one":["0 milijarda",1],"few":["0 milijarde",1],"other":["0 milijardi",1]}],[10000000000,{"one":["00 milijarda",2],"few":["00 milijarde",2],"other":["00 milijardi",2]}],[100000000000,{"one":["000 milijarda",3],"few":["000 milijarde",3],"other":["000 milijardi",3]}],[1000000000000,{"one":["0 bilion",1],"few":["0 biliona",1],"other":["0 biliona",1]}],[10000000000000,{"one":["00 bilion",2],"few":["00 biliona",2],"other":["00 biliona",2]}],[100000000000000,{"one":["000 bilion",3],"few":["000 biliona",3],"other":["000 biliona",3]}]],"short":[[1000,{"one":["0 hilj'.'",1],"few":["0 hilj'.'",1],"other":["0 hilj'.'",1]}],[10000,{"one":["00 hilj'.'",2],"few":["00 hilj'.'",2],"other":["00 hilj'.'",2]}],[100000,{"one":["000 hilj'.'",3],"few":["000 hilj'.'",3],"other":["000 hilj'.'",3]}],[1000000,{"one":["0 mil'.'",1],"few":["0 mil'.'",1],"other":["0 mil'.'",1]}],[10000000,{"one":["00 mil'.'",2],"few":["00 mil'.'",2],"other":["00 mil'.'",2]}],[100000000,{"one":["000 mil'.'",3],"few":["000 mil'.'",3],"other":["000 mil'.'",3]}],[1000000000,{"one":["0 mlrd'.'",1],"few":["0 mlrd'.'",1],"other":["0 mlrd'.'",1]}],[10000000000,{"one":["00 mlrd'.'",2],"few":["00 mlrd'.'",2],"other":["00 mlrd'.'",2]}],[100000000000,{"one":["000 mlrd'.'",3],"few":["000 mlrd'.'",3],"other":["000 mlrd'.'",3]}],[1000000000000,{"one":["0 bil'.'",1],"few":["0 bil'.'",1],"other":["0 bil'.'",1]}],[10000000000000,{"one":["00 bil'.'",2],"few":["00 bil'.'",2],"other":["00 bil'.'",2]}],[100000000000000,{"one":["000 bil'.'",3],"few":["000 bil'.'",3],"other":["000 bil'.'",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"sr-Latn-BA","parentLocale":"sr-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Latn-ME","parentLocale":"sr-Latn"});
IntlMessageFormat.__addLocaleData({"locale":"sr-Latn-XK","parentLocale":"sr-Latn"});

IntlMessageFormat.__addLocaleData({"locale":"ss","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ssy","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"st","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"sv","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return(n10==1||n10==2)&&n100!=11&&n100!=12?"one":"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 tusen",1],"other":["0 tusen",1]}],[10000,{"one":["00 tusen",2],"other":["00 tusen",2]}],[100000,{"one":["000 tusen",3],"other":["000 tusen",3]}],[1000000,{"one":["0 miljon",1],"other":["0 miljoner",1]}],[10000000,{"one":["00 miljon",2],"other":["00 miljoner",2]}],[100000000,{"one":["000 miljoner",3],"other":["000 miljoner",3]}],[1000000000,{"one":["0 miljard",1],"other":["0 miljarder",1]}],[10000000000,{"one":["00 miljarder",2],"other":["00 miljarder",2]}],[100000000000,{"one":["000 miljarder",3],"other":["000 miljarder",3]}],[1000000000000,{"one":["0 biljon",1],"other":["0 biljoner",1]}],[10000000000000,{"one":["00 biljoner",2],"other":["00 biljoner",2]}],[100000000000000,{"one":["000 biljoner",3],"other":["000 biljoner",3]}]],"short":[[1000,{"one":["0 tn",1],"other":["0 tn",1]}],[10000,{"one":["00 tn",2],"other":["00 tn",2]}],[100000,{"one":["000 tn",3],"other":["000 tn",3]}],[1000000,{"one":["0 mn",1],"other":["0 mn",1]}],[10000000,{"one":["00 mn",2],"other":["00 mn",2]}],[100000000,{"one":["000 mn",3],"other":["000 mn",3]}],[1000000000,{"one":["0 md",1],"other":["0 md",1]}],[10000000000,{"one":["00 md",2],"other":["00 md",2]}],[100000000000,{"one":["000 md",3],"other":["000 md",3]}],[1000000000000,{"one":["0 bn",1],"other":["0 bn",1]}],[10000000000000,{"one":["00 bn",2],"other":["00 bn",2]}],[100000000000000,{"one":["000 bn",3],"other":["000 bn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"sv-AX","parentLocale":"sv"});
IntlMessageFormat.__addLocaleData({"locale":"sv-FI","parentLocale":"sv"});

IntlMessageFormat.__addLocaleData({"locale":"sw","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["elfu 0;elfu -0",2],"other":["elfu 0;elfu -0",2]}],[10000,{"one":["elfu 00;elfu -00",4],"other":["elfu 00;elfu -00",4]}],[100000,{"one":["elfu 000;elfu -000",6],"other":["elfu 000;elfu -000",6]}],[1000000,{"one":["milioni 0;milioni -0",2],"other":["milioni 0;milioni -0",2]}],[10000000,{"one":["milioni 00;milioni -00",4],"other":["milioni 00;milioni -00",4]}],[100000000,{"one":["milioni 000;milioni -000",6],"other":["milioni 000;milioni -000",6]}],[1000000000,{"one":["bilioni 0;bilioni -0",2],"other":["bilioni 0;bilioni -0",2]}],[10000000000,{"one":["bilioni 00;bilioni -00",4],"other":["bilioni 00;bilioni -00",4]}],[100000000000,{"one":["bilioni 000;bilioni -000",6],"other":["bilioni 000;bilioni -000",6]}],[1000000000000,{"one":["trilioni 0;trilioni -0",2],"other":["trilioni 0;trilioni -0",2]}],[10000000000000,{"one":["trilioni 00;trilioni -00",4],"other":["trilioni 00;trilioni -00",4]}],[100000000000000,{"one":["trilioni 000;trilioni -000",6],"other":["trilioni 000;trilioni -000",6]}]],"short":[[1000,{"one":["elfu 0;elfu -0",2],"other":["elfu 0;elfu -0",2]}],[10000,{"one":["elfu 00;elfu -00",4],"other":["elfu 00;elfu -00",4]}],[100000,{"one":["elfu 000;elfu -000",6],"other":["elfu 000;elfu -000",6]}],[1000000,{"one":["0M;-0M",2],"other":["0M",1]}],[10000000,{"one":["00M;-00M",4],"other":["00M",2]}],[100000000,{"one":["000M;-000M",6],"other":["000M",3]}],[1000000000,{"one":["0B;-0B",2],"other":["0B;-0B",2]}],[10000000000,{"one":["00B;-00B",4],"other":["00B;-00B",4]}],[100000000000,{"one":["000B;-000B",6],"other":["000B;-000B",6]}],[1000000000000,{"one":["0T;-0T",2],"other":["0T",1]}],[10000000000000,{"one":["00T;-00T",4],"other":["00T",2]}],[100000000000000,{"one":["000T;-000T",6],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"sw-CD","parentLocale":"sw"});
IntlMessageFormat.__addLocaleData({"locale":"sw-KE","parentLocale":"sw"});
IntlMessageFormat.__addLocaleData({"locale":"sw-UG","parentLocale":"sw"});

IntlMessageFormat.__addLocaleData({"locale":"syr","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ta","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ஆயிரம்",1],"other":["0 ஆயிரம்",1]}],[10000,{"one":["00 ஆயிரம்",2],"other":["00 ஆயிரம்",2]}],[100000,{"one":["000 ஆயிரம்",3],"other":["000 ஆயிரம்",3]}],[1000000,{"one":["0 மில்லியன்",1],"other":["0 மில்லியன்",1]}],[10000000,{"one":["00 மில்லியன்",2],"other":["00 மில்லியன்",2]}],[100000000,{"one":["000 மில்லியன்",3],"other":["000 மில்லியன்",3]}],[1000000000,{"one":["0 பில்லியன்",1],"other":["0 பில்லியன்",1]}],[10000000000,{"one":["00 பில்லியன்",2],"other":["00 பில்லியன்",2]}],[100000000000,{"one":["000 பில்லியன்",3],"other":["000 பில்லியன்",3]}],[1000000000000,{"one":["0 டிரில்லியன்",1],"other":["0 டிரில்லியன்",1]}],[10000000000000,{"one":["00 டிரில்லியன்",2],"other":["00 டிரில்லியன்",2]}],[100000000000000,{"one":["000 டிரில்லியன்",3],"other":["000 டிரில்லியன்",3]}]],"short":[[1000,{"one":["0ஆ",1],"other":["0ஆ",1]}],[10000,{"one":["00ஆ",2],"other":["00ஆ",2]}],[100000,{"one":["000ஆ",3],"other":["000ஆ",3]}],[1000000,{"one":["0மி",1],"other":["0மி",1]}],[10000000,{"one":["00மி",2],"other":["00மி",2]}],[100000000,{"one":["000மி",3],"other":["000மி",3]}],[1000000000,{"one":["0பி",1],"other":["0பி",1]}],[10000000000,{"one":["00பி",2],"other":["00பி",2]}],[100000000000,{"one":["000பி",3],"other":["000பி",3]}],[1000000000000,{"one":["0டி",1],"other":["0டி",1]}],[10000000000000,{"one":["00டி",2],"other":["00டி",2]}],[100000000000000,{"one":["000டி",3],"other":["000டி",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ta-LK","parentLocale":"ta"});
IntlMessageFormat.__addLocaleData({"locale":"ta-MY","parentLocale":"ta"});
IntlMessageFormat.__addLocaleData({"locale":"ta-SG","parentLocale":"ta"});

IntlMessageFormat.__addLocaleData({"locale":"te","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 వేయి",1],"other":["0 వేలు",1]}],[10000,{"one":["00 వేలు",2],"other":["00 వేలు",2]}],[100000,{"one":["000 వేలు",3],"other":["000 వేలు",3]}],[1000000,{"one":["0 మిలియన్",1],"other":["0 మిలియన్లు",1]}],[10000000,{"one":["00 మిలియన్లు",2],"other":["00 మిలియన్లు",2]}],[100000000,{"one":["000 మిలియన్లు",3],"other":["000 మిలియన్లు",3]}],[1000000000,{"one":["0 బిలియన్",1],"other":["0 బిలియన్లు",1]}],[10000000000,{"one":["00 బిలియన్లు",2],"other":["00 బిలియన్లు",2]}],[100000000000,{"one":["000 బిలియన్లు",3],"other":["000 బిలియన్లు",3]}],[1000000000000,{"one":["0 ట్రిలియన్",1],"other":["0 ట్రిలియన్లు",1]}],[10000000000000,{"one":["00 ట్రిలియన్లు",2],"other":["00 ట్రిలియన్లు",2]}],[100000000000000,{"one":["000 ట్రిలియన్లు",3],"other":["000 ట్రిలియన్లు",3]}]],"short":[[1000,{"one":["0వే",1],"other":["0వే",1]}],[10000,{"one":["00వే",2],"other":["00వే",2]}],[100000,{"one":["000వే",3],"other":["000వే",3]}],[1000000,{"one":["0మి",1],"other":["0మి",1]}],[10000000,{"one":["00మి",2],"other":["00మి",2]}],[100000000,{"one":["000మి",3],"other":["000మి",3]}],[1000000000,{"one":["0బి",1],"other":["0బి",1]}],[10000000000,{"one":["00బి",2],"other":["00బి",2]}],[100000000000,{"one":["000బి",3],"other":["000బి",3]}],[1000000000000,{"one":["0ట్రి",1],"other":["0ట్రి",1]}],[10000000000000,{"one":["00ట్రి",2],"other":["00ట్రి",2]}],[100000000000000,{"one":["000ట్రి",3],"other":["000ట్రి",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"teo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"teo-KE","parentLocale":"teo"});

IntlMessageFormat.__addLocaleData({"locale":"tg","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"th","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 พัน",1]}],[10000,{"other":["0 หมื่น",1]}],[100000,{"other":["0 แสน",1]}],[1000000,{"other":["0 ล้าน",1]}],[10000000,{"other":["00 ล้าน",2]}],[100000000,{"other":["000 ล้าน",3]}],[1000000000,{"other":["0 พันล้าน",1]}],[10000000000,{"other":["0 หมื่นล้าน",1]}],[100000000000,{"other":["0 แสนล้าน",1]}],[1000000000000,{"other":["0 ล้านล้าน",1]}],[10000000000000,{"other":["00 ล้านล้าน",2]}],[100000000000000,{"other":["000 ล้านล้าน",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0B",1]}],[10000000000,{"other":["00B",2]}],[100000000000,{"other":["000B",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ti","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0G",1],"other":["0G",1]}],[10000000000,{"one":["00G",2],"other":["00G",2]}],[100000000000,{"one":["000G",3],"other":["000G",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ti-ER","parentLocale":"ti"});

IntlMessageFormat.__addLocaleData({"locale":"tig","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tk","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return n10==6||n10==9||n==10?"few":"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 müň",1],"other":["0 müň",1]}],[10000,{"one":["00 müň",2],"other":["00 müň",2]}],[100000,{"one":["000 müň",3],"other":["000 müň",3]}],[1000000,{"one":["0 million",1],"other":["0 million",1]}],[10000000,{"one":["00 million",2],"other":["00 million",2]}],[100000000,{"one":["000 million",3],"other":["000 million",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliard",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliard",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliard",3]}],[1000000000000,{"one":["0 trillion",1],"other":["0 trillion",1]}],[10000000000000,{"one":["00 trillion",2],"other":["00 trillion",2]}],[100000000000000,{"one":["000 trillion",3],"other":["000 trillion",3]}]],"short":[[1000,{"one":["0 müň",1],"other":["0 müň",1]}],[10000,{"one":["00 müň",2],"other":["00 müň",2]}],[100000,{"one":["000 müň",3],"other":["000 müň",3]}],[1000000,{"one":["0 mln",1],"other":["0 mln",1]}],[10000000,{"one":["00 mln",2],"other":["00 mln",2]}],[100000000,{"one":["000 mln",3],"other":["000 mln",3]}],[1000000000,{"one":["0 mlrd",1],"other":["0 mlrd",1]}],[10000000000,{"one":["00 mlrd",2],"other":["00 mlrd",2]}],[100000000000,{"one":["000 mlrd",3],"other":["000 mlrd",3]}],[1000000000000,{"one":["0 trln",1],"other":["0 trln",1]}],[10000000000000,{"one":["00 trln",2],"other":["00 trln",2]}],[100000000000000,{"one":["000 trln",3],"other":["000 trln",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tl","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),f10=f.slice(-1);if(ord)return n==1?"one":"other";return v0&&(i==1||i==2||i==3)||v0&&i10!=4&&i10!=6&&i10!=9||!v0&&f10!=4&&f10!=6&&f10!=9?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tn","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"to","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 afe",1]}],[10000,{"other":["0 mano",1]}],[100000,{"other":["0 kilu",1]}],[1000000,{"other":["0 miliona",1]}],[10000000,{"other":["00 miliona",2]}],[100000000,{"other":["000 miliona",3]}],[1000000000,{"other":["0 piliona",1]}],[10000000000,{"other":["00 piliona",2]}],[100000000000,{"other":["000 piliona",3]}],[1000000000000,{"other":["0 tiliona",1]}],[10000000000000,{"other":["00 tiliona",2]}],[100000000000000,{"other":["000 tiliona",3]}]],"short":[[1000,{"other":["0a",1]}],[10000,{"other":["0m",1]}],[100000,{"other":["0k",1]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0P",1]}],[10000000000,{"other":["00P",2]}],[100000000000,{"other":["000P",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tr","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 bin",1],"other":["0 bin",1]}],[10000,{"one":["00 bin",2],"other":["00 bin",2]}],[100000,{"one":["000 bin",3],"other":["000 bin",3]}],[1000000,{"one":["0 milyon",1],"other":["0 milyon",1]}],[10000000,{"one":["00 milyon",2],"other":["00 milyon",2]}],[100000000,{"one":["000 milyon",3],"other":["000 milyon",3]}],[1000000000,{"one":["0 milyar",1],"other":["0 milyar",1]}],[10000000000,{"one":["00 milyar",2],"other":["00 milyar",2]}],[100000000000,{"one":["000 milyar",3],"other":["000 milyar",3]}],[1000000000000,{"one":["0 trilyon",1],"other":["0 trilyon",1]}],[10000000000000,{"one":["00 trilyon",2],"other":["00 trilyon",2]}],[100000000000000,{"one":["000 trilyon",3],"other":["000 trilyon",3]}]],"short":[[1000,{"one":["0 B",1],"other":["0 B",1]}],[10000,{"one":["00 B",2],"other":["00 B",2]}],[100000,{"one":["000 B",3],"other":["000 B",3]}],[1000000,{"one":["0 Mn",1],"other":["0 Mn",1]}],[10000000,{"one":["00 Mn",2],"other":["00 Mn",2]}],[100000000,{"one":["000 Mn",3],"other":["000 Mn",3]}],[1000000000,{"one":["0 Mr",1],"other":["0 Mr",1]}],[10000000000,{"one":["00 Mr",2],"other":["00 Mr",2]}],[100000000000,{"one":["000 Mr",3],"other":["000 Mr",3]}],[1000000000000,{"one":["0 Tn",1],"other":["0 Tn",1]}],[10000000000000,{"one":["00 Tn",2],"other":["00 Tn",2]}],[100000000000000,{"one":["000 Tn",3],"other":["000 Tn",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"tr-CY","parentLocale":"tr"});

IntlMessageFormat.__addLocaleData({"locale":"ts","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tt","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"twq","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"tzm","pluralRuleFunction":function (n,ord){var s=String(n).split("."),t0=Number(s[0])==n;if(ord)return"other";return n==0||n==1||t0&&n>=11&&n<=99?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ug","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 مىڭ",1],"other":["0 مىڭ",1]}],[10000,{"one":["00 مىڭ",2],"other":["00 مىڭ",2]}],[100000,{"one":["000 مىڭ",3],"other":["000 مىڭ",3]}],[1000000,{"one":["0 مىليون",1],"other":["0 مىليون",1]}],[10000000,{"one":["00 مىليون",2],"other":["00 مىليون",2]}],[100000000,{"one":["000 مىليون",3],"other":["000 مىليون",3]}],[1000000000,{"one":["0 مىليارد",1],"other":["0 مىليارد",1]}],[10000000000,{"one":["00 مىليارد",2],"other":["00 مىليارد",2]}],[100000000000,{"one":["000 مىليارد",3],"other":["000 مىليارد",3]}],[1000000000000,{"one":["0 تىرىليون",1],"other":["0 تىرىليون",1]}],[10000000000000,{"one":["00 تىرىليون",2],"other":["00 تىرىليون",2]}],[100000000000000,{"one":["000 تىرىليون",3],"other":["000 تىرىليون",3]}]],"short":[[1000,{"one":["0مىڭ",1],"other":["0مىڭ",1]}],[10000,{"one":["00مىڭ",2],"other":["00مىڭ",2]}],[100000,{"one":["000مىڭ",3],"other":["000مىڭ",3]}],[1000000,{"one":["0مىليون",1],"other":["0مىليون",1]}],[10000000,{"one":["00مىليون",2],"other":["00مىليون",2]}],[100000000,{"one":["000مىليون",3],"other":["000مىليون",3]}],[1000000000,{"one":["0مىليارد",1],"other":["0مىليارد",1]}],[10000000000,{"one":["00مىليارد",2],"other":["00مىليارد",2]}],[100000000000,{"one":["000مىليارد",3],"other":["000مىليارد",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"uk","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),i10=i.slice(-1),i100=i.slice(-2);if(ord)return n10==3&&n100!=13?"few":"other";return v0&&i10==1&&i100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)?"few":v0&&i10==0||v0&&(i10>=5&&i10<=9)||v0&&(i100>=11&&i100<=14)?"many":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 тисяча",1],"few":["0 тисячі",1],"many":["0 тисяч",1],"other":["0 тисячі",1]}],[10000,{"one":["00 тисяча",2],"few":["00 тисячі",2],"many":["00 тисяч",2],"other":["00 тисячі",2]}],[100000,{"one":["000 тисяча",3],"few":["000 тисячі",3],"many":["000 тисяч",3],"other":["000 тисячі",3]}],[1000000,{"one":["0 мільйон",1],"few":["0 мільйони",1],"many":["0 мільйонів",1],"other":["0 мільйона",1]}],[10000000,{"one":["00 мільйон",2],"few":["00 мільйони",2],"many":["00 мільйонів",2],"other":["00 мільйона",2]}],[100000000,{"one":["000 мільйон",3],"few":["000 мільйони",3],"many":["000 мільйонів",3],"other":["000 мільйона",3]}],[1000000000,{"one":["0 мільярд",1],"few":["0 мільярди",1],"many":["0 мільярдів",1],"other":["0 мільярда",1]}],[10000000000,{"one":["00 мільярд",2],"few":["00 мільярди",2],"many":["00 мільярдів",2],"other":["00 мільярда",2]}],[100000000000,{"one":["000 мільярд",3],"few":["000 мільярди",3],"many":["000 мільярдів",3],"other":["000 мільярда",3]}],[1000000000000,{"one":["0 трильйон",1],"few":["0 трильйони",1],"many":["0 трильйонів",1],"other":["0 трильйона",1]}],[10000000000000,{"one":["00 трильйон",2],"few":["00 трильйони",2],"many":["00 трильйонів",2],"other":["00 трильйона",2]}],[100000000000000,{"one":["000 трильйон",3],"few":["000 трильйони",3],"many":["000 трильйонів",3],"other":["000 трильйона",3]}]],"short":[[1000,{"one":["0 тис'.'",1],"few":["0 тис'.'",1],"many":["0 тис'.'",1],"other":["0 тис'.'",1]}],[10000,{"one":["00 тис'.'",2],"few":["00 тис'.'",2],"many":["00 тис'.'",2],"other":["00 тис'.'",2]}],[100000,{"one":["000 тис'.'",3],"few":["000 тис'.'",3],"many":["000 тис'.'",3],"other":["000 тис'.'",3]}],[1000000,{"one":["0 млн",1],"few":["0 млн",1],"many":["0 млн",1],"other":["0 млн",1]}],[10000000,{"one":["00 млн",2],"few":["00 млн",2],"many":["00 млн",2],"other":["00 млн",2]}],[100000000,{"one":["000 млн",3],"few":["000 млн",3],"many":["000 млн",3],"other":["000 млн",3]}],[1000000000,{"one":["0 млрд",1],"few":["0 млрд",1],"many":["0 млрд",1],"other":["0 млрд",1]}],[10000000000,{"one":["00 млрд",2],"few":["00 млрд",2],"many":["00 млрд",2],"other":["00 млрд",2]}],[100000000000,{"one":["000 млрд",3],"few":["000 млрд",3],"many":["000 млрд",3],"other":["000 млрд",3]}],[1000000000000,{"one":["0 трлн",1],"few":["0 трлн",1],"many":["0 трлн",1],"other":["0 трлн",1]}],[10000000000000,{"one":["00 трлн",2],"few":["00 трлн",2],"many":["00 трлн",2],"other":["00 трлн",2]}],[100000000000000,{"one":["000 трлн",3],"few":["000 трлн",3],"many":["000 трлн",3],"other":["000 трлн",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"ur","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ہزار",1],"other":["0 ہزار",1]}],[10000,{"one":["00 ہزار",2],"other":["00 ہزار",2]}],[100000,{"one":["0 لاکھ",1],"other":["0 لاکھ",1]}],[1000000,{"one":["00 لاکھ",2],"other":["00 لاکھ",2]}],[10000000,{"one":["0 کروڑ",1],"other":["0 کروڑ",1]}],[100000000,{"one":["00 کروڑ",2],"other":["00 کروڑ",2]}],[1000000000,{"one":["0 ارب",1],"other":["0 ارب",1]}],[10000000000,{"one":["00 ارب",2],"other":["00 ارب",2]}],[100000000000,{"one":["0 کھرب",1],"other":["0 کھرب",1]}],[1000000000000,{"one":["00 کھرب",2],"other":["00 کھرب",2]}],[10000000000000,{"one":["00 ٹریلین",2],"other":["00 ٹریلین",2]}],[100000000000000,{"one":["000 ٹریلین",3],"other":["000 ٹریلین",3]}]],"short":[[1000,{"one":["0 ہزار",1],"other":["0 ہزار",1]}],[10000,{"one":["00 ہزار",2],"other":["00 ہزار",2]}],[100000,{"one":["0 لاکھ",1],"other":["0 لاکھ",1]}],[1000000,{"one":["00 لاکھ",2],"other":["00 لاکھ",2]}],[10000000,{"one":["0 کروڑ",1],"other":["0 کروڑ",1]}],[100000000,{"one":["00 کروڑ",2],"other":["00 کروڑ",2]}],[1000000000,{"one":["0 ارب",1],"other":["0 ارب",1]}],[10000000000,{"one":["00 ارب",2],"other":["00 ارب",2]}],[100000000000,{"one":["0 کھرب",1],"other":["0 کھرب",1]}],[1000000000000,{"one":["00 کھرب",2],"other":["00 کھرب",2]}],[10000000000000,{"one":["00 ٹریلین",2],"other":["00 ٹریلین",2]}],[100000000000000,{"one":["000 ٹریلین",3],"other":["000 ٹریلین",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"ur-IN","parentLocale":"ur"});

IntlMessageFormat.__addLocaleData({"locale":"uz","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 ming",1],"other":["0 ming",1]}],[10000,{"one":["00 ming",2],"other":["00 ming",2]}],[100000,{"one":["000 ming",3],"other":["000 ming",3]}],[1000000,{"one":["0 million",1],"other":["0 million",1]}],[10000000,{"one":["00 million",2],"other":["00 million",2]}],[100000000,{"one":["000 million",3],"other":["000 million",3]}],[1000000000,{"one":["0 milliard",1],"other":["0 milliard",1]}],[10000000000,{"one":["00 milliard",2],"other":["00 milliard",2]}],[100000000000,{"one":["000 milliard",3],"other":["000 milliard",3]}],[1000000000000,{"one":["0 trillion",1],"other":["0 trillion",1]}],[10000000000000,{"one":["00 trillion",2],"other":["00 trillion",2]}],[100000000000000,{"one":["000 trillion",3],"other":["000 trillion",3]}]],"short":[[1000,{"one":["0 ming",1],"other":["0 ming",1]}],[10000,{"one":["00 ming",2],"other":["00 ming",2]}],[100000,{"one":["000 ming",3],"other":["000 ming",3]}],[1000000,{"one":["0 mln",1],"other":["0 mln",1]}],[10000000,{"one":["00 mln",2],"other":["00 mln",2]}],[100000000,{"one":["000 mln",3],"other":["000 mln",3]}],[1000000000,{"one":["0 mlrd",1],"other":["0 mlrd",1]}],[10000000000,{"one":["00 mlrd",2],"other":["00 mlrd",2]}],[100000000000,{"one":["000 mlrd",3],"other":["000 mlrd",3]}],[1000000000000,{"one":["0 trln",1],"other":["0 trln",1]}],[10000000000000,{"one":["00 trln",2],"other":["00 trln",2]}],[100000000000000,{"one":["000 trln",3],"other":["000 trln",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"uz-Arab","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"uz-Cyrl","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 минг",1],"other":["0 минг",1]}],[10000,{"one":["00 минг",2],"other":["00 минг",2]}],[100000,{"one":["000 минг",3],"other":["000 минг",3]}],[1000000,{"one":["0 миллион",1],"other":["0 миллион",1]}],[10000000,{"one":["00 миллион",2],"other":["00 миллион",2]}],[100000000,{"one":["000 миллион",3],"other":["000 миллион",3]}],[1000000000,{"one":["0 миллиард",1],"other":["0 миллиард",1]}],[10000000000,{"one":["00 миллиард",2],"other":["00 миллиард",2]}],[100000000000,{"one":["000 миллиард",3],"other":["000 миллиард",3]}],[1000000000000,{"one":["0 трилион",1],"other":["0 трилион",1]}],[10000000000000,{"one":["00 трилион",2],"other":["00 трилион",2]}],[100000000000000,{"one":["000 трилион",3],"other":["000 трилион",3]}]],"short":[[1000,{"one":["0минг",1],"other":["0минг",1]}],[10000,{"one":["00минг",2],"other":["00минг",2]}],[100000,{"one":["000минг",3],"other":["000минг",3]}],[1000000,{"one":["0млн",1],"other":["0млн",1]}],[10000000,{"one":["00млн",2],"other":["00млн",2]}],[100000000,{"one":["000млн",3],"other":["000млн",3]}],[1000000000,{"one":["0млрд",1],"other":["0млрд",1]}],[10000000000,{"one":["00млрд",2],"other":["00млрд",2]}],[100000000000,{"one":["000млрд",3],"other":["000млрд",3]}],[1000000000000,{"one":["0трлн",1],"other":["0трлн",1]}],[10000000000000,{"one":["00трлн",2],"other":["00трлн",2]}],[100000000000000,{"one":["000трлн",3],"other":["000трлн",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"uz-Latn","parentLocale":"uz"});

IntlMessageFormat.__addLocaleData({"locale":"vai","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"vai-Latn","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"vai-Vaii","parentLocale":"vai"});

IntlMessageFormat.__addLocaleData({"locale":"ve","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"vi","pluralRuleFunction":function (n,ord){if(ord)return n==1?"one":"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0 nghìn",1]}],[10000,{"other":["00 nghìn",2]}],[100000,{"other":["000 nghìn",3]}],[1000000,{"other":["0 triệu",1]}],[10000000,{"other":["00 triệu",2]}],[100000000,{"other":["000 triệu",3]}],[1000000000,{"other":["0 tỷ",1]}],[10000000000,{"other":["00 tỷ",2]}],[100000000000,{"other":["000 tỷ",3]}],[1000000000000,{"other":["0 nghìn tỷ",1]}],[10000000000000,{"other":["00 nghìn tỷ",2]}],[100000000000000,{"other":["000 nghìn tỷ",3]}]],"short":[[1000,{"other":["0 N",1]}],[10000,{"other":["00 N",2]}],[100000,{"other":["000 N",3]}],[1000000,{"other":["0 Tr",1]}],[10000000,{"other":["00 Tr",2]}],[100000000,{"other":["000 Tr",3]}],[1000000000,{"other":["0 T",1]}],[10000000000,{"other":["00 T",2]}],[100000000000,{"other":["000 T",3]}],[1000000000000,{"other":["0 NT",1]}],[10000000000000,{"other":["00 NT",2]}],[100000000000000,{"other":["000 NT",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"vo","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"vun","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"wa","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==0||n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"wae","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"wo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"xh","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"xog","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"yav","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"yi","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1];if(ord)return"other";return n==1&&v0?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"yo","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"yo-BJ","parentLocale":"yo"});

IntlMessageFormat.__addLocaleData({"locale":"yue","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0萬",1]}],[100000,{"other":["00萬",2]}],[1000000,{"other":["000萬",3]}],[10000000,{"other":["0000萬",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0萬",1]}],[100000,{"other":["00萬",2]}],[1000000,{"other":["000萬",3]}],[10000000,{"other":["0000萬",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"yue-Hans","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"yue-Hant","parentLocale":"yue"});

IntlMessageFormat.__addLocaleData({"locale":"zgh","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0G",1]}],[10000000000,{"other":["00G",2]}],[100000000000,{"other":["000G",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});

IntlMessageFormat.__addLocaleData({"locale":"zh","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hans","parentLocale":"zh"});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hans-HK","parentLocale":"zh-Hans","numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0万亿",1]}],[10000000000000,{"other":["00万亿",2]}],[100000000000000,{"other":["000万亿",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0万",1]}],[100000,{"other":["00万",2]}],[1000000,{"other":["000万",3]}],[10000000,{"other":["0000万",4]}],[100000000,{"other":["0亿",1]}],[1000000000,{"other":["00亿",2]}],[10000000000,{"other":["000亿",3]}],[100000000000,{"other":["0000亿",4]}],[1000000000000,{"other":["0万亿",1]}],[10000000000000,{"other":["00万亿",2]}],[100000000000000,{"other":["000万亿",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hans-MO","parentLocale":"zh-Hans"});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hans-SG","parentLocale":"zh-Hans"});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hant","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0萬",1]}],[100000,{"other":["00萬",2]}],[1000000,{"other":["000萬",3]}],[10000000,{"other":["0000萬",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0",1]}],[10000,{"other":["0萬",1]}],[100000,{"other":["00萬",2]}],[1000000,{"other":["000萬",3]}],[10000000,{"other":["0000萬",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hant-HK","parentLocale":"zh-Hant","numbers":{"decimal":{"long":[[1000,{"other":["0",1]}],[10000,{"other":["0萬",1]}],[100000,{"other":["00萬",2]}],[1000000,{"other":["000萬",3]}],[10000000,{"other":["0000萬",4]}],[100000000,{"other":["0億",1]}],[1000000000,{"other":["00億",2]}],[10000000000,{"other":["000億",3]}],[100000000000,{"other":["0000億",4]}],[1000000000000,{"other":["0兆",1]}],[10000000000000,{"other":["00兆",2]}],[100000000000000,{"other":["000兆",3]}]],"short":[[1000,{"other":["0K",1]}],[10000,{"other":["00K",2]}],[100000,{"other":["000K",3]}],[1000000,{"other":["0M",1]}],[10000000,{"other":["00M",2]}],[100000000,{"other":["000M",3]}],[1000000000,{"other":["0B",1]}],[10000000000,{"other":["00B",2]}],[100000000000,{"other":["000B",3]}],[1000000000000,{"other":["0T",1]}],[10000000000000,{"other":["00T",2]}],[100000000000000,{"other":["000T",3]}]]}}});
IntlMessageFormat.__addLocaleData({"locale":"zh-Hant-MO","parentLocale":"zh-Hant-HK"});

IntlMessageFormat.__addLocaleData({"locale":"zu","pluralRuleFunction":function (n,ord){if(ord)return"other";return n>=0&&n<=1?"one":"other"},"numbers":{"decimal":{"long":[[1000,{"one":["0 inkulungwane",1],"other":["0 inkulungwane",1]}],[10000,{"one":["00 inkulungwane",2],"other":["00 inkulungwane",2]}],[100000,{"one":["000 inkulungwane",3],"other":["000 inkulungwane",3]}],[1000000,{"one":["0 isigidi",1],"other":["0 isigidi",1]}],[10000000,{"one":["00 isigidi",2],"other":["00 isigidi",2]}],[100000000,{"one":["000 isigidi",3],"other":["000 isigidi",3]}],[1000000000,{"one":["0 isigidi sezigidi",1],"other":["0 isigidi sezigidi",1]}],[10000000000,{"one":["00 isigidi sezigidi",2],"other":["00 isigidi sezigidi",2]}],[100000000000,{"one":["000 isigidi sezigidi",3],"other":["000 isigidi sezigidi",3]}],[1000000000000,{"one":["0 isigidintathu",1],"other":["0 isigidintathu",1]}],[10000000000000,{"one":["00 isigidintathu",2],"other":["00 isigidintathu",2]}],[100000000000000,{"one":["000 isigidintathu",3],"other":["000 isigidintathu",3]}]],"short":[[1000,{"one":["0K",1],"other":["0K",1]}],[10000,{"one":["00K",2],"other":["00K",2]}],[100000,{"one":["000K",3],"other":["000K",3]}],[1000000,{"one":["0M",1],"other":["0M",1]}],[10000000,{"one":["00M",2],"other":["00M",2]}],[100000000,{"one":["000M",3],"other":["000M",3]}],[1000000000,{"one":["0B",1],"other":["0B",1]}],[10000000000,{"one":["00B",2],"other":["00B",2]}],[100000000000,{"one":["000B",3],"other":["000B",3]}],[1000000000000,{"one":["0T",1],"other":["0T",1]}],[10000000000000,{"one":["00T",2],"other":["00T",2]}],[100000000000000,{"one":["000T",3],"other":["000T",3]}]]}}});

//# sourceMappingURL=intl-messageformat-with-locales.js.map