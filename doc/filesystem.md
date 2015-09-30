# File system

ARC templates use a simple abstraction for the filesystem, with only one required method:

    filesystem.readFile(path)
    
The `readFile` method takes a single string argument and returns a promise that is resolved with the string contents of the file specified by that path.

Note that all file access in ARC templates is asynchronous.

# Path system

ARC templates also use a simple abstraction for path manipulation.

## dirname

    pathsystem.dirname(path)
    
The `dirname` method takes a single string argument and returns a string that moves "up" one folder/directory.

## join

    pathsystem.join(...paths)
    
The `join` method takes any number of string arguments, concatenates them together as a single path, and simplifies that path (removing `.` and `..` pseudo-paths), returning the canonical resulting path.

# File and path system implementations

Currently, ARC templates only ship with Node-based filesystem and pathsystem implementations (based on `fs` and `path`, respectively).

You may specify your own implementations as arguments to the [ARC template engine constructor](engine.md).