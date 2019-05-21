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
    var subElements = [];

    node.properties.children.map(child => {
      let elem = node.document.get(child);
      if (elem.properties && elem.properties.children.length){
        elem.properties.children.forEach(subEl => {
          let subElement = node.document.get(subEl)
          subElements.push(subElement);
          var text = this.createTextPropertyView([subElement.id, 'content'], { classes: 'content' });
          frag.appendChild(text.render().el);
        })
      }
    });

    this.content.appendChild(frag);
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
