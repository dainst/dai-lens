
var Document = require('lens/substance/document');
var Annotation = require('lens/article/nodes/annotation/annotation');
var ResourceReference = require('lens/article/nodes/resource_reference/resource_reference');

var SupplementReference = function(node, doc) {
  ResourceReference.call(this, node, doc);
};

SupplementReference.type = {
  id: "supplement_reference",
  parent: "resource_reference",
  properties: {
    "target": "supplement"
  }
};

SupplementReference.Prototype = function() {};
SupplementReference.Prototype.prototype = ResourceReference.prototype;
SupplementReference.prototype = new SupplementReference.Prototype();
SupplementReference.prototype.constructor = SupplementReference;

// Do not fragment this annotation
SupplementReference.fragmentation = Annotation.NEVER;

Document.Node.defineProperties(SupplementReference);

module.exports = SupplementReference;
