import Lexer from './Lexer';
import Template from './Template';
import tokens from './tokens';

const MISSING_FILENAME = '<string>';
const globalEval = eval;

class Compiler {
    constructor(arc) {
        this.arc = arc;
    }

    _nameOrExpression(token, defaultIfEmpty) {
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

    _compile(text, filename) {
        const lexer = new Lexer(text, filename);
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
                    buffer.push('this._layout = ' + this._nameOrExpression(token) + ';\n');
                    break;
                case tokens.BLOCK_REFERENCE:
                    buffer.push('this._appendRaw(this.child[' + this._nameOrExpression(token, 'content') + '] || "");\n');
                    break;
                case tokens.BLOCK_NAME:
                    buffer.push('this._currentBlock = ' + this._nameOrExpression(token) + ';\n');
                    break;
                case tokens.PARTIAL:
                    buffer.push('this.partial = this._locals.partial = yield this._partial(' + this._nameOrExpression(token) + ');\n');
                    buffer.push('this._appendRaw(this._locals.partial.content);\n');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
        buffer.push('}');
        return buffer.join('');
    }

    compileString(text, filename) {
        filename = filename || MISSING_FILENAME;
        // As much as I dislike eval, GeneratorFunction doesn't seem to be working yet.
        const func = globalEval('(function *() { ' + this._compile(text, filename) + ' })');
        const template = new Template(this, func, filename);
        return template._execute.bind(template);
    }

    evaluateString(text, filename, data, child) {
        return this.compileString(text, filename)(data, child);
    }

    evaluateFile(filename, data, child) {
        return this.arc.filesystem.readFile(filename).then(text => this.evaluateString(text, filename, data, child));
    }

    joinedPath(filename, path) {
        if (filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(filename), path);
    }
}

export default Compiler;