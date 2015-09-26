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

export default Location;