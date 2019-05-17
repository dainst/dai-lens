"use strict";

var Panel = require('lens/reader').Panel;
var NotesController = require('./notes_controller');

var panel = new Panel({
  name: "notes",
  type: 'resource',
  title: 'Notes',
  icon: 'fa-comment',
  zoom: true,
  references: ["footnote_reference"],
  label: 'Notes'
});

panel.createController = function(doc) {
  return new NotesController(doc, this.config);
};

module.exports = panel;
