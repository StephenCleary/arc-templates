'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var readFileAsync = _bluebird2['default'].promisify(_fs2['default'].readFile);

var NodeFilesystem = (function () {
    function NodeFilesystem() {
        _classCallCheck(this, NodeFilesystem);
    }

    _createClass(NodeFilesystem, [{
        key: 'readFile',
        value: function readFile(path) {
            return readFileAsync(path, 'utf8');
        }
    }]);

    return NodeFilesystem;
})();

exports['default'] = NodeFilesystem;
module.exports = exports['default'];
//# sourceMappingURL=NodeFilesystem.js.map
