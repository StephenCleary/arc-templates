import assert from 'assert';
import Arc from '../index';

describe('document', () => {
    describe('plain string', () => {
        it('should return that string as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('test').then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });

    describe('html string', () => {
        it('should return full, unescaped text as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('<b>test</b>').then(result => {
                assert.equal(result.content, '<b>test</b>');
            });
        });
    });

    describe('quoted string', () => {
        it('should return full, unescaped text as the content', () => {
            const engine = new Arc();
            return engine.evaluateString('\"\'test\'\"').then(result => {
                assert.equal(result.content, '\"\'test\'\"');
            });
        });
    });

    describe('empty', () => {
        it('should return empty content', () => {
            const engine = new Arc();
            return engine.evaluateString('').then(result => {
                assert.equal(result.content, '');
            });
        });
    });
});
