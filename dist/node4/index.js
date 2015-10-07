'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _srcTemplate = require('./src/Template');

var _srcTemplate2 = _interopRequireDefault(_srcTemplate);

var _srcNodeFilesystem = require('./src/NodeFilesystem');

var _srcNodeFilesystem2 = _interopRequireDefault(_srcNodeFilesystem);

var _srcNodePath = require('./src/NodePath');

var _srcNodePath2 = _interopRequireDefault(_srcNodePath);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

const supportES5 = _semver2.default.lt(process.versions.node, '4.0.0');
const preload = supportES5 ? Promise.resolve(require('babel-core/polyfill')) : Promise.resolve();

class Arc {
    constructor(options) {
        options = options || {};
        this.filesystem = options.filesystem || new _srcNodeFilesystem2.default();
        this.path = options.pathsystem || new _srcNodePath2.default();
        this.escape = options.escape || _lodash2.default.escape;
        this.supportES5 = supportES5;
    }

    evaluateString(text, data, filename) {
        return preload.then(() => _srcTemplate2.default.fromString(this, text, filename).evaluate(data));
    }

    evaluateFile(filename, data) {
        return preload.then(() => _srcTemplate2.default.fromFile(this, filename).evaluate(data));
    }

    compileString(text, filename) {
        return preload.then(() => _srcTemplate2.default.fromString(this, text, filename).compile());
    }

    compileFile(filename) {
        return preload.then(() => _srcTemplate2.default.fromFile(this, filename).compile());
    }
}

exports.default = Arc;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
