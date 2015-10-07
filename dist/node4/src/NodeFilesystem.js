'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

const readFileAsync = _bluebird2.default.promisify(_fs2.default.readFile);

class NodeFilesystem {
    readFile(path) {
        return readFileAsync(path, 'utf8');
    }
}

exports.default = NodeFilesystem;
module.exports = exports.default;
//# sourceMappingURL=NodeFilesystem.js.map
