# Expressions

Expressions are parts of the document that are evaluated as JavaScript code. The result of the expression is converted to a string and injected into the document.

Expressions usually use [variables or functions](identifiers.md).

## Basic syntax

Expressions start with `${` and end with `}`.

A simple expression:

    Hello, ${ name }!
    
with a data object of `{ name: 'world' }` will result in:

    Hello, world!

Note that whitespace within an expression is ignored (just like regular JavaScript), but whitespace outside the expression is significant:

    Hello,   ${name   } !
    
with a data object of `{ name: 'world' }` will result in:

    Hello,   world !

## Escaping

By default, the expression's value is escaped (using [lodash's `escape`](https://lodash.com/docs#escape)):
 
    Hello, ${ name }!
    
with a data object of `{ name: '<html>' }` will result in:

    Hello, &lt;html&gt;!
    
If you want to prevent escaping, use the [built-in `raw` function](identifiers.md#raw):

    Hello, ${ raw(name) }!
    
with a data object of `{ name: '<html>' }` will result in:

    Hello, <html>!

## Caveats

Expressions are not interpreted by ARC templates; they are only evaluated. This means that *an expression may not contain `}`*. For example, this template:

    ${ 'test of }' }
    
will result in a syntax error when the template is compiled, because the template attempts to treat `'test of ` as an expression.

This also means you can't use IIFEs as expressions.