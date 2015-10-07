import Lexer from './Lexer';
import Context from './Context';
import tokens from './tokens';
import Promise from 'bluebird';

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
    const lexer = new Lexer(text, filename);
    const buffer = [];
    for (let token of lexer.lex()) {
        switch (token.token) {
            case tokens.DOCUMENT:
                buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');');
                break;
            case tokens.EXPRESSION:
                buffer.push('this._append(' + token.value + ');');
                break;
            case tokens.JAVASCRIPT:
                buffer.push(token.value + ';');
                break;
            case tokens.LAYOUT:
                buffer.push('this._layout = ' + nameOrExpression(token) + ';');
                break;
            case tokens.BLOCK_REFERENCE:
                buffer.push('this._appendRaw(this.child[' + nameOrExpression(token, 'content') + '] || "");');
                break;
            case tokens.BLOCK_NAME:
                buffer.push('this._currentBlock = ' + nameOrExpression(token) + ';');
                break;
            case tokens.PARTIAL:
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
            return Promise.resolve(this.text);
        } else {
            return this.arc.filesystem.readFile(this.filename).then(text => this.text = text);
        }
    }

    compile() {
        return this.load().then(text => {
            // As much as I dislike eval, GeneratorFunction.constructor isn't working yet for Node *or* Babel.
            // The awkward extra function wrapper for ES5 is required because Babel does not yet support 'with' statements within generator functions.
            const funcText = this.arc.supportES5 ?
                '(function () { with (this._locals) with (this.data) { return (function *() {\n' + compile(text, this.filename) + '\n}).bind(this); } })' :
                '(function *() { with (this._locals) with (this.data) {\n' + compile(text, this.filename) + '\n} })';
            const func = this.arc.supportES5 ?
                globalEval(require('babel-core').transform(funcText, { blacklist: ['strict'] }).code) :
                globalEval(funcText);
            const context = new Context(this, func, this.filename);
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

export default Template;