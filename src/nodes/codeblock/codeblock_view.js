"use strict";

var TextView = require('../text/text_view');

// Substance.Codeblock.View
// ==========================================================================

var CodeblockView = function(node, viewFactory) {
  TextView.call(this, node, viewFactory);
};

CodeblockView.Prototype = function() {};

CodeblockView.Prototype.prototype = TextView.prototype;
CodeblockView.prototype = new CodeblockView.Prototype();

module.exports = CodeblockView;
