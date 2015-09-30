import Compiler from './src/Compiler';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';

class Arc {
    constructor(filesystem, pathsystem) {
        this.filesystem = filesystem || new NodeFilesystem();
        this.path = pathsystem || new NodePath();
    }

    parse(text, data, filename) {
        return new Compiler(this, filename, data).parse(text);
    }

    load(filename, data) {
        return new Compiler(this, filename, data).load();
    }
}

export default Arc;