'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _Lexer = require('./Lexer');

var _Lexer2 = _interopRequireDefault(_Lexer);

var _Context = require('./Context');

var _Context2 = _interopRequireDefault(_Context);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var MISSING_FILENAME = '<string>';
var globalEval = eval;

function nameOrExpression(token, defaultIfEmpty) {
    var value = token.value.trim();
    if (value === '') {
        if (defaultIfEmpty !== undefined) {
            value = defaultIfEmpty;
        } else {
            throw new Error(token.begin + ': ' + token.token + ' tag must contain a name or expression.');
        }
    }
    return value.startsWith('(') ? value : JSON.stringify(value);
}

function _compile(text, filename) {
    var lexer = new _Lexer2['default'](text, filename);
    var buffer = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = _getIterator(lexer.lex()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var token = _step.value;

            switch (token.token) {
                case _tokens2['default'].DOCUMENT:
                    buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');');
                    break;
                case _tokens2['default'].EXPRESSION:
                    buffer.push('this._append(' + token.value + ');');
                    break;
                case _tokens2['default'].JAVASCRIPT:
                    buffer.push(token.value + ';');
                    break;
                case _tokens2['default'].LAYOUT:
                    buffer.push('this._layout = ' + nameOrExpression(token) + ';');
                    break;
                case _tokens2['default'].BLOCK_REFERENCE:
                    buffer.push('this._appendRaw(this.child[' + nameOrExpression(token, 'content') + '] || "");');
                    break;
                case _tokens2['default'].BLOCK_NAME:
                    buffer.push('this._currentBlock = ' + nameOrExpression(token) + ';');
                    break;
                case _tokens2['default'].PARTIAL:
                    buffer.push('this.partial = this._locals.partial = yield this._partial(' + nameOrExpression(token) + ');');
                    buffer.push('this._appendRaw(this._locals.partial.content);');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
                _iterator['return']();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return buffer.join('\n');
}

var Template = (function () {
    function Template(arc) {
        _classCallCheck(this, Template);

        this.arc = arc;
    }

    _createClass(Template, [{
        key: 'load',
        value: function load() {
            var _this = this;

            if (this.text !== undefined) {
                return _bluebird2['default'].resolve(this.text);
            } else {
                return this.arc.filesystem.readFile(this.filename).then(function (text) {
                    return _this.text = text;
                });
            }
        }
    }, {
        key: 'compile',
        value: function compile() {
            var _this2 = this;

            return this.load().then(function (text) {
                // As much as I dislike eval, GeneratorFunction.constructor isn't working yet for Node *or* Babel.
                // The awkward extra function wrapper for ES5 is required because Babel does not yet support 'with' statements within generator functions.
                var funcText = _this2.arc.supportES5 ? '(function () { with (this._locals) with (this.data) { return (function *() {\n' + _compile(text, _this2.filename) + '\n}).bind(this); } })' : '(function *() { with (this._locals) with (this.data) {\n' + _compile(text, _this2.filename) + '\n} })';
                var func = _this2.arc.supportES5 ? globalEval(require('babel-core').transform(funcText, { blacklist: ['strict'], optional: ['runtime'] }).code) : globalEval(funcText);
                var context = new _Context2['default'](_this2, func, _this2.filename);
                return context._execute.bind(context);
            });
        }
    }, {
        key: 'evaluate',
        value: function evaluate(data, child) {
            return this.compile().then(function (execute) {
                return execute(data, child);
            });
        }
    }, {
        key: 'joinedPath',
        value: function joinedPath(path) {
            if (this.filename === MISSING_FILENAME) {
                return path;
            }
            return this.arc.path.join(this.arc.path.dirname(this.filename), path);
        }
    }, {
        key: 'filename',
        get: function get() {
            return this._filename || MISSING_FILENAME;
        },
        set: function set(value) {
            this._filename = value;
        }
    }], [{
        key: 'fromFile',
        value: function fromFile(arc, filename) {
            var result = new Template(arc);
            result.filename = filename;
            return result;
        }
    }, {
        key: 'fromString',
        value: function fromString(arc, text, filename) {
            var result = new Template(arc);
            result.text = text;
            result.filename = filename;
            return result;
        }
    }]);

    return Template;
})();

exports['default'] = Template;
module.exports = exports['default'];
//# sourceMappingURL=Template.js.map
