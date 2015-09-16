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
    constructor(compiler, evaluate, child) {
        this._ = _;
        this.compiler = compiler;
        this.evaluate = evaluate;
        this.child = child;
        this.result = { };
        this.currentBlock = 'content';
        this.locals = {
            _: this._,
            raw: this.raw
        };
    }

    executeSync(data) {
        this.data = data;
        this.evaluate();
        if (this.layout === undefined) {
            return this.result;
        }
        return new Compiler(this.compiler.arc, this.compiler.joinedPath(this.layout)).loadSync(this.data, this.result);
    }

    execute(data) {
        this.data = data;
        return Promise.resolve().then(() => {
            this.evaluate();
            if (this.layout === undefined) {
                return this.result;
            }
            return new Compiler(this.compiler.arc, this.compiler.joinedPath(this.layout)).load(this.data, this.result);
        });
    }

    appendRaw(str) {
        if (this.result[this.currentBlock] === undefined) {
            this.result[this.currentBlock] = str;
        } else {
            this.result[this.currentBlock] += str;
        }
    }

    append(str) {
        if (str instanceof RawString) {
            this.appendRaw(str);
        } else {
            this.appendRaw(_.escape(str));
        }
    }

    raw(str) {
        return new RawString(str);
    }

    partial(path) {
        this.appendRaw(new Compiler(this.compiler.arc, this.compiler.joinedPath(path)).loadSync(this.data).content);
    }
}

export default Template;