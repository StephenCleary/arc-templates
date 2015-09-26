import fs from 'fs';
import Promise from 'bluebird';

const readFileAsync = Promise.promisify(fs.readFile);

class NodeFilesystem {
    readFile(path) {
        return readFileAsync(path, 'utf8');
    }
}

export default NodeFilesystem;