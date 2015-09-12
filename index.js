import Template from './src/template';
import tokens from './src/tokens';
import Lexer from './src/lexer';

class Arc {
    compile(text) {
        const lexer = new Lexer(text);
        const buffer = [];
        for (let token of lexer.root()) {
            if (token === null) {
                continue;
            }
            switch (token.token) {
                case tokens.DOCUMENT:
                    buffer.push('this.append(this.raw(' + JSON.stringify(token.value) + '));');
                    break;
                case tokens.EXPRESSION:
                    buffer.push('with (this.locals) with (this.data) this.append(' + token.value + ');');
                    break;
                default:
                    throw new Error("Internal error." + JSON.stringify(token));
            }
        }
        return new Function(buffer.join(''));
    }

    parse(text, data) {
        const template = new Template(this.compile(text));
        template.execute(data || {});
        return template.result;
    }
}

export default Arc;