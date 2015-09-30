# Partials

Partial blocks are a way to "call" another template and inject that template's result into the output of the current template.

## Basic syntax and behavior

Partial blocks start with `<(` and end with `)>`.

This partial block will [load](filesystem.md) and execute a template called `header.html`, and inject its result into the current template:

    <( header.html )>

When the current template encounters a partial block, it pauses its execution, fully executes the partial template, and then resumes execution. You can think of a partial block as a "function call" of sorts from one template to another.

The filename is always interpreted as relative to the current template file. For example, given the following file structure:
 
    /partials/head.html
    /partials/header.html
    /pages/mypage.html
    
`mypage.html` can contain a partial to include `header.html` as such:

    <( ../partials/header.html )>
    
and `header.html` can contain a partial to include `head.html` as such:

    <( head.html )>

## Advanced usage

### Passing data to the partial template

Partial templates share their [data](identifiers.md#data_identifiers) with their calling template. There is currently no way to specify a different data object for partial templates, but you can modify the current data object before calling the partial:
  
    <% this.data.specialValue = 'hi from parent'; %>
    <( partial.html )>
    
Then the `partial.html` can read `specialValue`:

    ${ specialValue }

### Retrieving multiple results from the partial template

By default, only the default "content" result is injected into the calling template. However, a partial template may define other [named blocks](layout.md) which are accessible via the [predefined `partial` identifier](identifiers.md#partial).
 
So, given a `partial.html` that looks like this:

    Regular content.
    <[ bob <:Extra content:> ]>

A normal include:

    <( partial.html )>
    
will result in just:

    Regular content.
    
However, after the include, the calling template can retrieve the other results using `partial`:

    <( partial.html )>
    And also: ${ partial.bob }!
    
will result in:
 
    Regular content.
    
    And also: Extra content!

### Dynamically determining which partial template to use

Normally, the filename of the partial template is well-known and just included in the calling template as a constant. However, if you need to dynamically determine the partial template filename, you can start the partial name with `(`, which will cause it to be evaluated as an expression:

    <( ('partial' + '.html') )>

will first evaluate the expression `('partial' + '.html')` and then treat the result as the filename of the partial template.