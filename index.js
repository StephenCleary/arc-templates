import Template from './src/Template';
import tokens from './src/tokens';
import Lexer from './src/Lexer';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';

class Arc {
    constructor(filesystem, path) {
        this.filesystem = filesystem || new NodeFilesystem();
        this.path = path || new NodePath();
    }

    compile(text) {
        const lexer = new Lexer(this, text);
        const buffer = ['with (this.locals) with (this.data) return Promise.resolve().then(function () {'];
        for (let token of lexer.root()) {
            if (token === null) {
                continue;
            }
            switch (token.token) {
                case tokens.DOCUMENT:
                    buffer.push('this.append(this.raw(' + JSON.stringify(token.value) + '));');
                    break;
                case tokens.EXPRESSION:
                    buffer.push('this.append(' + token.value + ');');
                    break;
                case tokens.JAVASCRIPT:
                    buffer.push(token.value);
                    break;
                case tokens.LAYOUT:
                    if (token.value.trim().startsWith('(')) {
                        buffer.push('this.layout = ' + token.value + ';');
                    } else {
                        buffer.push('this.layout = ' + JSON.stringify(token.value) + ';');
                    }
                    break;
                default:
                    throw new Error("Internal error." + JSON.stringify(token));
            }
        }
        buffer.push('}.bind(this));');
        return new Function(buffer.join(''));
    }

    parse(text, data) {
        const template = new Template(this.compile(text));
        return template.execute(data || {});
    }
}

export default Arc;