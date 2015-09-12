import assert from 'assert';
import Arc from '../src/index';

describe('expression', () => {
    describe('basic expression', () => {
        it('should return evaluated expression as the content', () => {
            const engine = new Arc();
            const result = engine.parse('${value}', { value: 'test' });
            assert.equal(result.content, 'test');
        });
    });
});
