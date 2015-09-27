# Document Blocks

Document blocks are interpreted as regular document content. Their content is copied directly to the output, including whitespace, with no escaping or modification of any kind.

## Basic syntax

Document blocks start with `<:` and end with `:>`. They are used within [JavaScript blocks](language.md) and [named blocks](layout.md).

Example of JavaScript block usage:

    <% for (var item of items) { <:<div>${ item }</div>:> } %>
    
with a data object of `{ items: ['x', 'y'] }` will result in:

    <div>x</div><div>y</div>

Example of named block usage:

    <[ bob <:data:> ]>
    
defines a named block `bob` with the content `data`.
    
## Implicit root document block

All template files implicitly start in a special "root" document block, so plain text is simply copied to the output. 

    Hi

will result in `Hi` being output.

The root document block is special because it may contain "top-level" children.

## Children

All document blocks may contain [expressions](expressions.md), [JavaScript blocks](language.md), [comments](comments.md), [named block references](layout.md), and [partials](partials.md).
 
In addition, the root document block may contain [layout declarations](layout.md) and [named blocks](layout.md).
