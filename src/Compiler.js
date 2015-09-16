import Lexer from './Lexer';
import Template from './Template';
import tokens from './tokens';

const MISSING_FILENAME = '<string>';

function nameOrExpression(value, defaultIfEmpty) {
    value = value.trim();
    if (value === '') {
        value = defaultIfEmpty;
    }
    return value.startsWith('(') ? value : JSON.stringify(value);
}

class Compiler {
    constructor(arc, filename, data, child) {
        this.arc = arc;
        this.filename = filename || MISSING_FILENAME;
        this.data = data;
        this.child = child;
    }

    compile(text) {
        const lexer = new Lexer(text, this.filename);
        const buffer = ['with (this.locals) with (this.data) {\n'];
        for (let token of lexer.root()) {
            if (token === null) {
                continue;
            }
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
                    buffer.push('this.layout = ' + nameOrExpression(token.value) + ';\n');
                    break;
                case tokens.BLOCK_REFERENCE:
                    buffer.push('this.appendRaw(this.child[' + nameOrExpression(token.value, 'content') + ']);\n');
                    break;
                case tokens.BLOCK_NAME:
                    buffer.push('this.currentBlock = ' + nameOrExpression(token.value) + ';\n');
                    break;
                case tokens.PARTIAL:
                    buffer.push('this.partial(' + nameOrExpression(token.value) + ');\n');
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