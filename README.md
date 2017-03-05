# PromiseAggregator

#### Problem to be solved

When several entry points trigger an async promise in many cases those promises should not run in parallel, when called several times.
Scenarios I had in mind:

* HTTP Get calls
* Database Queries
* Subprocess communication

#### Install

```javascript
npm install --save promise-aggregate
```

#### Example

Starting from a typical GET Wrapper
```javascript
const getUserAccount = function(userId) {
    return axios.get('/user/' + userId);
};
```

just wrap the lines with promise-aggregator
```javascript
const aggregate = require('promise-aggregate');
const getUserAccount = aggregate(function(userId) {
    return axios.get('/user/' + userId);
});
```

#### How does it work?

The aggregate(cb) call wraps a function, which has to return a promise, and aggregates all calls of the returned function until the wrapped promise function is either resolved or rejected. All calls of the wrapper function get exactly resolved or rejected in the same way with the same arguments as the wrapped function promise.
There is one one aggregation per argument set. To achieve this, arguments get stringified. So avoid calling the aggregatior with different functions as argument or they will get messed up.

#### License

MIT