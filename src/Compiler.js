import Lexer from './Lexer';
import Template from './Template';
import tokens from './tokens';

const MISSING_FILENAME = '<string>';

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
        const buffer = ['with (this.locals) with (this.data) {\n'];
        for (let token of lexer.lex()) {
            switch (token.token) {
                case tokens.DOCUMENT:
                    buffer.push('this.appendRaw(' + JSON.stringify(token.value) + ');\n');
                    break;
                case tokens.EXPRESSION:
                    buffer.push('this.append(' + token.value + ');\n');
                    break;
                case tokens.JAVASCRIPT:
                    buffer.push(token.value);
                    break;
                case tokens.LAYOUT:
                    buffer.push('this.layout = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case tokens.BLOCK_REFERENCE:
                    buffer.push('this.appendRaw(this.child[' + this.nameOrExpression(token, 'content') + ']);\n');
                    break;
                case tokens.BLOCK_NAME:
                    buffer.push('this.currentBlock = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case tokens.PARTIAL:
                    buffer.push('this.partial(' + this.nameOrExpression(token) + ');\n');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
        buffer.push('}');
        return buffer.join('');
    }

    parseSync(text) {
        const template = new Template(this, new Function(this.compile(text)), this.data, this.child);
        return template.executeSync();
    }

    parse(text) {
        const template = new Template(this, new Function(this.compile(text)), this.data, this.child);
        return template.execute();
    }

    loadSync() {
        var text = this.arc.filesystem.readFileSync(this.filename);
        return this.parseSync(text, this.data, this.child);
    }

    load() {
        return this.arc.filesystem.readFileAsync(this.filename).then(text => this.parse(text, this.data, this.child));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

export default Compiler;