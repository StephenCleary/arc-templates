import _ from 'lodash';

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
    constructor(evaluate) {
        this._ = _;
        this.execute = (data) => {
            this.data = data;
            return evaluate.call(this).then(() => this.result);
        };
        this.result = { content: '' };
        this.locals = {
            _: _,
            raw: this.raw
        };
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