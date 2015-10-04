'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _srcCompiler = require('./src/Compiler');

var _srcCompiler2 = _interopRequireDefault(_srcCompiler);

var _srcNodeFilesystem = require('./src/NodeFilesystem');

var _srcNodeFilesystem2 = _interopRequireDefault(_srcNodeFilesystem);

var _srcNodePath = require('./src/NodePath');

var _srcNodePath2 = _interopRequireDefault(_srcNodePath);

class Arc {
    constructor(filesystem, pathsystem, escape) {
        this.filesystem = filesystem || new _srcNodeFilesystem2.default();
        this.path = pathsystem || new _srcNodePath2.default();
        this.escape = escape || _lodash2.default.escape;
    }

    parse(text, data, filename) {
        return new _srcCompiler2.default(this, filename, data).parse(text);
    }

    load(filename, data) {
        return new _srcCompiler2.default(this, filename, data).load();
    }
}

exports.default = Arc;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
