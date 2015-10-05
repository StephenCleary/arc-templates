import _ from 'lodash';
import Template from './src/Template';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';

class Arc {
    constructor(filesystem, pathsystem, escape) {
        this.filesystem = filesystem || new NodeFilesystem();
        this.path = pathsystem || new NodePath();
        this.escape = escape || _.escape;
    }

    evaluateString(text, data, filename) {
        return Template.fromString(this, text, filename).evaluate(data);
    }

    evaluateFile(filename, data) {
        return Template.fromFile(this, filename).evaluate(data);
    }

    compileString(text, filename) {
        return Template.fromString(this, text, filename).compile();
    }

    compileFile(filename) {
        return Template.fromFile(this, filename).compile();
    }
}

export default Arc;