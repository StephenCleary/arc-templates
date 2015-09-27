import assert from 'assert';
import Arc from '../index';

describe('layout', () => {
    describe('basic layout', () => {
        it('loads layout file asynchronously', () => {
            const name = 'mylayout.html';
            const filesystem = {
                readFile: filename => Promise.resolve().then(() => {
                    assert.equal(filename, name);
                    return 'test';
                })
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! ' + name + ' !>').then(result => {
                assert.equal(result.content, 'test');
            });
        });

        it('has access to the same data', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ west }')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !>', {west: 'yes'}).then(result => {
                assert.equal(result.content, 'yes');
            });
        });

        it('passes content to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* content *> container')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot container');
            });
        });

        it('passes data to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ test }')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !> <% this.data.test = "jitters"; %>').then(result => {
                assert.equal(result.content, 'jitters');
            });
        });
    });

    describe('contents', () => {
        it('default content is "content"', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* *>')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        it('block reference tag can be empty', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<**>')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        it('passes named content blocks to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* bob *>')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<! mylayout.html !> woot <[ bob <: data :> ]>').then(result => {
                assert.equal(result.content, ' data ');
            });
        });
    });
});
