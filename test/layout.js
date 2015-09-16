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
            return engine.parse('{! ' + name + ' !}').then(result => {
                assert.equal(result.content, 'test');
            });
        });

        it('passes content to layout file', () => {
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => '{$ content $}')
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !} woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });
    });
});
