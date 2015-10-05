# Engine

The initial entry point for the ARC template library is the engine class:

    import Arc from 'arc-templates';
    
    // Create a new instance of the ARC template engine
    const engine = new Arc();
    
    // Parse an ARC template file
    const promise = engine.evaluateFile('myfile.html', { mydata: 'myvalue' });
    
    // Display the resulting content
    promise.then(results => console.log(results.content));

## Constructor

The `Arc` constructor can take up to three parameters: [a filesystem, a pathsystem](filesystem.md), and an [escape function](expressions.md#escaping). The default values for these parameters are sufficient for Node environments generating HTML documents.

## evaluateFile

The `evaluateFile` method takes two parameters: the filename of the template file, and a `data` object to pass to that template. Technically, the `data` object is optional, but it should almost always be passed.

`evaluateFile` returns a promise that is completed with an object. This object represents the results of the template, with one key called `content` that contains the main results of the template, as a string. Any [named blocks](layout.md) become additional keys on the results object.

## evaluateString

The `evaluateString` method takes three parameters: the string `text` of the template, a `data` object to pass to that template, and a `filename` string to treat as the template's filename. The `filename` parameter is optional and usually not passed. The `data` object is also optional, but is almost always passed.
  
`evaluateString` returns a promise with the same semantics as the promise returned from `evaluateFile`.

## compileFile

The `compileFile` method takes one parameter: the filename of the template file.

`compileFile` returns a promise that is completed with a function. This function takes one parameter: the `data` object to pass to the template. Technically, the `data` object is optional, but it should almost always be passed. The function returns a promise with the same semantics as the promise returned from `evaluateFile`.

## compileString

The `compileString` method takes two parameters: the string `text` of the template, and a `filename` string to treat as the template's filename. The `filename` parameter is optional and usually not passed.

`compileString` returns a promise with the same semantics as the promise returned from `compileFile`.
