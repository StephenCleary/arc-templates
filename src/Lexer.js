import _ from 'lodash';
import tokens from './tokens';

const BEGIN_EXPRESSION = '${';
const END_EXPRESSION = '}';
const BEGIN_JAVASCRIPT = '{%';
const END_JAVASCRIPT = '%}';
const BEGIN_COMMENT = '{/';
const END_COMMENT = '/}';
const BEGIN_BLOCK = '{[';
const END_BLOCK = ']}';
const BEGIN_DOCUMENT = '{<';
const END_DOCUMENT = '>}';
const BEGIN_BLOCK_REFERENCE = '{$';
const END_BLOCK_REFERENCE = '$}';
const BEGIN_LAYOUT = '{!';
const END_LAYOUT = '!}';
const BEGIN_PARTIAL = '{(';
const END_PARTIAL = ')}';

function regex(...values) {
    return new RegExp(values.map(x => _.escapeRegExp(x)).join('|'), 'g');
}

const rootContextRegex = regex(BEGIN_EXPRESSION,
    BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL, BEGIN_BLOCK, BEGIN_LAYOUT);

const documentContextRegex = regex(END_DOCUMENT, BEGIN_EXPRESSION,
    BEGIN_JAVASCRIPT, BEGIN_COMMENT, BEGIN_BLOCK_REFERENCE, BEGIN_PARTIAL);

const javascriptContextRegex = regex(END_JAVASCRIPT,
    BEGIN_COMMENT, BEGIN_DOCUMENT);

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
        return {
            line: this.line,
            column: this.index - this.lineIndex + 1
        };
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

    getToken(newIndex, token, matchIndex) {
        if (this.index === matchIndex) {
            this.index = newIndex;
            return null;
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

    locStr(loc) {
        return '(' + loc.line + ',' + loc.column + ')';
    }

    *comment() {
        const openLocation = this.currentLocation();
        this.index += BEGIN_COMMENT.length;
        commentContextRegex.lastIndex = this.index;
        while (true) {
            const match = commentContextRegex.exec(this.text);
            if (match === null) {
                throw new Error('Comment tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_COMMENT);
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
                throw new Error('Javascript tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_JAVASCRIPT);
            }
            yield this.getToken(javascriptContextRegex.lastIndex, tokens.JAVASCRIPT, match.index);
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
            throw new Error('Expression tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_EXPRESSION);
        }
        yield this.getToken(matchIndex + END_EXPRESSION.length, tokens.EXPRESSION, matchIndex);
    }

    *layout() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_LAYOUT, this.index);
        if (matchIndex === -1) {
            throw new Error('Layout tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_LAYOUT);
        }
        yield this.getToken(matchIndex + END_LAYOUT, tokens.LAYOUT, matchIndex);
    }

    *blockReference() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_BLOCK_REFERENCE, this.index);
        if (matchIndex === -1) {
            throw new Error('Block Reference tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_BLOCK_REFERENCE);
        }
        yield this.getToken(matchIndex + END_BLOCK_REFERENCE.length, tokens.BLOCK_REFERENCE, matchIndex);
    }

    *partial() {
        const openLocation = this.currentLocation();
        const matchIndex = this.text.indexOf(END_PARTIAL, this.index);
        if (matchIndex === -1) {
            throw new Error('Partial tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_PARTIAL);
        }
        yield this.getToken(matchIndex + END_PARTIAL.length, tokens.PARTIAL, matchIndex);
    }

    *block() {
        const openLocation = this.currentLocation();

        let matchIndex = this.text.indexOf(BEGIN_DOCUMENT, this.index);
        if (matchIndex === -1) {
            throw new Error('Block tag opened at ' + this.locStr(openLocation) + ' missing opening document tag ' + BEGIN_DOCUMENT);
        }
        yield this.getToken(matchIndex + BEGIN_DOCUMENT, tokens.BLOCK_NAME, matchIndex);

        yield* this.document();

        matchIndex = this.text.indexOf(END_BLOCK, this.index);
        if (matchIndex === -1) {
            throw new Error('Block tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_BLOCK);
        }
        this.moveForward(matchIndex);
    }

    *document() {
        const openLocation = this.currentLocation();
        documentContextRegex.lastIndex = this.index;
        while (true) {
            const match = documentContextRegex.exec(this.text);
            if (match === null) {
                throw new Error('Document tag opened at ' + this.locStr(openLocation) + ' missing closing tag ' + END_DOCUMENT);
            }
            yield this.getToken(documentContextRegex.lastIndex, tokens.DOCUMENT, match.index);
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
        try {
            rootContextRegex.lastIndex = this.index;
            while (true) {
                const match = rootContextRegex.exec(this.text);
                if (match === null) {
                    yield this.getToken(this.text.length, tokens.DOCUMENT, this.text.length);
                    return;
                }
                yield this.getToken(rootContextRegex.lastIndex, tokens.DOCUMENT, match.index);
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
        } catch (err) {
            err.message = this.filename + ' ' + this.locStr(this.currentLocation()) + ': ' + err.message;
            throw err;
        }
    }
}

export default Lexer;