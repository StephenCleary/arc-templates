import _ from 'lodash';
import Compiler from './src/Compiler';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';

class Arc {
    constructor(filesystem, pathsystem, escape) {
        this.filesystem = filesystem || new NodeFilesystem();
        this.path = pathsystem || new NodePath();
        this.escape = escape || _.escape;
    }

    parse(text, data, filename) {
        return new Compiler(this).evaluateString(text, filename, data);
    }

    load(filename, data) {
        return new Compiler(this).evaluateFile(filename, data);
    }
}

export default Arc;