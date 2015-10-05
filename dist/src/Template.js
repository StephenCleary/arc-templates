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
    const buffer = ['with (this._locals) with (this.data) {\n'];
    for (let token of lexer.lex()) {
        switch (token.token) {
            case _tokens2.default.DOCUMENT:
                buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');\n');
                break;
            case _tokens2.default.EXPRESSION:
                buffer.push('this._append(' + token.value + ');\n');
                break;
            case _tokens2.default.JAVASCRIPT:
                buffer.push(token.value + ';\n');
                break;
            case _tokens2.default.LAYOUT:
                buffer.push('this._layout = ' + nameOrExpression(token) + ';\n');
                break;
            case _tokens2.default.BLOCK_REFERENCE:
                buffer.push('this._appendRaw(this.child[' + nameOrExpression(token, 'content') + '] || "");\n');
                break;
            case _tokens2.default.BLOCK_NAME:
                buffer.push('this._currentBlock = ' + nameOrExpression(token) + ';\n');
                break;
            case _tokens2.default.PARTIAL:
                buffer.push('this.partial = this._locals.partial = yield this._partial(' + nameOrExpression(token) + ');\n');
                buffer.push('this._appendRaw(this._locals.partial.content);\n');
                break;
            default:
                throw new Error("Internal error.");
        }
    }
    buffer.push('}');
    return buffer.join('');
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
            return Promise.resolve(this.text);
        } else {
            return this.arc.filesystem.readFile(this.filename).then(text => this.text = text);
        }
    }

    compile() {
        return this.load().then(text => {
            // As much as I dislike eval, GeneratorFunction doesn't seem to be working yet.
            const func = globalEval('(function *() { ' + compile(text, this.filename) + ' })');
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
