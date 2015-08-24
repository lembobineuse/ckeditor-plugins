var glob = require('glob');

require('babel/register')({
    stage: 0
});
require('./gulpfile.es6.js');
