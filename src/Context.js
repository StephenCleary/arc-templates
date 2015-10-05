import _ from 'lodash';
import Template from './Template';
import Promise from 'bluebird';

class RawString {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

/**
 * The context in which a template executes.
 */
class Context {
    constructor(template, evaluate, filename) {
        this._ = _;
        this._template = template;
        this._evaluate = Promise.coroutine(evaluate);
        this._filename = filename;
        this._result = {
            content: ''
        };
        this._currentBlock = 'content';
        this._locals = {
            _: this._,
            raw: this.raw
        };
    }

    _execute(data, child) {
        this.data = data || {};
        this.child = this._locals.child =  child;
        return this._evaluate().then(() => {
            if (this._layout === undefined) {
                return this._result;
            }
            return new Template(this._template.arc).evaluateFile(this._template.joinedPath(this._filename, this._layout), this.data, this._result);
        });
    }

    _appendRaw(str) {
        if (this._result[this._currentBlock] === undefined) {
            this._result[this._currentBlock] = str;
        } else {
            this._result[this._currentBlock] += str;
        }
    }

    _append(str) {
        if (str instanceof RawString) {
            this._appendRaw(str);
        } else {
            this._appendRaw(this._template.arc.escape(str));
        }
    }

    raw(str) {
        return new RawString(str);
    }

    _partial(path) {
        return new Template(this._template.arc).evaluateFile(this._template.joinedPath(this._filename, path), this.data);
    }
}

export default Context;