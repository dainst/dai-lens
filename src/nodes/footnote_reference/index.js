"use strict";
var LensNodes = require("lens/article/nodes");
var FootNoteReferenceModel = LensNodes["footnote_reference"].Model;

module.exports = {
  Model: FootNoteReferenceModel,
  View: require('lens/article/nodes/resource_reference/resource_reference_view')
};
  