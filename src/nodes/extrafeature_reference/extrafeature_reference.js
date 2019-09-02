
var Document = require('lens/substance/document');
var Annotation = require('lens/article/nodes/annotation/annotation');
var ResourceReference = require('lens/article/nodes/resource_reference/resource_reference');

var ExtrafeatureReference = function(node, doc) {
  ResourceReference.call(this, node, doc);
};

ExtrafeatureReference.type = {
  id: "extrafeature_reference",
  parent: "resource_reference",
  properties: {
    "target": "extrafeature"
  }
};

ExtrafeatureReference.Prototype = function() {};
ExtrafeatureReference.Prototype.prototype = ResourceReference.prototype;
ExtrafeatureReference.prototype = new ExtrafeatureReference.Prototype();
ExtrafeatureReference.prototype.constructor = ExtrafeatureReference;

// Do not fragment this annotation
ExtrafeatureReference.fragmentation = Annotation.NEVER;

Document.Node.defineProperties(ExtrafeatureReference);

module.exports = ExtrafeatureReference;
