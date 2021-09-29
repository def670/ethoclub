(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MemoizeExpiring = exports.Memoize = void 0;
    function Memoize(autoHashOrHashFn) {
        return function (target, propertyKey, descriptor) {
            if (descriptor.value != null) {
                descriptor.value = getNewFunction(descriptor.value, autoHashOrHashFn);
            }
            else if (descriptor.get != null) {
                descriptor.get = getNewFunction(descriptor.get, autoHashOrHashFn);
            }
            else {
                throw 'Only put a Memoize() decorator on a method or get accessor.';
            }
        };
    }
    exports.Memoize = Memoize;
    function MemoizeExpiring(duration, autoHashOrHashFn) {
        return function (target, propertyKey, descriptor) {
            if (descriptor.value != null) {
                descriptor.value = getNewFunction(descriptor.value, autoHashOrHashFn, duration);
            }
            else if (descriptor.get != null) {
                descriptor.get = getNewFunction(descriptor.get, autoHashOrHashFn, duration);
            }
            else {
                throw 'Only put a Memoize() decorator on a method or get accessor.';
            }
        };
    }
    exports.MemoizeExpiring = MemoizeExpiring;
    var counter = 0;
    function getNewFunction(originalMethod, autoHashOrHashFn, duration) {
        if (duration === void 0) { duration = 0; }
        var identifier = ++counter;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var propValName = "__memoized_value_" + identifier;
            var propMapName = "__memoized_map_" + identifier;
            var returnedValue;
            if (autoHashOrHashFn || args.length > 0 || duration > 0) {
                if (!this.hasOwnProperty(propMapName)) {
                    Object.defineProperty(this, propMapName, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: new Map()
                    });
                }
                var myMap = this[propMapName];
                var hashKey = void 0;
                if (autoHashOrHashFn === true) {
                    hashKey = args.map(function (a) { return a.toString(); }).join('!');
                }
                else if (autoHashOrHashFn) {
                    hashKey = autoHashOrHashFn.apply(this, args);
                }
                else {
                    hashKey = args[0];
                }
                var timestampKey = hashKey + "__timestamp";
                var isExpired = false;
                if (duration > 0) {
                    if (!myMap.has(timestampKey)) {
                        isExpired = true;
                    }
                    else {
                        var timestamp = myMap.get(timestampKey);
                        isExpired = (Date.now() - timestamp) > duration;
                    }
                }
                if (myMap.has(hashKey) && !isExpired) {
                    returnedValue = myMap.get(hashKey);
                }
                else {
                    returnedValue = originalMethod.apply(this, args);
                    myMap.set(hashKey, returnedValue);
                    if (duration > 0) {
                        myMap.set(timestampKey, Date.now());
                    }
                }
            }
            else {
                if (this.hasOwnProperty(propValName)) {
                    returnedValue = this[propValName];
                }
                else {
                    returnedValue = originalMethod.apply(this, args);
                    Object.defineProperty(this, propValName, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: returnedValue
                    });
                }
            }
            return returnedValue;
        };
    }
});
//# sourceMappingURL=memoize-decorator.js.map