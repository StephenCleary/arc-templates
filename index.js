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

    parse(text, data, filename) {
        return new Template(this).evaluateString(text, filename, data);
    }

    load(filename, data) {
        return new Template(this).evaluateFile(filename, data);
    }
}

export default Arc;