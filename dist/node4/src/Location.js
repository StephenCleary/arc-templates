'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var Location = (function () {
    function Location(filename, line, column) {
        _classCallCheck(this, Location);

        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    _createClass(Location, [{
        key: 'toString',
        value: function toString() {
            return this.filename + ' ' + this.locationString();
        }
    }, {
        key: 'locationString',
        value: function locationString() {
            return '(' + this.line + ',' + this.column + ')';
        }
    }]);

    return Location;
})();

exports['default'] = Location;
module.exports = exports['default'];
//# sourceMappingURL=Location.js.map
