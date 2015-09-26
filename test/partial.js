import assert from 'assert';
import Arc from '../index';

describe('partial', () => {
    describe('basic partial', () => {
        it('loads partial file asynchronously', () => {
            const name = 'myinclude.html';
            const filesystem = {
                readFile: filename => Promise.resolve().then(() => {
                    assert.equal(filename, name);
                    return 'test';
                })
            };
            const engine = new Arc(filesystem);
            return engine.parse('<( ' + name + ' )>').then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });
});
