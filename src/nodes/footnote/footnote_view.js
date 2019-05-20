"use strict";
var _ = require('underscore');
var $$ = require("lens/substance/application").$$;
var NodeView = require("lens/article/nodes/node").View;
var ResourceView = require('lens/article/resource_view');


var LensNodes = require("lens/article/nodes");
var DefaultFootNoteView = LensNodes["footnote"].View;
var $$ = require("lens/substance/application").$$;

// Substance.Image.View
// ==========================================================================

var FootnoteView = function(node, viewFactory) {
  NodeView.apply(this, arguments);
  let options = {
    header: true,
    topLevel: true
  }
  // Mix-in
  ResourceView.call(this, options);
};

FootnoteView.Prototype = function() {
  _.extend(this, ResourceView.prototype);

  this.renderBody = function() {
    var frag = document.createDocumentFragment();
    var node = this.node;

    var children = node.properties.children.map(child => node.document.get(child));
    // this.footnoteView = this._createView(node);
    var subElements = [];
    children.forEach(child => {
      if (child.properties && child.properties.children.length){
        child.properties.children.forEach(subEl => {
          subElements.push(node.document.get(subEl))
        })
      }
      return child;
    })
    // properties.children.map(child => node.document.get(child));
    // DefaultFootNoteView.prototype.render.call(this);
    // Prepend
    // this.content.insertBefore(topBar, this.content.firstChild);
    // var titleView = this.createTextPropertyView([node.id, 'title'], { classes: 'title' });
    // this.content.append(this.footnoteView.el);
    
    return this;
  }

  this._createView = function(node) {
    var view = this.viewFactory.createView(node);
    return view;
  };
};

FootnoteView.Prototype.prototype = NodeView.prototype;
FootnoteView.prototype = new FootnoteView.Prototype();
FootnoteView.prototype.constructor = FootnoteView;

module.exports = FootnoteView;
