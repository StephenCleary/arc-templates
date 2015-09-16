import assert from 'assert';
import Arc from '../index';

describe('layout', () => {
    describe('basic layout', () => {
        it('loads layout file asynchronously', () => {
            const name = 'mylayout.html';
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => {
                    assert.equal(filename, name);
                    return 'test';
                })
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !}').then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });
});
