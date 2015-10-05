'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Template = require('./Template');

var _Template2 = _interopRequireDefault(_Template);

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
 * The context in which a template executes.
 */
class Context {
    constructor(template, evaluate, filename) {
        this._ = _lodash2.default;
        this._template = template;
        this._evaluate = _bluebird2.default.coroutine(evaluate);
        this._filename = filename;
        this._locals = {
            _: this._,
            raw: this.raw
        };
    }

    _execute(data, child) {
        this._result = {
            content: ''
        };
        this._currentBlock = 'content';
        this.data = data || {};
        this.child = this._locals.child = child;
        return this._evaluate().then(() => {
            if (this._layout === undefined) {
                return this._result;
            }
            return _Template2.default.fromFile(this._template.arc, this._template.joinedPath(this._layout)).evaluate(this.data, this._result);
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
            this._appendRaw(this._template.arc.escape(str));
        }
    }

    raw(str) {
        return new RawString(str);
    }

    _partial(path) {
        return _Template2.default.fromFile(this._template.arc, this._template.joinedPath(path)).evaluate(this.data);
    }
}

exports.default = Context;
module.exports = exports.default;
//# sourceMappingURL=Context.js.map
