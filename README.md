# arc-templates
Fully powered ES6 JavaScript template engine with halfway-decent syntax.

[![GitHub version](https://badge.fury.io/gh/StephenCleary%2Farc-templates.svg)](http://badge.fury.io/gh/StephenCleary%2Farc-templates) [![Build Status (lint + tests)](https://travis-ci.org/StephenCleary/arc-templates.svg?branch=master)](https://travis-ci.org/StephenCleary/arc-templates)

[![Dependency Status](https://david-dm.org/StephenCleary/arc-templates.svg)](https://david-dm.org/StephenCleary/arc-templates) [![devDependency Status](https://david-dm.org/StephenCleary/arc-templates/dev-status.svg)](https://david-dm.org/StephenCleary/arc-templates#info=devDependencies)

There are two "builds" available: a Node.js 4+ version with minimal Babel transpiling, and an ES5 version with full Babel transpiling. The unit tests are run on both new and older Node versions.

# Simple example

Templates can use [expressions](doc/expressions.md):

    Hello, ${ name }
    
with a data object of `{ name: 'world' }` will result in:

    Hello, world
    
# Loops

[JavaScript blocks](doc/language.md) with nested [document blocks](doc/document.md) allow a natural expression of loops:

    <% for (let item of items) { <:<div>${item}</div>:> } %>
    
# Layouts

Templates can define [layouts](doc/layout.md) for a "template of the template":

    <! layout.html !><div>body</div>
    
If `layout.html` contains:

    <html><head></head><body><**></body></html>
    
Then the final result is:

    <html><head></head><body><div>body</div></body></html>

Templates can also define [multiple named blocks](doc/layout.md) for use by the layout template; for example, separate sections for the `head` and `body` in an HTML document.

# Partials

Templates can also [include other templates](doc/partials.md) in their output:

    before <( include.html )> after
    
If `include.html` contains:
 
    middle
    
Then the final result is:

    before middle after
    
