import Template from './template';

class Arc {
    compile(text) {
        return new Function('this.append(' + JSON.stringify(text) + ');');
    }

    parse(text) {
        const template = new Template(this.compile(text));
        template.execute({});
        return template.result;
    }
}

export default Arc;