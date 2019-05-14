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
    cb(null, {data: 'aaaaaaaaa'})
  };
};

NotesController.Prototype.prototype = PanelController.prototype;
NotesController.prototype = new NotesController.Prototype();

module.exports = NotesController;