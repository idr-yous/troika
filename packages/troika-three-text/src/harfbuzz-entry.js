// Entry point for building the harfbuzz factory.
// This bundles the Emscripten WASM loader (hb.js) and the
// JS bindings (hbjs.js) into a single factory function.

var createHarfBuzz = require("harfbuzzjs/hb.js");
var hbjs = require("harfbuzzjs/hbjs.js");

exports.createHarfBuzz = createHarfBuzz;
exports.hbjs = hbjs;
