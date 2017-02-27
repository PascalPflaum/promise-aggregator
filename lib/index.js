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
        if (!runningPromise) {
            runningPromise = cb().then(onEnd).catch(onFail);
        }
        return newAggregation();
    }

    return wrapper;
};

module.exports = instanceFactory;