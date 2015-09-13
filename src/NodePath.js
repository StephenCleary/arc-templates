import path from 'path';

class NodePath {
    dirname(str) {
        return path.dirname(str);
    }

    join(...str) {
        return path.join(...str);
    }
}

export default NodePath;