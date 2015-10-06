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
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! ' + name + ' !>').then(result => {
                assert.equal(result.content, 'test');
            });
        });

        it('loads file relative to current file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve().then(() => {
                    if (filename === 'pages/mypage.html' || filename === 'pages\\mypage.html') {
                        return '<! ../layouts/page.html !>';
                    } else if (filename === 'layouts/page.html' || filename === 'layouts\\page.html') {
                        return '<! root.html !>';
                    } else if (filename === 'layouts/root.html' || filename === 'layouts\\root.html') {
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
            return engine.evaluateString('<! mylayout.html !>', {west: 'yes'}).then(result => {
                assert.equal(result.content, 'yes');
            });
        });

        it('passes content to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* content *> container')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot container');
            });
        });

        it('passes data to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('${ test }')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> <% this.data.test = "jitters"; %>').then(result => {
                assert.equal(result.content, 'jitters');
            });
        });
    });

    describe('contents', () => {
        it('default content is "content"', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* *>')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        it('block reference tag can be empty', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<**>')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        it('passes named content blocks to layout file', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* bob *>')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> woot <[ bob <: data :> ]>').then(result => {
                assert.equal(result.content, ' data ');
            });
        });

        it('substitutes empty string for missing content blocks', () => {
            const filesystem = {
                readFile: filename => Promise.resolve('<* bob *><**>')
            };
            const engine = new Arc({ filesystem });
            return engine.evaluateString('<! mylayout.html !> woot').then(result => {
                assert.equal(result.content, ' woot');
            });
        });

        describe('expression', () => {
            it('loads partial file asynchronously', () => {
                const filesystem = {
                    readFile: filename => Promise.resolve().then(() => {
                        assert.equal(filename, 'mytemplate.html');
                        return 'test';
                    })
                };
                const engine = new Arc({ filesystem });
                return engine.evaluateString('<! ("my" + "template" + ext) !>', { ext: '.html' }).then(result => {
                    assert.equal(result.content, 'test');
                });
            });
        });
    });
});
