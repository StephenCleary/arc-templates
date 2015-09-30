# Layouts

Layouts define a "parent" template for the current template.

## Basic syntax and behavior

A layout block starts with `<!` and ends with `!>`. 

This layout block will set the parent template to `mylayout.html`:

    <! mylayout.html !>
    
When the current template is *completed*, it will *then* execute its parent template, and return its parent's results instead of its own. The common convention is to place the layout block at the top of the template file, even though it takes effect at the end.

Multiple layout blocks are allowed, but they operate in an "overwrite" fashion; each template can only have one parent template, and it is the one last specified by a layout block.

The filename is always interpreted as relative to the current template file, just like [partial filenames](partials.md).

Templates used as layout templates may also define layout templates for themselves. Any amount of nesting is permitted.

## Block references

The parent template (or "layout template") usually includes at least one block reference.

A block reference starts with `<*` and ends with `*>`.

If `mylayout.html` contains:

    Child was <**>.
    
And `mypage.html` contains:

    <! mylayout.html !>
    My content

Then `mypage.html` is executed first, with a resulting content of `\nMy content`. This is then passed to the parent template `mylayout.html`, with a final result of:
    
    Child was 
    My content.

## Named blocks and block references

Templates may define multiple named blocks. All resulting content not in a named block is implicitly placed in a block named `content`.

Named blocks start with `<[` and end with `]>`. The named block contains two parts: a name of the block, and a [document tag](document.md) defining that block.

Named block references start with `<*` and end with `*>`, and contain the name of a block.

`mypage.html` can define multiple contents:

    <! mylayout.html !>
    <[ head <:<link/>:> ]>
    body text
    
The named blocks can be referenced by `mylayout.html`:

    <head><* head *></head>
    <body><**></body>
    
will result in:

    <head><link/></head>
    <body>

    body text</body>

If a named block references a block that doesn't exist, then an empty string is used. E.g., using the same `mylayout.html`, the following page:

    <! mylayout.html !>
    body text

will have this result:

    <head></head>
    <body>
    body text</body>

## Advanced usage

### Passing data to the parent template

Parent templates get their [data](identifiers.md#data_identifiers) from their child template. If necessary, the child template may set values on their `data` at any time, and that modified `data` is passed to the parent template:
 
    <! mylayout.html !>
    <% this.data.specialValue = 'hi from child'; %>
    
Then `mylayout.html` can read `specialValue`:

    Child content: <**>, and special value ${ specialValue }.

### Dynamic layouts, named blocks, and block references

Normally, the filename of the layout template is well-known and just included in the calling template as a constant. However, if you need to dynamically determine the layout template filename, you can start the name with `(`, which will cause it to be evaluated as an expression:

    <! ('mylayout' + '.html') !>

will first evaluate the expression `('mylayout' + '.html')` and then treat the result as the filename of the layout template.

The same technique works for dynamic block names and block references:

    <[ ('my' + 'block') <:stuff:> ]>
    <* ('my' + 'block') *>