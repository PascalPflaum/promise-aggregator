const instanceFactory = (cb) => {
    let runningPromise = null;
    let aggregations = [];

    function buildCB(method) {
        return function () {
            aggregations.forEach((aggregation) => {
                aggregation[method].apply(this, arguments);
            });
            runningPromise = null;
            aggregations = [];
        };
    }

    const onEnd = buildCB('resolve');
    const onFail = buildCB('reject');

    const newAggregation = () => {
        return new Promise(function (resolve, reject) {
            aggregations.push({
                resolve,
                reject,
            });
        });
    };

    function wrapper() {
        if (!runningPromise) {
            runningPromise = cb()
                .then(onEnd)
                .catch(onFail);
        }
        return newAggregation();
    }

    return wrapper;
};

module.exports = instanceFactory;
