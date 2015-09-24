# Identifiers (variables and functions)

There are a variety of identifiers that are available to any [JavaScript blocks](language.md) or [expressions](expressions.md).
 
All identifiers have a scope priority: built-in identifiers have the lowest priority, followed by data identifiers, and finally local identifiers. Both built-in and data identifiers have "canonical names", a way of accessing them regardless of whether they are masked by a higher-priority identifier with the same name. 
 
## Built-in identifiers



### Partial

The `partial` object contains the results of the last [partial template call](partial.md).

Canonical form: `this.partial`.

### Raw

The `raw` function takes a string and wraps it within a raw-string marker so that it is not [escaped](expressions.md#escaping).

## Data identifiers

## Defining local identifiers

TODO: Scope, overriding others.
