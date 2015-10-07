'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Lexer = require('./Lexer');

var _Lexer2 = _interopRequireDefault(_Lexer);

var _Context = require('./Context');

var _Context2 = _interopRequireDefault(_Context);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _babelCore = require('babel-core');

const MISSING_FILENAME = '<string>';
const globalEval = eval;

function nameOrExpression(token, defaultIfEmpty) {
    let value = token.value.trim();
    if (value === '') {
        if (defaultIfEmpty !== undefined) {
            value = defaultIfEmpty;
        } else {
            throw new Error(token.begin + ': ' + token.token + ' tag must contain a name or expression.');
        }
    }
    return value.startsWith('(') ? value : JSON.stringify(value);
}

function compile(text, filename) {
    const lexer = new _Lexer2.default(text, filename);
    const buffer = [];
    for (let token of lexer.lex()) {
        switch (token.token) {
            case _tokens2.default.DOCUMENT:
                buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');');
                break;
            case _tokens2.default.EXPRESSION:
                buffer.push('this._append(' + token.value + ');');
                break;
            case _tokens2.default.JAVASCRIPT:
                buffer.push(token.value + ';');
                break;
            case _tokens2.default.LAYOUT:
                buffer.push('this._layout = ' + nameOrExpression(token) + ';');
                break;
            case _tokens2.default.BLOCK_REFERENCE:
                buffer.push('this._appendRaw(this.child[' + nameOrExpression(token, 'content') + '] || "");');
                break;
            case _tokens2.default.BLOCK_NAME:
                buffer.push('this._currentBlock = ' + nameOrExpression(token) + ';');
                break;
            case _tokens2.default.PARTIAL:
                buffer.push('this.partial = this._locals.partial = yield this._partial(' + nameOrExpression(token) + ');');
                buffer.push('this._appendRaw(this._locals.partial.content);');
                break;
            default:
                throw new Error("Internal error.");
        }
    }
    return buffer.join('\n');
}

class Template {
    constructor(arc) {
        this.arc = arc;
    }

    get filename() {
        return this._filename || MISSING_FILENAME;
    }
    set filename(value) {
        this._filename = value;
    }

    load() {
        if (this.text !== undefined) {
            return _bluebird2.default.resolve(this.text);
        } else {
            return this.arc.filesystem.readFile(this.filename).then(text => this.text = text);
        }
    }

    compile() {
        return this.load().then(text => {
            // As much as I dislike eval, GeneratorFunction.constructor isn't working yet for Node *or* Babel.

            // The awkward extra function wrapper for ES5 is required because Babel does not yet support 'with' statements within generator functions.
            const funcText = this.arc.supportES5 ? '(function () { with (this._locals) with (this.data) { return (function *() {\n' + compile(text, this.filename) + '\n}).bind(this); } })' : '(function *() { with (this._locals) with (this.data) {\n' + compile(text, this.filename) + '\n} })';

            // We also Babel-transform for modern Node versions because it doesn't yet support block scoping (const, let, etc) outside of strict mode (as of 2015-10-07).
            // Ideally, for modern Node, this should just be: globalEval(funcText)
            const func = this.arc.supportES5 ? globalEval((0, _babelCore.transform)(funcText, { blacklist: ['strict'] }).code) : globalEval((0, _babelCore.transform)(funcText, { whitelist: ['es6.blockScoping'] }).code);
            const context = new _Context2.default(this, func, this.filename);
            return context._execute.bind(context);
        });
    }

    evaluate(data, child) {
        return this.compile().then(execute => execute(data, child));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }

    static fromFile(arc, filename) {
        const result = new Template(arc);
        result.filename = filename;
        return result;
    }

    static fromString(arc, text, filename) {
        const result = new Template(arc);
        result.text = text;
        result.filename = filename;
        return result;
    }
}

exports.default = Template;
module.exports = exports.default;
//# sourceMappingURL=Template.js.map
