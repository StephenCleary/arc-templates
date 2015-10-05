import assert from 'assert';
import Arc from '../index';

describe('expression', () => {
    describe('basic expression', () => {
        it('should return evaluated expression as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('${value}', { value: 'test' }).then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });

    describe('quoted expression', () => {
        it('should return evaluated string as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('${"wha"}').then(result => {
                assert.equal(result.content, 'wha');
            });
        });
    });

    describe('html expression', () => {
        it('should return escaped string as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('${value}', { value: '<div>'}).then(result => {
                assert.equal(result.content, '&lt;div&gt;');
            });
        });
    });

    describe('raw html expression', () => {
        it('should return unescaped string as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('${raw(value)}', { value: '<div>'}).then(result => {
                assert.equal(result.content, '<div>');
            });
        });
    });

    describe('expression within document', () => {
        it('should merge evaluated expression with document text', () => {
            const engine = new Arc();
            return engine.evaluateString('pre${ inject } post', { inject: 'word'}).then(result => {
                assert.equal(result.content, 'preword post');
            });
        });
    });

    describe('missing end brace', () => {
        it('should throw error', () => {
            const engine = new Arc();
            return Promise.resolve().then(() => engine.evaluateString('${value')).then(assert.fail,
                    err => assert(/^<string> \(1,3\): /.test(err.message), err.message));
        });
    });

    describe('empty', () => {
        it('should throw error', () => {
            const engine = new Arc();
            return Promise.resolve().then(() => engine.evaluateString('${}')).then(assert.fail,
                    err => assert(/^<string> \(1,3\): /.test(err.message), err.message));
        });
    });

    describe('contains end brace', () => {
        it('should throw error', () => {
            const engine = new Arc();
            return Promise.resolve().then(() => engine.evaluateString('${ "test of }" }')).then(assert.fail,
                    err => assert(err instanceof SyntaxError, err.message));
        });
    });

    describe('identifiers', () => {
        it('_', () => {
            const engine = new Arc();
            return engine.evaluateString('${ _.range(1)[0] }').then(result => {
                assert.equal(result.content, '0');
            });
        });
    });
});
