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

    function wrapper(...args) {

        runningPromise = runningPromise || cb.apply(undefined, args)
                .then(onEnd)
                .catch(onFail);

        return newAggregation();
    }

    return wrapper;
};


const argumentInstanceFactory = (cb, stringify = JSON.stringify) => {

    const instances = new Map();

    function wrapper(...args) {

        const key = stringify(args);

        if (!instances.has(key)) {
            instances.set(key, instanceFactory(cb));
        }

        return instances.get(key).apply(undefined, args);
    }

    return wrapper;

};

module.exports = argumentInstanceFactory;