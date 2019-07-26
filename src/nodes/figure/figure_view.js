"use strict";

var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
var CompositeView = LensNodes["composite"].View;
var $$ = require ("lens/substance/application").$$;
var ResourceView = require('lens/article/resource_view');

// Substance.Figure.View
// ==========================================================================

var FigureView = function(node, viewFactory, options) {
  CompositeView.call(this, node, viewFactory);

  
  // Mix-in
  ResourceView.call(this, options);
};

FigureView.Prototype = function() {

  // Mix-in
  _.extend(this, ResourceView.prototype);

  this.isZoomable = true;

  // Rendering
  // =============================
  //

  this.renderBody = function() {
    this.content.appendChild($$('.label', {text: this.node.label}));
    if (this.node.url) {
      // Add graphic (img element)
      var imgEl = $$('.image-wrapper', {
        children: [
          $$("a", {
            href: this.node.url,
            target: "_blank",
            children: [$$("img", {src: this.node.url})]
          })
        ]
      });
      this.content.appendChild(imgEl);
    }
    this.renderChildren();

    if (this.node.properties.attribLink) {
      var attribLink = this.node.properties.attribLink;
      var attribText = this.node.attrib

      var linkTexts = attribText.split(attribLink.linkText)
      this.content.appendChild($$('.figure-attribution', {
        children: [
          $$("span", {
            text: linkTexts[0]
          }),
          $$("a", {
            href: this.node.properties.attribLink.url,
            class: "figure-attribution-link",
            target: "_blank",
            text: this.node.properties.attribLink.linkText
          }),
          $$("span", {
            text: linkTexts[1]
          }),
        ]
      }));
    } else if(this.node.attrib){
      this.content.appendChild($$('.figure-attribution', {text: this.node.attrib}));
    }
  };

  this.renderLabel = function() {
    var labelEl = $$('.name', {
      href: "#"
    });

    this.renderAnnotatedText([this.node.id, 'label'], labelEl);
    return labelEl;
  };

};

FigureView.Prototype.prototype = CompositeView.prototype;
FigureView.prototype = new FigureView.Prototype();

module.exports = FigureView;
