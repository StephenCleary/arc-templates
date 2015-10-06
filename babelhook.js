var supportES5 = require('semver').lt(process.versions.node, '4.0.0');

if (supportES5) {
    require('babel-core/polyfill');
}

var options = supportES5 ? {} : { babelrc: 'node4.babelrc' };

require('babel-core/register')(options);
