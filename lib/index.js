'use strict';

var instanceFactory = function instanceFactory(cb) {

    var runningPromise = null;
    var aggregations = [];

    function buildCB(method) {
        return function () {
            var _this = this,
                _arguments = arguments;

            aggregations.forEach(function (aggregation) {
                aggregation[method].apply(_this, _arguments);
            });
            runningPromise = null;
            aggregations = [];
        };
    }

    var onEnd = buildCB('resolve');
    var onFail = buildCB('reject');

    var newAggregation = function newAggregation() {
        return new Promise(function (resolve, reject) {
            aggregations.push({
                resolve: resolve,
                reject: reject
            });
        });
    };

    function wrapper() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        runningPromise = runningPromise || cb.apply(undefined, args).then(onEnd).catch(onFail);

        return newAggregation();
    }

    return wrapper;
};

var argumentInstanceFactory = function argumentInstanceFactory(cb) {
    var stringify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : JSON.stringify;


    var instances = new Map();

    function wrapper() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        var key = stringify(args);

        if (!instances.has(key)) {
            instances.set(key, instanceFactory(cb));
        }

        return instances.get(key).apply(undefined, args);
    }

    return wrapper;
};

module.exports = argumentInstanceFactory;