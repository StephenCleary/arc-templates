'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Lexer = require('./Lexer');

var _Lexer2 = _interopRequireDefault(_Lexer);

var _Template = require('./Template');

var _Template2 = _interopRequireDefault(_Template);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

const MISSING_FILENAME = '<string>';
const globalEval = eval;

class Compiler {
    constructor(arc, filename, data, child) {
        this.arc = arc;
        this.filename = filename || MISSING_FILENAME;
        this.data = data;
        this.child = child;
    }

    nameOrExpression(token, defaultIfEmpty) {
        let value = token.value.trim();
        if (value === '') {
            if (defaultIfEmpty !== undefined) {
                value = defaultIfEmpty;
            } else {
                throw new Error(token.begin + ': ' + token.token + ' tag must contain a name or expression.');
            }
        }
        return value.startsWith('(') ? value : JSON.stringify(value);
    }

    compile(text) {
        const lexer = new _Lexer2.default(text, this.filename);
        const buffer = ['with (this._locals) with (this.data) {\n'];
        for (let token of lexer.lex()) {
            switch (token.token) {
                case _tokens2.default.DOCUMENT:
                    buffer.push('this._appendRaw(' + JSON.stringify(token.value) + ');\n');
                    break;
                case _tokens2.default.EXPRESSION:
                    buffer.push('this._append(' + token.value + ');\n');
                    break;
                case _tokens2.default.JAVASCRIPT:
                    buffer.push(token.value + ';\n');
                    break;
                case _tokens2.default.LAYOUT:
                    buffer.push('this._layout = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case _tokens2.default.BLOCK_REFERENCE:
                    buffer.push('this._appendRaw(this.child[' + this.nameOrExpression(token, 'content') + '] || "");\n');
                    break;
                case _tokens2.default.BLOCK_NAME:
                    buffer.push('this._currentBlock = ' + this.nameOrExpression(token) + ';\n');
                    break;
                case _tokens2.default.PARTIAL:
                    buffer.push('this.partial = this._locals.partial = yield this._partial(' + this.nameOrExpression(token) + ');\n');
                    buffer.push('this._appendRaw(this._locals.partial.content);\n');
                    break;
                default:
                    throw new Error("Internal error.");
            }
        }
        buffer.push('}');
        return buffer.join('');
    }

    parse(text) {
        // As much as I dislike eval, GeneratorFunction doesn't seem to be working yet.
        const func = globalEval('(function *() { ' + this.compile(text) + ' })');
        const template = new _Template2.default(this, func, this.data, this.child);
        return template._execute();
    }

    load() {
        return this.arc.filesystem.readFile(this.filename).then(text => this.parse(text, this.data, this.child));
    }

    joinedPath(path) {
        if (this.filename === MISSING_FILENAME) {
            return path;
        }
        return this.arc.path.join(this.arc.path.dirname(this.filename), path);
    }
}

exports.default = Compiler;
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _tokens = require('./tokens');

var _tokens2 = _interopRequireDefault(_tokens);

var _Location = require('./Location');

var _Location2 = _interopRequireDefault(_Location);

const BEGIN_EXPRESSION = '${';
const END_EXPRESSION = '}';
const BEGIN_JAVASCRIPT = '<%';
const END_JAVASCRIPT = '%>';
const BEGIN_COMMENT = '</*';
const END_COMMENT = '*/>';
const BEGIN_BLOCK = '<[';
const END_BLOCK = ']>';
const BEGIN_DOCUMENT = '<:';
const END_DOCUMENT = ':>';
const BEGIN_BLOCK_REFERENCE = '<*';
const END_BLOCK_REFERENCE = '*>';
const BEGIN_LAYOUT = '<!';
const END_LAYOUT = '!>';
const BEGIN_PARTIAL = '<(';
const END_PARTIAL = ')>';

function regex() {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
    }

    return new RegExp(values.map(x => _lodash2.default.escapeRegExp(x)).join('|'), 'g');
}

const rootContextRegex = regex(BEGIN_EXPRESSION, BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL, BEGIN_BLOCK, BEGIN_LAYOUT);

const documentContextRegex = regex(END_DOCUMENT, BEGIN_EXPRESSION, BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL);

const javascriptContextRegex = regex(END_JAVASCRIPT, BEGIN_COMMENT, BEGIN_DOCUMENT);

const commentContextRegex = regex(BEGIN_COMMENT, END_COMMENT);

class Lexer {
    constructor(text, filename) {
        this.text = text;
        this.index = 0;
        this.lineIndex = 0;
        this.line = 1;
        this.filename = filename;
    }

    currentLocation() {
        return new _Location2.default(this.filename, this.line, this.index - this.lineIndex + 1);
    }

    moveForward(toIndex, str) {
        str = str || this.text.substring(this.index, toIndex);
        const re = /[\n\v\f\r\x85\u2028\u2029]/g;
        let match;
        while (match = re.exec(str)) {
            ++this.line;
            this.lineIndex = re.lastIndex;
        }
        this.index = toIndex;
    }

    // TODO: Remove token values that aren't actually used (.end, etc).
    getToken(newIndex, token, matchIndex) {
        if (this.index === matchIndex) {
            switch (token) {
                case _tokens2.default.DOCUMENT:
                    this.index = newIndex;
                    return null;
                case _tokens2.default.BLOCK_REFERENCE:
                    break;
                default:
                    throw new Error(token + ' tag cannot be empty.');
            }
        }

        const result = {
            token: token,
            value: this.text.substring(this.index, matchIndex),
            begin: this.currentLocation()
        };
        this.moveForward(newIndex, result.value);
        result.end = this.currentLocation();
        return result;
    }

    *comment() {
        const openLocation = this.currentLocation();
        this.index += BEGIN_COMMENT.length;
        commentContextRegex.lastIndex = this.index;
        while (true) {
            const match = commentContextRegex.exec(this.text);
            if (match === null) {
                throw new Error('Comment tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_COMMENT);
            }
            this.moveForward(commentContextRegex.lastIndex);
            if (match[0] === END_COMMENT) {
                return;
            } else if (match[0] === BEGIN_COMMENT) {
                yield* this.comment();
                commentContextRegex.lastIndex = this.index;
            } else {
                throw new Error("Internal error.");
            }
        }
    }

    *javascript() {
        const openLocation = this.currentLocation();
        javascriptContextRegex.lastIndex = this.index;
        while (true) {
            const match = javascriptContextRegex.exec(this.text);
            if (match === null) {
                throw new Error('Javascript tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_JAVASCRIPT);
            }
            yield this.getToken(javascriptContextRegex.lastIndex, _tokens2.default.JAVASCRIPT, match.index);
            if (match[0] === END_JAVASCRIPT) {
                return;
            }
            if (match[0] === BEGIN_COMMENT) {
                yield* this.comment();
                javascriptContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_DOCUMENT) {
                yield* this.document();
                javascriptContextRegex.lastIndex = this.index;
            } else {
                throw new Error("Internal error.");
            }
        }
    }

    *expression() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_EXPRESSION, this.index);
        if (matchIndex === -1) {
            throw new Error('Expression tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_EXPRESSION);
        }
        yield this.getToken(matchIndex + END_EXPRESSION.length, _tokens2.default.EXPRESSION, matchIndex);
    }

    *layout() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_LAYOUT, this.index);
        if (matchIndex === -1) {
            throw new Error('Layout tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_LAYOUT);
        }
        yield this.getToken(matchIndex + END_LAYOUT.length, _tokens2.default.LAYOUT, matchIndex);
    }

    *blockReference() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_BLOCK_REFERENCE, this.index);
        if (matchIndex === -1) {
            throw new Error('Block Reference tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_BLOCK_REFERENCE);
        }
        yield this.getToken(matchIndex + END_BLOCK_REFERENCE.length, _tokens2.default.BLOCK_REFERENCE, matchIndex);
    }

    *partial() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_PARTIAL, this.index);
        if (matchIndex === -1) {
            throw new Error('Partial tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_PARTIAL);
        }
        yield this.getToken(matchIndex + END_PARTIAL.length, _tokens2.default.PARTIAL, matchIndex);
    }

    *block() {
        const openLocation = this.currentLocation();

        let matchIndex = this.text.indexOf(BEGIN_DOCUMENT, this.index);
        if (matchIndex === -1) {
            throw new Error('Block tag opened at ' + openLocation.locationString() + ' missing opening document tag ' + BEGIN_DOCUMENT);
        }
        yield this.getToken(matchIndex + BEGIN_DOCUMENT.length, _tokens2.default.BLOCK_NAME, matchIndex);

        yield* this.document();

        matchIndex = this.text.indexOf(END_BLOCK, this.index);
        if (matchIndex === -1) {
            throw new Error('Block tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_BLOCK);
        }
        this.moveForward(matchIndex + END_BLOCK.length);
    }

    *document() {
        const openLocation = this.currentLocation();
        documentContextRegex.lastIndex = this.index;
        while (true) {
            const match = documentContextRegex.exec(this.text);
            if (match === null) {
                throw new Error('Document tag opened at ' + openLocation.locationString() + ' missing closing tag ' + END_DOCUMENT);
            }
            yield this.getToken(documentContextRegex.lastIndex, _tokens2.default.DOCUMENT, match.index);
            if (match[0] === END_DOCUMENT) {
                return;
            }
            if (match[0] === BEGIN_EXPRESSION) {
                yield* this.expression();
                documentContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_JAVASCRIPT) {
                yield* this.javascript();
                documentContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_COMMENT) {
                yield* this.comment();
                documentContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_BLOCK_REFERENCE) {
                yield* this.blockReference();
                documentContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_PARTIAL) {
                yield* this.partial();
                rootContextRegex.lastIndex = this.index;
            } else {
                throw new Error("Internal error.");
            }
        }
    }

    *root() {
        rootContextRegex.lastIndex = this.index;
        while (true) {
            const match = rootContextRegex.exec(this.text);
            if (match === null) {
                yield this.getToken(this.text.length, _tokens2.default.DOCUMENT, this.text.length);
                return;
            }
            yield this.getToken(rootContextRegex.lastIndex, _tokens2.default.DOCUMENT, match.index);
            if (match[0] === BEGIN_EXPRESSION) {
                yield* this.expression();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_JAVASCRIPT) {
                yield* this.javascript();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_COMMENT) {
                yield* this.comment();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_BLOCK) {
                yield* this.block();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_BLOCK_REFERENCE) {
                yield* this.blockReference();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_PARTIAL) {
                yield* this.partial();
                rootContextRegex.lastIndex = this.index;
            } else if (match[0] === BEGIN_LAYOUT) {
                yield* this.layout();
                rootContextRegex.lastIndex = this.index;
            } else {
                throw new Error("Internal error.");
            }
        }
    }

    *lex() {
        try {
            for (let token of this.root()) {
                if (token !== null) {
                    yield token;
                }
            }
        } catch (err) {
            err.message = this.currentLocation() + ': ' + err.message;
            throw err;
        }
    }
}

exports.default = Lexer;
module.exports = exports.default;
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

const readFileAsync = _bluebird2.default.promisify(_fs2.default.readFile);

class NodeFilesystem {
    readFile(path) {
        return readFileAsync(path, 'utf8');
    }
}

exports.default = NodeFilesystem;
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

class NodePath {
    dirname(str) {
        return _path2.default.dirname(str);
    }

    join() {
        return _path2.default.join.apply(_path2.default, arguments);
    }
}

exports.default = NodePath;
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Compiler = require('./Compiler');

var _Compiler2 = _interopRequireDefault(_Compiler);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

class RawString {
    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

/**
 * A compiled template.
 */
class Template {
    constructor(compiler, evaluate, data, child, escape) {
        this._ = _lodash2.default;
        this._compiler = compiler;
        this._evaluate = _bluebird2.default.coroutine(evaluate);
        this.data = data || {};
        this.child = child;
        this._result = {
            content: ''
        };
        this._currentBlock = 'content';
        this._locals = {
            _: this._,
            raw: this.raw
        };
    }

    _execute() {
        return this._evaluate().then(() => {
            if (this._layout === undefined) {
                return this._result;
            }
            return new _Compiler2.default(this._compiler.arc, this._compiler.joinedPath(this._layout), this.data, this._result).load();
        });
    }

    _appendRaw(str) {
        if (this._result[this._currentBlock] === undefined) {
            this._result[this._currentBlock] = str;
        } else {
            this._result[this._currentBlock] += str;
        }
    }

    _append(str) {
        if (str instanceof RawString) {
            this._appendRaw(str);
        } else {
            this._appendRaw(this._compiler.arc.escape(str));
        }
    }

    raw(str) {
        return new RawString(str);
    }

    _partial(path) {
        return new _Compiler2.default(this._compiler.arc, this._compiler.joinedPath(path), this.data).load();
    }
}

exports.default = Template;
module.exports = exports.default;
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.default = Object.freeze({
    DOCUMENT: 'Document',
    JAVASCRIPT: 'JavaScript',
    EXPRESSION: 'Expression',
    LAYOUT: 'Layout',
    BLOCK_REFERENCE: 'Block Reference',
    PARTIAL: 'Partial',
    BLOCK_NAME: 'Named Block'
});
module.exports = exports.default;
//# sourceMappingURL=index.js.map
