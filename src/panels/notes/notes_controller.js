var PanelController = require("lens/reader").PanelController;
var NotesView = require("./notes_view");

var NotesController = function(document, config) {
  PanelController.call(this, document, config);
};

NotesController.Prototype = function() {
  this.createView = function() {
    return new NotesView(this, this.config);
  };

  this.getNotes = function(cb) {
    let allNodes = this.document.nodes;
    let notes = [];
    let references = [];

    Object.keys(allNodes).map(nodeName => {
      console.log(nodeName)
      console.log(allNodes[nodeName])
      if (allNodes[nodeName].type === 'footnote'){
        notes.push(allNodes[nodeName])
      }
      if (allNodes[nodeName].type === 'footnote_reference'){
        references.push(allNodes[nodeName])
      }
    })

    cb(null, {notes: notes, references: references})
  };
};

NotesController.Prototype.prototype = PanelController.prototype;
NotesController.prototype = new NotesController.Prototype();

module.exports = NotesController;