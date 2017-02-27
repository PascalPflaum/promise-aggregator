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
const getUserAccount = function() {
    return axios.get('/user/12345');
};
```

just wrap the lines with promise-aggregator
```javascript
const getUserAccount = aggregate(function() {
    return axios.get('/user/12345');
});
```

#### How does it work?

The aggregate(cb) call wrapps a function, which has to return a promise, and aggregates all calls of the returned function until the wrapped promise function is either resolved or rejected. All calls of the wrapper function get exactly resolved or rejected in the same way with the same arguments as the wrapped function promise.

#### Can I ...

... wrap a function that is called with arguments? - "No, that will not work. Only calls without arguments are aggregated"

#### License

MIT