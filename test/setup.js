// loading test modules
chai = require('chai');
sinon = require('sinon');

// configure chai
chai.config.includeStack = true;
assert = Object.assign({}, chai.assert, sinon.assert);
