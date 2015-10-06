import _ from 'lodash';
import Template from './src/Template';
import NodeFilesystem from './src/NodeFilesystem';
import NodePath from './src/NodePath';
import semver from 'semver';

const supportES5 = semver.lt(process.versions.node, '4.0.0');
const preload = supportES5 ? Promise.resolve(require('babel-core/polyfill')) : Promise.resolve();

class Arc {
    constructor(options) {
        options = options || {};
        this.filesystem = options.filesystem || new NodeFilesystem();
        this.path = options.pathsystem || new NodePath();
        this.escape = options.escape || _.escape;
        this.supportES5 = supportES5;
    }

    evaluateString(text, data, filename) {
        return preload.then(() => Template.fromString(this, text, filename).evaluate(data));
    }

    evaluateFile(filename, data) {
        return preload.then(() => Template.fromFile(this, filename).evaluate(data));
    }

    compileString(text, filename) {
        return preload.then(() => Template.fromString(this, text, filename).compile());
    }

    compileFile(filename) {
        return preload.then(() => Template.fromFile(this, filename).compile());
    }
}

export default Arc;