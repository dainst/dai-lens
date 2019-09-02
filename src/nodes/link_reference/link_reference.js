
var Document = require('lens/substance/document');
var Annotation = require('lens/article/nodes/annotation/annotation');
var ResourceReference = require('lens/article/nodes/resource_reference/resource_reference');

var LinkReference = function(node, doc) {
  ResourceReference.call(this, node, doc);
};

LinkReference.type = {
  id: "link_reference",
  parent: "resource_reference",
  properties: {
    "target": "link"
  }
};

LinkReference.Prototype = function() {};
LinkReference.Prototype.prototype = ResourceReference.prototype;
LinkReference.prototype = new LinkReference.Prototype();
LinkReference.prototype.constructor = LinkReference;

// Do not fragment this annotation
LinkReference.fragmentation = Annotation.NEVER;

Document.Node.defineProperties(LinkReference);

module.exports = LinkReference;
