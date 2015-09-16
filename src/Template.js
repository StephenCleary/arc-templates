import _ from 'lodash';
import Compiler from './Compiler';

class RawString {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}


/**
 * A compiled template.
 */
class Template {
    constructor(compiler, evaluate) {
        this._ = _;
        this.compiler = compiler;
        this._evaluate = evaluate;
        this.result = { content: '' };
        this.locals = {
            _: this._,
            raw: this.raw
        };
    }

    execute(data) {
        this.data = data;
        return Promise.resolve().then(() => {
            this._evaluate();
            if (this.layout === undefined) {
                return this.result;
            }
            return new Compiler(this.compiler.arc, this.compiler.joinedPath(this.layout)).load(this.data);
        });
    }

    append(str) {
        if (str instanceof RawString) {
            this.result.content += str;
        } else {
            this.result.content += _.escape(str);
        }
    }

    raw(str) {
        return new RawString(str);
    }
}

export default Template;