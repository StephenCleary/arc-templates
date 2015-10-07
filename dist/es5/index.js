'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

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

var supportES5 = _semver2['default'].lt(process.versions.node, '4.0.0');
var preload = supportES5 ? _Promise.resolve(require('babel-core/polyfill')) : _Promise.resolve();

var Arc = (function () {
    function Arc(options) {
        _classCallCheck(this, Arc);

        options = options || {};
        this.filesystem = options.filesystem || new _srcNodeFilesystem2['default']();
        this.path = options.pathsystem || new _srcNodePath2['default']();
        this.escape = options.escape || _lodash2['default'].escape;
        this.supportES5 = supportES5;
    }

    _createClass(Arc, [{
        key: 'evaluateString',
        value: function evaluateString(text, data, filename) {
            var _this = this;

            return preload.then(function () {
                return _srcTemplate2['default'].fromString(_this, text, filename).evaluate(data);
            });
        }
    }, {
        key: 'evaluateFile',
        value: function evaluateFile(filename, data) {
            var _this2 = this;

            return preload.then(function () {
                return _srcTemplate2['default'].fromFile(_this2, filename).evaluate(data);
            });
        }
    }, {
        key: 'compileString',
        value: function compileString(text, filename) {
            var _this3 = this;

            return preload.then(function () {
                return _srcTemplate2['default'].fromString(_this3, text, filename).compile();
            });
        }
    }, {
        key: 'compileFile',
        value: function compileFile(filename) {
            var _this4 = this;

            return preload.then(function () {
                return _srcTemplate2['default'].fromFile(_this4, filename).compile();
            });
        }
    }]);

    return Arc;
})();

exports['default'] = Arc;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
