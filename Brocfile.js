/* jshint node:true */
"use strict";

var pkg = require("./package.json");
var multiBuilder = require("broccoli-multi-builder");
var mergeTrees = require("broccoli-merge-trees");
var testBuilder = require("broccoli-test-builder");

var options = {
  packageName: pkg.name,
};

module.exports = mergeTrees([
  multiBuilder.build("amd", options),
  multiBuilder.build("global", options),
  multiBuilder.build("commonjs", options),
  testBuilder.build(),
]);
