var _ = require('underscore');
var Document = require('lens/substance/document');

// Lens.Footnote
// -----------------
//

var Footnote = function(node, doc) {
  Document.Node.call(this, node, doc);
};

// Type definition
// -----------------
//

Footnote.type = {
  "id": "article_citation", // type name
  "parent": "content",
  "properties": {
  }
};

// This is used for the auto-generated docs
// -----------------
//

Footnote.description = {
  "name": "Footnote",
  "remarks": [
    "A journal citation.",
    "This element can be used to describe all kinds of citations."
  ],
  "properties": {
  }
};



// Example Footnote
// -----------------
//

Footnote.example = {
  "id": "article_nature08160",
  "type": "article_citation",
  "label": "5",
};


Footnote.Prototype = function() {
  this.getHeader = function() {
    return '[' + this.properties.label + ']';
  };
};

Footnote.Prototype.prototype = Document.Node.prototype;
Footnote.prototype = new Footnote.Prototype();
Footnote.prototype.constructor = Footnote;

Document.Node.defineProperties(Footnote);

module.exports = Footnote;
