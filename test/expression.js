import assert from 'assert';
import Arc from '../index';

describe('expression', () => {
    describe('basic expression', () => {
        it('should return evaluated expression as the content', () => {
            const engine = new Arc();
            return engine.parse('${value}', { value: 'test' }).then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });

    describe('quoted expression', () => {
        it('should return evaluated string as the content', () => {
            const engine = new Arc();
            return engine.parse('${"wha"}').then(result => {
                assert.equal(result.content, 'wha');
            });
        });
    });

    describe('html expression', () => {
        it('should return escaped string as the content', () => {
            const engine = new Arc();
            return engine.parse('${value}', { value: '<div>'}).then(result => {
                assert.equal(result.content, '&lt;div&gt;');
            });
        });
    });

    describe('raw html expression', () => {
        it('should return unescaped string as the content', () => {
            const engine = new Arc();
            return engine.parse('${raw(value)}', { value: '<div>'}).then(result => {
                assert.equal(result.content, '<div>');
            });
        });
    });

    describe('expression within document', () => {
        it('should merge evaluated expression with document text', () => {
            const engine = new Arc();
            return engine.parse('pre${ inject } post', { inject: 'word'}).then(result => {
                assert.equal(result.content, 'preword post');
            });
        });
    });

    describe('missing end brace', () => {
        it('should throw synchronous error', () => {
            const engine = new Arc();
            assert.throws(() => engine.parse('${value'), err => /^<string> \(1,3\): /.test(err.message));
        });
    });

    describe('empty', () => {
        it('should throw synchronous error', () => {
            const engine = new Arc();
            assert.throws(() => engine.parse('${}'), err => /^<string> \(1,3\): /.test(err.message));
        });
    });

    describe('identifiers', () => {
        it('_', () => {
            const engine = new Arc();
            return engine.parse('${ _.range(1)[0] }').then(result => {
                assert.equal(result.content, '0');
            });
        });
    });
});
