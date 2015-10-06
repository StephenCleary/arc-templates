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
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<( ' + name + ' )>').then(result => {
                assert.equal(result.content, 'test');
            });
        });

        it('loads file relative to current file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve().then(() => {
                    if (filename === 'pages/mypage.html' || filename === 'pages\\mypage.html') {
                        return '<( ../partials/header.html )>';
                    } else if (filename === 'partials/header.html' || filename === 'partials\\header.html') {
                        return '<( head.html )>';
                    } else if (filename === 'partials/head.html' || filename === 'partials\\head.html') {
                        return 'made it!';
                    } else {
                        throw new Error('Unknown filename ' + filename);
                    }
                })
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateFile('pages/mypage.html').then(result => {
                assert.equal(result.content, 'made it!');
            });
        });

        it('has access to the same data', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ west }')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<( myinclude.html )>', {west: 'yes'}).then(result => {
                assert.equal(result.content, 'yes');
            });
        });

        it('passes data to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ test }')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<% this.data.test = "jitters"; %><( myinclude.html )>').then(result => {
                assert.equal(result.content, 'jitters');
            });
        });
    });

    describe('contents', () => {
        it('passes named content blocks back to caller via partial identifier', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<[ bob <:hi:> ]>')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<( myinclude.html )>${ partial.bob }').then(result => {
                assert.equal(result.content, 'hi');
            });
        });
    });

    describe('expression', () => {
        it('loads partial file asynchronously', () => {
            const filesystem = {
                readFile: filename => Promise.resolve().then(() => {
                    assert.equal(filename, 'myinclude.html');
                    return 'test';
                })
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<( ("my" + "include" + ext) )>', { ext: '.html' }).then(result => {
                assert.equal(result.content, 'test');
            });
        });
    });
});
