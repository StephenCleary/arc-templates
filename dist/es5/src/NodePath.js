'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var NodePath = (function () {
    function NodePath() {
        _classCallCheck(this, NodePath);
    }

    _createClass(NodePath, [{
        key: 'dirname',
        value: function dirname(str) {
            return _path2['default'].dirname(str);
        }
    }, {
        key: 'join',
        value: function join() {
            return _path2['default'].join.apply(_path2['default'], arguments);
        }
    }]);

    return NodePath;
})();

exports['default'] = NodePath;
module.exports = exports['default'];
//# sourceMappingURL=NodePath.js.map
