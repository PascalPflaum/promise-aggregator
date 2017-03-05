const aggregator = require('../../src');

const autoResolver = (data) => {
    return (resolve) => {
        resolve(data);
    };
};

const autoRejecter = (data) => {
    return (resolve, reject) => {
        reject(data);
    };
};

const autoResolverDelayed = (data) => {
    return (resolve) => {
        setTimeout(() => {
            resolve(data);
        });
    };
};

const autoRejecterDelayed = (data) => {
    return (resolve, reject) => {
        setTimeout(() => {
            reject(data);
        });
    };
};

describe('simple run', function () {
    describe('without payload', function () {
        it('then is called, if promise is resolved', function () {
            const aggregation = aggregator(function () {
                return new Promise(autoResolver());
            });

            const spy = sinon.spy();

            return aggregation()
                .then(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                });
        });

        it('catch is called, if promise is rejected', function () {
            const aggregation = aggregator(function () {
                return new Promise(autoRejecter());
            });

            const spy = sinon.spy();

            return aggregation()
                .catch(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                });
        });
    });

    describe('with payload', function () {
        it('then is called, if promise is resolved', function () {
            const aggregation = aggregator(function () {
                return new Promise(autoResolver('test'));
            });

            const spy = sinon.spy();

            return aggregation()
                .then(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                    assert.ok(spy.calledWith('test'));
                });
        });

        it('catch is called, if promise is rejected', function () {
            const aggregation = aggregator(function () {
                return new Promise(autoRejecter('test'));
            });

            const spy = sinon.spy();

            return aggregation()
                .catch(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                    assert.ok(spy.calledWith('test'));
                });
        });
    });
});

describe('two runs', function () {
    describe('first finished', function () {
        it('then is called, if promise is resolved', function () {
            const spy = sinon.spy();

            function runner() {
                return new Promise(autoResolver());
            }

            const runnerSpy = sinon.spy(runner);

            const aggregation = aggregator(runnerSpy);
            return aggregation()
                .then(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                    assert.ok(runnerSpy.calledOnce);
                }).then(() => {
                    return aggregation();
                })
                .then(spy)
                .then(() => {
                    assert.ok(spy.calledTwice);
                    assert.ok(runnerSpy.calledTwice);
                });
        });
    });

    describe('first ongoing', function () {
        it('then is called, if promise is resolved', function () {
            function runner() {
                return new Promise(autoResolverDelayed('test'));
            }

            const runnerSpy = sinon.spy(runner);
            const aggregation = aggregator(runnerSpy);

            return Promise.all([
                aggregation(),
                aggregation(),
            ])
                .then((data) => {
                    assert.ok(runnerSpy.calledOnce);
                    assert.deepEqual(data, ['test', 'test']);
                });
        });

        it('catch is called, if promise is rejected', function () {
            function runner() {
                return new Promise(autoRejecterDelayed('test'));
            }

            const runnerSpy = sinon.spy(runner);

            const catchSpy = sinon.spy((data) => {
                assert.equal(data, 'test');
            });

            const aggregation = aggregator(runnerSpy);

            return Promise.all([
                aggregation().catch(catchSpy),
                aggregation().catch(catchSpy),
            ])
                .then(() => {
                    assert.ok(runnerSpy.calledOnce);
                    assert.ok(catchSpy.calledTwice);
                });
        });
    });


    describe('arguments', function () {

        it('arguments get forwarded', function () {

            const shouldBeArgs = [
                1,
                '!',
                () => {
                },
            ];

            const aggregation = aggregator(function (...args) {
                assert.deepEqual(args, shouldBeArgs);
                return new Promise(autoResolver());
            });

            const spy = sinon.spy();

            return aggregation.apply(undefined, shouldBeArgs)
                .then(spy)
                .then(() => {
                    assert.ok(spy.calledOnce);
                });
        });

        it('call get aggregated, when using the same parameter', function () {

            const shouldBeArgs = [
                1,
                '!',
                () => {
                },
            ];

            function runner(...args) {
                assert.deepEqual(args, shouldBeArgs);
                return new Promise(autoResolverDelayed('test'));
            }

            const runnerSpy = sinon.spy(runner);
            const aggregation = aggregator(runnerSpy);

            return Promise.all([
                aggregation.apply(undefined, shouldBeArgs),
                aggregation.apply(undefined, shouldBeArgs),
            ])
                .then((data) => {
                    assert.ok(runnerSpy.calledOnce);
                    assert.deepEqual(data, ['test', 'test']);
                });
        });

        it('two calls dont interfere', function () {

            const shouldBeArgsA = [
                1,
                '!',
                function () {
                },
            ];

            const shouldBeArgsB = [
                1,
                '!',
                '!',
            ];

            function runner() {
                return new Promise(autoResolverDelayed('test'));
            }

            const runnerSpy = sinon.spy(runner);
            const aggregation = aggregator(runnerSpy);

            return Promise.all([
                aggregation.apply(undefined, shouldBeArgsA),
                aggregation.apply(undefined, shouldBeArgsB),
            ])
                .then((data) => {
                    assert.ok(runnerSpy.calledTwice);
                    assert.deepEqual(data, ['test', 'test']);
                });

        });
    });
});
