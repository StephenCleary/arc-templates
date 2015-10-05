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

class Arc {
    constructor(filesystem, pathsystem, escape) {
        this.filesystem = filesystem || new _srcNodeFilesystem2.default();
        this.path = pathsystem || new _srcNodePath2.default();
        this.escape = escape || _lodash2.default.escape;
    }

    evaluateString(text, data, filename) {
        return _srcTemplate2.default.fromString(this, text, filename).evaluate(data);
    }

    evaluateFile(filename, data) {
        return _srcTemplate2.default.fromFile(this, filename).evaluate(data);
    }

    compileString(text, filename) {
        return _srcTemplate2.default.fromString(this, text, filename).compile();
    }

    compileFile(filename) {
        return _srcTemplate2.default.fromFile(this, filename).compile();
    }
}

exports.default = Arc;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
