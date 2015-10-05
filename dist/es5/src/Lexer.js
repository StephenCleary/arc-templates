'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _Location = require('./Location');

var _Location2 = _interopRequireDefault(_Location);

var BEGIN_EXPRESSION = '${';
var END_EXPRESSION = '}';
var BEGIN_JAVASCRIPT = '<%';
var END_JAVASCRIPT = '%>';
var BEGIN_COMMENT = '</*';
var END_COMMENT = '*/>';
var BEGIN_BLOCK = '<[';
var END_BLOCK = ']>';
var BEGIN_DOCUMENT = '<:';
var END_DOCUMENT = ':>';
var BEGIN_BLOCK_REFERENCE = '<*';
var END_BLOCK_REFERENCE = '*>';
var BEGIN_LAYOUT = '<!';
var END_LAYOUT = '!>';
var BEGIN_PARTIAL = '<(';
var END_PARTIAL = ')>';

function regex() {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
    }

    return new RegExp(values.map(function (x) {
        return _lodash2['default'].escapeRegExp(x);
    }).join('|'), 'g');
}

var rootContextRegex = regex(BEGIN_EXPRESSION, BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL, BEGIN_BLOCK, BEGIN_LAYOUT);

var documentContextRegex = regex(END_DOCUMENT, BEGIN_EXPRESSION, BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL);

var javascriptContextRegex = regex(END_JAVASCRIPT, BEGIN_COMMENT, BEGIN_DOCUMENT);

var commentContextRegex = regex(BEGIN_COMMENT, END_COMMENT);

var Lexer = (function () {
    function Lexer(text, filename) {
        _classCallCheck(this, Lexer);

        this.text = text;
        this.index = 0;
        this.lineIndex = 0;
        this.line = 1;
        this.filename = filename;
    }

    _createClass(Lexer, [{
        key: 'currentLocation',
        value: function currentLocation() {
            return new _Location2['default'](this.filename, this.line, this.index - this.lineIndex + 1);
        }
    }, {
        key: 'moveForward',
        value: function moveForward(toIndex, str) {
            str = str || this.text.substring(this.index, toIndex);
            var re = /[\n\v\f\r\x85\u2028\u2029]/g;
            var match = undefined;
            while (match = re.exec(str)) {
                ++this.line;
                this.lineIndex = re.lastIndex;
            }
            this.index = toIndex;
        }

        // TODO: Remove token values that aren't actually used (.end, etc).
    }, {
        key: 'getToken',
        value: function getToken(newIndex, token, matchIndex) {
            if (this.index === matchIndex) {
                switch (token) {
                    case _tokens2['default'].DOCUMENT:
                        this.index = newIndex;
                        return null;
                    case _tokens2['default'].BLOCK_REFERENCE:
                        break;
                    default:
                        throw new Error(token + ' tag cannot be empty.');
                }
            }

            var result = {
                token: token,
                value: this.text.substring(this.index, matchIndex),
                begin: this.currentLocation()
            };
            this.moveForward(newIndex, result.value);
            result.end = this.currentLocation();
            return result;
        }
    }, {
        key: 'comment',
        value: _regeneratorRuntime.mark(function comment() {
            var openLocation, match;
            return _regeneratorRuntime.wrap(function comment$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();

                        this.index += BEGIN_COMMENT.length;
                        commentContextRegex.lastIndex = this.index;

                    case 3:
                        if (!true) {
                            context$2$0.next = 20;
                            break;
                        }

                        match = commentContextRegex.exec(this.text);

                        if (!(match === null)) {
                            context$2$0.next = 7;
                            break;
                        }

                        throw new Error('Comment tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_COMMENT);

                    case 7:
                        this.moveForward(commentContextRegex.lastIndex);

                        if (!(match[0] === END_COMMENT)) {
                            context$2$0.next = 12;
                            break;
                        }

                        return context$2$0.abrupt('return');

                    case 12:
                        if (!(match[0] === BEGIN_COMMENT)) {
                            context$2$0.next = 17;
                            break;
                        }

                        return context$2$0.delegateYield(this.comment(), 't0', 14);

                    case 14:
                        commentContextRegex.lastIndex = this.index;
                        context$2$0.next = 18;
                        break;

                    case 17:
                        throw new Error("Internal error.");

                    case 18:
                        context$2$0.next = 3;
                        break;

                    case 20:
                    case 'end':
                        return context$2$0.stop();
                }
            }, comment, this);
        })
    }, {
        key: 'javascript',
        value: _regeneratorRuntime.mark(function javascript() {
            var openLocation, match;
            return _regeneratorRuntime.wrap(function javascript$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();

                        javascriptContextRegex.lastIndex = this.index;

                    case 2:
                        if (!true) {
                            context$2$0.next = 23;
                            break;
                        }

                        match = javascriptContextRegex.exec(this.text);

                        if (!(match === null)) {
                            context$2$0.next = 6;
                            break;
                        }

                        throw new Error('Javascript tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_JAVASCRIPT);

                    case 6:
                        context$2$0.next = 8;
                        return this.getToken(javascriptContextRegex.lastIndex, _tokens2['default'].JAVASCRIPT, match.index);

                    case 8:
                        if (!(match[0] === END_JAVASCRIPT)) {
                            context$2$0.next = 10;
                            break;
                        }

                        return context$2$0.abrupt('return');

                    case 10:
                        if (!(match[0] === BEGIN_COMMENT)) {
                            context$2$0.next = 15;
                            break;
                        }

                        return context$2$0.delegateYield(this.comment(), 't0', 12);

                    case 12:
                        javascriptContextRegex.lastIndex = this.index;
                        context$2$0.next = 21;
                        break;

                    case 15:
                        if (!(match[0] === BEGIN_DOCUMENT)) {
                            context$2$0.next = 20;
                            break;
                        }

                        return context$2$0.delegateYield(this.document(), 't1', 17);

                    case 17:
                        javascriptContextRegex.lastIndex = this.index;
                        context$2$0.next = 21;
                        break;

                    case 20:
                        throw new Error("Internal error.");

                    case 21:
                        context$2$0.next = 2;
                        break;

                    case 23:
                    case 'end':
                        return context$2$0.stop();
                }
            }, javascript, this);
        })
    }, {
        key: 'expression',
        value: _regeneratorRuntime.mark(function expression() {
            var openLocation, matchIndex;
            return _regeneratorRuntime.wrap(function expression$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();
                        matchIndex = this.text.indexOf(END_EXPRESSION, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 4;
                            break;
                        }

                        throw new Error('Expression tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_EXPRESSION);

                    case 4:
                        context$2$0.next = 6;
                        return this.getToken(matchIndex + END_EXPRESSION.length, _tokens2['default'].EXPRESSION, matchIndex);

                    case 6:
                    case 'end':
                        return context$2$0.stop();
                }
            }, expression, this);
        })
    }, {
        key: 'layout',
        value: _regeneratorRuntime.mark(function layout() {
            var openLocation, matchIndex;
            return _regeneratorRuntime.wrap(function layout$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();
                        matchIndex = this.text.indexOf(END_LAYOUT, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 4;
                            break;
                        }

                        throw new Error('Layout tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_LAYOUT);

                    case 4:
                        context$2$0.next = 6;
                        return this.getToken(matchIndex + END_LAYOUT.length, _tokens2['default'].LAYOUT, matchIndex);

                    case 6:
                    case 'end':
                        return context$2$0.stop();
                }
            }, layout, this);
        })
    }, {
        key: 'blockReference',
        value: _regeneratorRuntime.mark(function blockReference() {
            var openLocation, matchIndex;
            return _regeneratorRuntime.wrap(function blockReference$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();
                        matchIndex = this.text.indexOf(END_BLOCK_REFERENCE, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 4;
                            break;
                        }

                        throw new Error('Block Reference tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_BLOCK_REFERENCE);

                    case 4:
                        context$2$0.next = 6;
                        return this.getToken(matchIndex + END_BLOCK_REFERENCE.length, _tokens2['default'].BLOCK_REFERENCE, matchIndex);

                    case 6:
                    case 'end':
                        return context$2$0.stop();
                }
            }, blockReference, this);
        })
    }, {
        key: 'partial',
        value: _regeneratorRuntime.mark(function partial() {
            var openLocation, matchIndex;
            return _regeneratorRuntime.wrap(function partial$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();
                        matchIndex = this.text.indexOf(END_PARTIAL, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 4;
                            break;
                        }

                        throw new Error('Partial tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_PARTIAL);

                    case 4:
                        context$2$0.next = 6;
                        return this.getToken(matchIndex + END_PARTIAL.length, _tokens2['default'].PARTIAL, matchIndex);

                    case 6:
                    case 'end':
                        return context$2$0.stop();
                }
            }, partial, this);
        })
    }, {
        key: 'block',
        value: _regeneratorRuntime.mark(function block() {
            var openLocation, matchIndex;
            return _regeneratorRuntime.wrap(function block$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();
                        matchIndex = this.text.indexOf(BEGIN_DOCUMENT, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 4;
                            break;
                        }

                        throw new Error('Block tag opened at ' + openLocation.locationString() + ' missing opening document tag ' + BEGIN_DOCUMENT);

                    case 4:
                        context$2$0.next = 6;
                        return this.getToken(matchIndex + BEGIN_DOCUMENT.length, _tokens2['default'].BLOCK_NAME, matchIndex);

                    case 6:
                        return context$2$0.delegateYield(this.document(), 't0', 7);

                    case 7:

                        matchIndex = this.text.indexOf(END_BLOCK, this.index);

                        if (!(matchIndex === -1)) {
                            context$2$0.next = 10;
                            break;
                        }

                        throw new Error('Block tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_BLOCK);

                    case 10:
                        this.moveForward(matchIndex + END_BLOCK.length);

                    case 11:
                    case 'end':
                        return context$2$0.stop();
                }
            }, block, this);
        })
    }, {
        key: 'document',
        value: _regeneratorRuntime.mark(function document() {
            var openLocation, match;
            return _regeneratorRuntime.wrap(function document$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        openLocation = this.currentLocation();

                        documentContextRegex.lastIndex = this.index;

                    case 2:
                        if (!true) {
                            context$2$0.next = 38;
                            break;
                        }

                        match = documentContextRegex.exec(this.text);

                        if (!(match === null)) {
                            context$2$0.next = 6;
                            break;
                        }

                        throw new Error('Document tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_DOCUMENT);

                    case 6:
                        context$2$0.next = 8;
                        return this.getToken(documentContextRegex.lastIndex, _tokens2['default'].DOCUMENT, match.index);

                    case 8:
                        if (!(match[0] === END_DOCUMENT)) {
                            context$2$0.next = 10;
                            break;
                        }

                        return context$2$0.abrupt('return');

                    case 10:
                        if (!(match[0] === BEGIN_EXPRESSION)) {
                            context$2$0.next = 15;
                            break;
                        }

                        return context$2$0.delegateYield(this.expression(), 't0', 12);

                    case 12:
                        documentContextRegex.lastIndex = this.index;
                        context$2$0.next = 36;
                        break;

                    case 15:
                        if (!(match[0] === BEGIN_JAVASCRIPT)) {
                            context$2$0.next = 20;
                            break;
                        }

                        return context$2$0.delegateYield(this.javascript(), 't1', 17);

                    case 17:
                        documentContextRegex.lastIndex = this.index;
                        context$2$0.next = 36;
                        break;

                    case 20:
                        if (!(match[0] === BEGIN_COMMENT)) {
                            context$2$0.next = 25;
                            break;
                        }

                        return context$2$0.delegateYield(this.comment(), 't2', 22);

                    case 22:
                        documentContextRegex.lastIndex = this.index;
                        context$2$0.next = 36;
                        break;

                    case 25:
                        if (!(match[0] === BEGIN_BLOCK_REFERENCE)) {
                            context$2$0.next = 30;
                            break;
                        }

                        return context$2$0.delegateYield(this.blockReference(), 't3', 27);

                    case 27:
                        documentContextRegex.lastIndex = this.index;
                        context$2$0.next = 36;
                        break;

                    case 30:
                        if (!(match[0] === BEGIN_PARTIAL)) {
                            context$2$0.next = 35;
                            break;
                        }

                        return context$2$0.delegateYield(this.partial(), 't4', 32);

                    case 32:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 36;
                        break;

                    case 35:
                        throw new Error("Internal error.");

                    case 36:
                        context$2$0.next = 2;
                        break;

                    case 38:
                    case 'end':
                        return context$2$0.stop();
                }
            }, document, this);
        })
    }, {
        key: 'root',
        value: _regeneratorRuntime.mark(function root() {
            var match;
            return _regeneratorRuntime.wrap(function root$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        rootContextRegex.lastIndex = this.index;

                    case 1:
                        if (!true) {
                            context$2$0.next = 47;
                            break;
                        }

                        match = rootContextRegex.exec(this.text);

                        if (!(match === null)) {
                            context$2$0.next = 7;
                            break;
                        }

                        context$2$0.next = 6;
                        return this.getToken(this.text.length, _tokens2['default'].DOCUMENT, this.text.length);

                    case 6:
                        return context$2$0.abrupt('return');

                    case 7:
                        context$2$0.next = 9;
                        return this.getToken(rootContextRegex.lastIndex, _tokens2['default'].DOCUMENT, match.index);

                    case 9:
                        if (!(match[0] === BEGIN_EXPRESSION)) {
                            context$2$0.next = 14;
                            break;
                        }

                        return context$2$0.delegateYield(this.expression(), 't0', 11);

                    case 11:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 14:
                        if (!(match[0] === BEGIN_JAVASCRIPT)) {
                            context$2$0.next = 19;
                            break;
                        }

                        return context$2$0.delegateYield(this.javascript(), 't1', 16);

                    case 16:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 19:
                        if (!(match[0] === BEGIN_COMMENT)) {
                            context$2$0.next = 24;
                            break;
                        }

                        return context$2$0.delegateYield(this.comment(), 't2', 21);

                    case 21:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 24:
                        if (!(match[0] === BEGIN_BLOCK)) {
                            context$2$0.next = 29;
                            break;
                        }

                        return context$2$0.delegateYield(this.block(), 't3', 26);

                    case 26:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 29:
                        if (!(match[0] === BEGIN_BLOCK_REFERENCE)) {
                            context$2$0.next = 34;
                            break;
                        }

                        return context$2$0.delegateYield(this.blockReference(), 't4', 31);

                    case 31:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 34:
                        if (!(match[0] === BEGIN_PARTIAL)) {
                            context$2$0.next = 39;
                            break;
                        }

                        return context$2$0.delegateYield(this.partial(), 't5', 36);

                    case 36:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 39:
                        if (!(match[0] === BEGIN_LAYOUT)) {
                            context$2$0.next = 44;
                            break;
                        }

                        return context$2$0.delegateYield(this.layout(), 't6', 41);

                    case 41:
                        rootContextRegex.lastIndex = this.index;
                        context$2$0.next = 45;
                        break;

                    case 44:
                        throw new Error("Internal error.");

                    case 45:
                        context$2$0.next = 1;
                        break;

                    case 47:
                    case 'end':
                        return context$2$0.stop();
                }
            }, root, this);
        })
    }, {
        key: 'lex',
        value: _regeneratorRuntime.mark(function lex() {
            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, token;

            return _regeneratorRuntime.wrap(function lex$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        context$2$0.prev = 0;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        context$2$0.prev = 4;
                        _iterator = _getIterator(this.root());

                    case 6:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            context$2$0.next = 14;
                            break;
                        }

                        token = _step.value;

                        if (!(token !== null)) {
                            context$2$0.next = 11;
                            break;
                        }

                        context$2$0.next = 11;
                        return token;

                    case 11:
                        _iteratorNormalCompletion = true;
                        context$2$0.next = 6;
                        break;

                    case 14:
                        context$2$0.next = 20;
                        break;

                    case 16:
                        context$2$0.prev = 16;
                        context$2$0.t0 = context$2$0['catch'](4);
                        _didIteratorError = true;
                        _iteratorError = context$2$0.t0;

                    case 20:
                        context$2$0.prev = 20;
                        context$2$0.prev = 21;

                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }

                    case 23:
                        context$2$0.prev = 23;

                        if (!_didIteratorError) {
                            context$2$0.next = 26;
                            break;
                        }

                        throw _iteratorError;

                    case 26:
                        return context$2$0.finish(23);

                    case 27:
                        return context$2$0.finish(20);

                    case 28:
                        context$2$0.next = 34;
                        break;

                    case 30:
                        context$2$0.prev = 30;
                        context$2$0.t1 = context$2$0['catch'](0);

                        context$2$0.t1.message = this.currentLocation() + ': ' + context$2$0.t1.message;
                        throw context$2$0.t1;

                    case 34:
                    case 'end':
                        return context$2$0.stop();
                }
            }, lex, this, [[0, 30], [4, 16, 20, 28], [21,, 23, 27]]);
        })
    }]);

    return Lexer;
})();

exports['default'] = Lexer;
module.exports = exports['default'];
//# sourceMappingURL=Lexer.js.map
