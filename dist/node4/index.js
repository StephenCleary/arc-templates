'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

require('babel-core/polyfill');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _srcTemplate = require('./src/Template');

var _srcTemplate2 = _interopRequireDefault(_srcTemplate);

var _srcNodeFilesystem = require('./src/NodeFilesystem');

var _srcNodeFilesystem2 = _interopRequireDefault(_srcNodeFilesystem);

var _srcNodePath = require('./src/NodePath');

var _srcNodePath2 = _interopRequireDefault(_srcNodePath);

var Arc = (function () {
    function Arc(filesystem, pathsystem, escape) {
        _classCallCheck(this, Arc);

        this.filesystem = filesystem || new _srcNodeFilesystem2['default']();
        this.path = pathsystem || new _srcNodePath2['default']();
        this.escape = escape || _lodash2['default'].escape;
    }

    _createClass(Arc, [{
        key: 'evaluateString',
        value: function evaluateString(text, data, filename) {
            return _srcTemplate2['default'].fromString(this, text, filename).evaluate(data);
        }
    }, {
        key: 'evaluateFile',
        value: function evaluateFile(filename, data) {
            return _srcTemplate2['default'].fromFile(this, filename).evaluate(data);
        }
    }, {
        key: 'compileString',
        value: function compileString(text, filename) {
            return _srcTemplate2['default'].fromString(this, text, filename).compile();
        }
    }, {
        key: 'compileFile',
        value: function compileFile(filename) {
            return _srcTemplate2['default'].fromFile(this, filename).compile();
        }
    }]);

    return Arc;
})();

exports['default'] = Arc;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
