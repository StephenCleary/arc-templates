'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
class Location {
    constructor(filename, line, column) {
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    toString() {
        return this.filename + ' ' + this.locationString();
    }

    locationString() {
        return '(' + this.line + ',' + this.column + ')';
    }
}

exports.default = Location;
module.exports = exports.default;
//# sourceMappingURL=Location.js.map
