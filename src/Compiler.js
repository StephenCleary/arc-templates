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
    constructor(arc, filename) {
        this.arc = arc;
        this.filename = filename || MISSING_FILENAME;
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
                    buffer.push('this.append(this.raw(' + JSON.stringify(token.value) + '));\n');
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
                    buffer.push('this.append(this.raw(this.child[' + nameOrExpression(token.value, 'content') + ']));\n');
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

    parseSync(text, data, child) {
        const template = new Template(this, new Function(this.compile(text)), child);
        return template.executeSync(data || {});
    }

    parse(text, data, child) {
        const template = new Template(this, new Function(this.compile(text)), child);
        return template.execute(data || {});
    }

    loadSync(data, child) {
        var text = this.arc.filesystem.readFileSync(this.filename);
        return this.parseSync(text, data, child);
    }

    load(data, child) {
        return this.arc.filesystem.readFileAsync(this.filename).then(text => this.parse(text, data, child));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

export default Compiler;