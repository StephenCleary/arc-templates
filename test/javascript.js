import assert from 'assert';
import Arc from '../index';

describe('javascript', () => {
    describe('for block', () => {
        it('evaluates content n times', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for(var i = 0; i != 3; ++i) { %><div/><% } %>').then(result => {
                assert.equal(result.content, '<div/><div/><div/>');
            });
        });
    });

    describe('for block with embedded document', () => {
        it('evaluates content n times', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for(var i = 0; i != 3; ++i) { <: <div/> :> } %>').then(result => {
                assert.equal(result.content, ' <div/>  <div/>  <div/> ');
            });
        });

        it('defines local variable usable in expressions', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for(var i = 0; i != 3; ++i) { <:<div${i}/>:> } %>').then(result => {
                assert.equal(result.content, '<div0/><div1/><div2/>');
            });
        });

        it('local variable overwrites builtin locals', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for(var raw = 0; raw != 3; ++raw) { <:<div${raw}/>:> } %>').then(result => {
                assert.equal(result.content, '<div0/><div1/><div2/>');
            });
        });

        it('local variable overwrites data', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for(var val = 0; val != 3; ++val) { <:<div${val}/>:> } %>', { val: 13 }).then(result => {
                assert.equal(result.content, '<div0/><div1/><div2/>');
            });
        });
    });

    describe('for-of block', () => {
        it('evaluates content', () => {
            const engine = new Arc();
            return engine.evaluateString('<% for (var e of array) { <: <div>${e}</div> :> } %>', { array: ['a', 'b', 13]}).then(result => {
                assert.equal(result.content, ' <div>a</div>  <div>b</div>  <div>13</div> ');
            });
        });
    });

    describe('variable declaration', () => {
        it('is available in later expressions', () => {
            const engine = new Arc();
            return engine.evaluateString('<% var x = 13; %>${x}').then(result => {
                assert.equal(result.content, '13');
            });
        });
    });
});
