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
});
