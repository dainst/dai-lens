var _ = require('underscore');
var Document = require('../../../node_modules/lens/substance/document/index');
var Composite = Document.Composite;

// Lens.Speech
// -----------------
//

var HTMLTable = function (node, doc) {
    Composite.call(this, node, doc);
};

// Type definition
// -----------------
//

HTMLTable.type = {
    "id": "table",
    "parent": "content",
    "properties": {
        "source_id": "string",
        "label": "string",
        "children": "object",
        "footers": ["array", "string"],
        "caption": "caption",
        "table_attributes":"object"
    }
};

HTMLTable.config = {
    "zoomable": true
};




HTMLTable.description = {
    "name": "HTMLTable",
    "remarks": [
        "A table figure which is expressed in HTML notation"
    ],
    "properties": {
        "source_id": "string",
        "label": "Label shown in the resource header.",
        "title": "Full table title",
        "children": "object",
        "footers": "HTMLTable footers expressed as an array strings",
        "caption": "References a caption node, that has all the content",
        "table_attributes": "Named Node map of attributes"
    }
};


// Example HTMLTable
// -----------------
//

HTMLTable.example = {
    "id": "table_1",
    "type": "table",
    "label": "HTMLTable 1.",
    "title": "Lorem ipsum table",
    "children": "object",
    "footers": [],
    "caption": "caption_1"
};


HTMLTable.Prototype = function () {
    this.getChildrenIds = function () {
        return this.properties.children;
    };

    this.getCaption = function () {
        if (this.properties.caption) return this.document.get(this.properties.caption);
    };

    this.getHeader = function () {
        return this.properties.label;
    };
};

HTMLTable.Prototype.prototype = Composite.prototype;
HTMLTable.prototype = new HTMLTable.Prototype();
HTMLTable.prototype.constructor = HTMLTable;

Document.Node.defineProperties(HTMLTable);

module.exports = HTMLTable;
