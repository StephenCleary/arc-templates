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
});
