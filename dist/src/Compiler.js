'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Lexer = require('./Lexer');

var _Lexer2 = _interopRequireDefault(_Lexer);

var _Template = require('./Template');

var _Template2 = _interopRequireDefault(_Template);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

const MISSING_FILENAME = '<string>';
const globalEval = eval;

class Compiler {
    constructor(arc, filename, data, child) {
        this.arc = arc;
        this.filename = filename || MISSING_FILENAME;
        this.data = data;
        this.child = child;
    }

    nameOrExpression(token, defaultIfEmpty) {
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

    compile(text) {
        const lexer = new _Lexer2.default(text, this.filename);
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
                    buffer.push('this._layout = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case _tokens2.default.BLOCK_REFERENCE:
                    buffer.push('this._appendRaw(this.child[' + this.nameOrExpression(token, 'content') + '] || "");\n');
                    break;
                case _tokens2.default.BLOCK_NAME:
                    buffer.push('this._currentBlock = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case _tokens2.default.PARTIAL:
                    buffer.push('this.partial = this._locals.partial = yield this._partial(' + this.nameOrExpression(token) + ');\n');
                    buffer.push('this._appendRaw(this._locals.partial.content);\n');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
        buffer.push('}');
        return buffer.join('');
    }

    parse(text) {
        // As much as I dislike eval, GeneratorFunction doesn't seem to be working yet.
        const func = globalEval('(function *() { ' + this.compile(text) + ' })');
        const template = new _Template2.default(this, func, this.data, this.child);
        return template._execute();
    }

    load() {
        return this.arc.filesystem.readFile(this.filename).then(text => this.parse(text, this.data, this.child));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

exports.default = Compiler;
module.exports = exports.default;
//# sourceMappingURL=Compiler.js.map
