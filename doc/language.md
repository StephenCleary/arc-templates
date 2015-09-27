# JavaScript Blocks

JavaScript blocks are parts of the document that are evaluated as JavaScript statements. The statements are executed directly, without producing any output to the document.

## Basic syntax

JavaScript blocks start with `<%` and end with `%>`.

    <% /* JavaScript code here */ %>

Many blocks are used to iterate over a collection of values. This is most naturally done with a nested [document block](document.md).

    <% for (var item of items) { <:<div>${ item }</div>:> } %>
    
with a data object of `{ items: ['x', 'y'] }` will result in:

    <div>x</div><div>y</div>

This same operation can also be written with multiple JavaScript blocks instead of a nested document block; the following code produces the same output:

    <% for (var item of items) { %><div>${ item }</div><% } %>

## Children

JavaScript blocks may only contain [document blocks](document.md) or [comments](comments.md).

## Defining values

JavaScript blocks may define local values and/or functions, which are available to any following JavaScript blocks or [expressions](expressions.md).

Identifiers defined by JavaScript blocks [have the highest priority](identifiers.md); that is, they "hide" built-in identifiers or data identifiers with the same name.