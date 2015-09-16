import Compiler from './src/Compiler';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';

class Arc {
    constructor(filesystem, path) {
        this.filesystem = filesystem || new NodeFilesystem();
        this.path = path || new NodePath();
    }

    parse(text, data, filename) {
        return new Compiler(this, filename, data).parse(text);
    }

    load(filename, data) {
        return new Compiler(this, filename, data).load();
    }
}

export default Arc;