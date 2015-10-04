import Lexer from './Lexer';
import Template from './Template';
import tokens from './tokens';

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
        const lexer = new Lexer(text, this.filename);
        const buffer = ['with (this._locals) with (this.data) {\n'];
        for (let token of lexer.lex()) {
            switch (token.token) {
                case tokens.DOCUMENT:
                    buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');\n');
                    break;
                case tokens.EXPRESSION:
                    buffer.push('this._append(' + token.value + ');\n');
                    break;
                case tokens.JAVASCRIPT:
                    buffer.push(token.value + ';\n');
                    break;
                case tokens.LAYOUT:
                    buffer.push('this._layout = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case tokens.BLOCK_REFERENCE:
                    buffer.push('this._appendRaw(this.child[' + this.nameOrExpression(token, 'content') + '] || "");\n');
                    break;
                case tokens.BLOCK_NAME:
                    buffer.push('this._currentBlock = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case tokens.PARTIAL:
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
        const template = new Template(this, func, this.data, this.child);
        return template._execute();
    }

    load() {
        return this.arc.filesystem.readFile(this.filename).then(text => this.parse(text));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

export default Compiler;