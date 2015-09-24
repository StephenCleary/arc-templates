# Identifiers (variables and functions)

There are a variety of identifiers that are available to any [JavaScript blocks](language.md) or [expressions](expressions.md).
 
All identifiers have a scope priority: built-in identifiers have the lowest priority, followed by data identifiers, and finally local identifiers. Both built-in and data identifiers have a "canonical form", a way of accessing them regardless of whether they are masked by a higher-priority identifier with the same name. 
 
## Built-in identifiers



### Partial

The `partial` object contains the results of the last [partial template call](partial.md). This is generally used to retrieve named blocks from the partial template.

Canonical form: `this.partial`.

### Raw

The `raw` function takes a string and wraps it within a raw-string marker object so that it is not [escaped when used in an expression](expressions.md#escaping).

Canonical form: `this.raw`.

## Data identifiers

The data object passed in to the template has all of its properties available as identifiers. Properties on the data object override built-in identifiers of the same name.

There is a canonical form of accessing the data object directly: `this.data`. The canonical form may be used to read *or write* any data properties.

## Defining local identifiers

[JavaScript blocks](language.md) may define their own local variables or functions, which are accessible to later [JavaScript blocks](language.md) or [expressions](expressions.md).