import assert from 'assert';
import Arc from '../src/index';

describe('parse', () => {
    describe('plain string', () => {
        it('should return that string as the content', () => {
            const engine = new Arc();
            const result = engine.parse('test');
            assert.equal(result.content, 'test');
        });
    });
});
