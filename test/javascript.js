import assert from 'assert';
import Arc from '../index';

describe('javascript', () => {
    describe('for block', () => {
        it('evaluates content n times', () => {
            const engine = new Arc();
            const result = engine.parse('{% for(var i = 0; i != 3; ++i) { %}<div/>{% } %}');
            assert.equal(result.content, '<div/><div/><div/>');
        });
    });

    describe('for block with embedded document', () => {
        it('evaluates content n times', () => {
            const engine = new Arc();
            const result = engine.parse('{% for(var i = 0; i != 3; ++i) { {< <div/> >} } %}');
            assert.equal(result.content, ' <div/>  <div/>  <div/> ');
        });

        it('defines local variable usable in expressions', () => {
            const engine = new Arc();
            const result = engine.parse('{% for(var i = 0; i != 3; ++i) { {<<div${i}/>>} } %}');
            assert.equal(result.content, '<div0/><div1/><div2/>');
        });

        it('local variable overwrites builtin locals', () => {
            const engine = new Arc();
            const result = engine.parse('{% for(var raw = 0; raw != 3; ++raw) { {<<div${raw}/>>} } %}');
            assert.equal(result.content, '<div0/><div1/><div2/>');
        });

        it('local variable overwrites data', () => {
            const engine = new Arc();
            const result = engine.parse('{% for(var val = 0; val != 3; ++val) { {<<div${val}/>>} } %}', { val: 13 });
            assert.equal(result.content, '<div0/><div1/><div2/>');
        });
    });
});
