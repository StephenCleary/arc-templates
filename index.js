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
        return Template.fromString(this, text, filename).evaluate(data);
    }

    load(filename, data) {
        return Template.fromFile(this, filename).evaluate(data);
    }
}

export default Arc;