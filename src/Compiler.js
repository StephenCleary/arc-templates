import Lexer from './Lexer';
import Template from './Template';
import tokens from './tokens';

const MISSING_FILENAME = '<string>';

class Compiler {
    constructor(arc, filename) {
        this.arc = arc;
        this.filename = filename || MISSING_FILENAME;
    }

    compile(text) {
        const nameOrExpression = value => value.startsWith('(') ? value : JSON.stringify(value);
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
                    buffer.push('this.layout = ' + nameOrExpression(token.value.trim()) + ';\n');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
        buffer.push('}');
        return buffer.join('');
    }

    parse(text, data) {
        const template = new Template(this, new Function(this.compile(text)));
        return template.execute(data || {});
    }

    load(data) {
        return this.arc.filesystem.readFileAsync(this.filename).then(text => this.parse(text, data));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

export default Compiler;