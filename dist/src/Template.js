'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Compiler = require('./Compiler');

var _Compiler2 = _interopRequireDefault(_Compiler);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

class RawString {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

/**
 * A compiled template.
 */
class Template {
    constructor(compiler, evaluate, data, child, escape) {
        this._ = _lodash2.default;
        this._compiler = compiler;
        this._evaluate = _bluebird2.default.coroutine(evaluate);
        this.data = data || {};
        this.child = child;
        this._result = {
            content: ''
        };
        this._currentBlock = 'content';
        this._locals = {
            _: this._,
            raw: this.raw
        };
    }

    _execute() {
        return this._evaluate().then(() => {
            if (this._layout === undefined) {
                return this._result;
            }
            return new _Compiler2.default(this._compiler.arc, this._compiler.joinedPath(this._layout), this.data, this._result).load();
        });
    }

    _appendRaw(str) {
        if (this._result[this._currentBlock] === undefined) {
            this._result[this._currentBlock] = str;
        } else {
            this._result[this._currentBlock] += str;
        }
    }

    _append(str) {
        if (str instanceof RawString) {
            this._appendRaw(str);
        } else {
            this._appendRaw(this._compiler.arc.escape(str));
        }
    }

    raw(str) {
        return new RawString(str);
    }

    _partial(path) {
        return new _Compiler2.default(this._compiler.arc, this._compiler.joinedPath(path), this.data).load();
    }
}

exports.default = Template;
module.exports = exports.default;
//# sourceMappingURL=Template.js.map
