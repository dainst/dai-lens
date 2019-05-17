"use strict";
var LensNodes = require("lens/article/nodes");
var DefaultFootNoteView = LensNodes["footnote"].View;
var $$ = require("lens/substance/application").$$;

// Substance.Image.View
// ==========================================================================

var FootnoteView = function(node, viewFactory) {
  DefaultFootNoteView.call(this, node, viewFactory);
};

FootnoteView.Prototype = function() {
  this.render = function() {
    DefaultFootNoteView.prototype.render.call(this);
    // Prepend
    // this.content.insertBefore(topBar, this.content.firstChild);
    
    return this;
  }
};

FootnoteView.Prototype.prototype = DefaultFootNoteView.prototype;
FootnoteView.prototype = new FootnoteView.Prototype();
FootnoteView.prototype.constructor = FootnoteView;

module.exports = FootnoteView;
