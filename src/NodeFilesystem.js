import fs from 'fs';

class NodeFilesystem {
    readFileAsync(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    readFileSync(path) {
        return fs.readFileSync(path, 'utf8');
    }
}

export default NodeFilesystem;