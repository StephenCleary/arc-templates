'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Template = require('./Template');

var _Template2 = _interopRequireDefault(_Template);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var RawString = (function () {
    function RawString(value) {
        _classCallCheck(this, RawString);

        this.value = value;
    }

    /**
     * The context in which a template executes.
     */

    _createClass(RawString, [{
        key: 'toString',
        value: function toString() {
            return this.value;
        }
    }]);

    return RawString;
})();

var Context = (function () {
    function Context(template, evaluate, filename) {
        var _this = this;

        _classCallCheck(this, Context);

        this._ = _lodash2['default'];
        this._template = template;
        this._evaluate = function () {
            return _bluebird2['default'].coroutine(evaluate.call(_this)).call(_this);
        };
        this._filename = filename;
        this._locals = {
            _: this._,
            raw: this.raw
        };
    }

    _createClass(Context, [{
        key: '_execute',
        value: function _execute(data, child) {
            var _this2 = this;

            this._result = {
                content: ''
            };
            this._currentBlock = 'content';
            this.data = data || {};
            this.child = this._locals.child = child;
            return this._evaluate().then(function () {
                if (_this2._layout === undefined) {
                    return _this2._result;
                }
                return _Template2['default'].fromFile(_this2._template.arc, _this2._template.joinedPath(_this2._layout)).evaluate(_this2.data, _this2._result);
            });
        }
    }, {
        key: '_appendRaw',
        value: function _appendRaw(str) {
            if (this._result[this._currentBlock] === undefined) {
                this._result[this._currentBlock] = str;
            } else {
                this._result[this._currentBlock] += str;
            }
        }
    }, {
        key: '_append',
        value: function _append(str) {
            if (str instanceof RawString) {
                this._appendRaw(str);
            } else {
                this._appendRaw(this._template.arc.escape(str));
            }
        }
    }, {
        key: 'raw',
        value: function raw(str) {
            return new RawString(str);
        }
    }, {
        key: '_partial',
        value: function _partial(path) {
            return _Template2['default'].fromFile(this._template.arc, this._template.joinedPath(path)).evaluate(this.data);
        }
    }]);

    return Context;
})();

exports['default'] = Context;
module.exports = exports['default'];
//# sourceMappingURL=Context.js.map
