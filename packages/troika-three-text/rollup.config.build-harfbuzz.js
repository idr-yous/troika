// This build file creates a static version of the harfbuzzjs library used for
// advanced text shaping. It's isolated within a "factory" function wrapper so it
// can easily be marshalled into a web worker.

import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "rollup-plugin-replace";
import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const { LERNA_ROOT_PATH } = process.env;
if (!LERNA_ROOT_PATH) {
  throw new Error("Please execute `npm run build-harfbuzz` from the repository root.");
}

const OUTPUT_TEMPLATE = `
/*!
Custom build of harfbuzzjs (https://github.com/nickshanks/libass-harfbuzz) for use in Troika text rendering.
Original MIT license applies: https://github.com/nickshanks/libass-harfbuzz/blob/master/LICENSE
*/

export default function() {
  // Trick it into being able to run in a web worker
  if (typeof window === 'undefined' && typeof self !== 'undefined') {
    self.window = self
  }

  $$CONTENT$$

  return HarfbuzzExports
}
`;

const [banner, footer] = OUTPUT_TEMPLATE.split("$$CONTENT$$");

export default {
  input: LERNA_ROOT_PATH + "/packages/troika-three-text/src/harfbuzz-entry.js",
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    commonjs({
      ignore: ["fs", "path"],
    }),
    replace({
      // Remove Node.js-specific require('fs') - not needed in browser/worker
      "require('fs')": "{}",
      'require("fs")': "{}",
      delimiters: ["", ""],
    }),
    babel({
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: { chrome: "60" },
            modules: false,
          },
        ],
      ],
      plugins: [
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-transform-optional-chaining",
        "@babel/plugin-transform-logical-assignment-operators",
        "@babel/plugin-transform-nullish-coalescing-operator",
      ],
    }),
    terser({
      ecma: 2017, // hb.js uses async/await
    }),
  ],
  output: {
    format: "iife",
    exports: "named",
    name: "HarfbuzzExports",
    file: "libs/harfbuzz.factory.js",
    banner,
    footer,
  },
};
