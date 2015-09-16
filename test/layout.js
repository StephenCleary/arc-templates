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

        it('has access to the same data', () => {
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => '${ west }')
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !}', { west: 'yes' }).then(result => {
                assert.equal(result.content, 'yes');
            });
        });

        it('passes content to layout file', () => {
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => '{$ content $} container')
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !} woot').then(result => {
                assert.equal(result.content, ' woot container');
            });
        });

        it('default content is "content"', () => {
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => '{$ $}')
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !} woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        it('passes named content blocks to layout file', () => {
            const filesystem = {
                readFileAsync: filename => Promise.resolve().then(() => '{$ bob $}')
            };
            const engine = new Arc(filesystem);
            return engine.parse('{! mylayout.html !} woot {[ bob {< data >} ]}').then(result => {
                assert.equal(result.content, ' data ');
            });
        });
    });
});
