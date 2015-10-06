require('babel-core/register')(
    require('semver').lt(process.versions.node, '4.0.0') ?
        { } :
        { babelrc: 'node4.babelrc' }
);
