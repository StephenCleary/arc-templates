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

        it('has access to the same data', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ west }')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<( myinclude.html )>', {west: 'yes'}).then(result => {
                assert.equal(result.content, 'yes');
            });
        });

        it('passes data to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ test }')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<% this.data.test = "jitters"; %><( myinclude.html )>').then(result => {
                assert.equal(result.content, 'jitters');
            });
        });
    });

    describe('contents', () => {
        it('passes named content blocks back to caller via partial identifier', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<[ bob <:hi:> ]>')
            };
            const engine = new Arc(filesystem);
            return engine.parse('<( myinclude.html )>${ partial.bob }').then(result => {
                assert.equal(result.content, 'hi');
            });
        });
    });
});
