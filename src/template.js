/**
 * A compiled template.
 */
class Template {
    constructor(evaluate) {
        this.execute = (data) => {
            this.data = data;
            evaluate.call(this);
        };
        this.result = { content: '' };
    }

    append(str) {
        this.result.content += str;
    }
}

export default Template;