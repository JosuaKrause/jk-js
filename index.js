'use strict';

const jkjs = {};

function need(path) {
    Object.assign(jkjs, require(path));
}

// need('./jkjs/busy.js'); // requires images
need('./jkjs/cell.js');
// need('./jkjs/dialog.js'); // needs bootstrap & jquery
// need('./jkjs/effects.js'); // d3 / SVG
// need('./jkjs/lasso.js'); // d3 / interactive
// need('./jkjs/load.js'); // d3 for IO
// need('./jkjs/net.js'); // d3 / net
need('./jkjs/path.js');
// need('./jkjs/select.js'); // d3 / HTML
need('./jkjs/stat.js');
need('./jkjs/text.js');
need('./jkjs/time.js');
need('./jkjs/util.js'); // some functions are browser specific
// need('./jkjs/zui.js'); // d3

module.exports = jkjs;
