"use strict";
var LensNodes = require("lens/article/nodes");
var FootNoteModel = LensNodes["footnote"].Model;

module.exports = {
  Model: FootNoteModel,
  View: require("./footnote_view")
};
