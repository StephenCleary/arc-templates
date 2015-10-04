'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

class NodePath {
    dirname(str) {
        return _path2.default.dirname(str);
    }

    join() {
        return _path2.default.join.apply(_path2.default, arguments);
    }
}

exports.default = NodePath;
module.exports = exports.default;
//# sourceMappingURL=NodePath.js.map
