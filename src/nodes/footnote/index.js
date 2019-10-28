"use strict";
var LensNodes = require("lens/article/nodes");
var FootNoteModel = LensNodes["footnote"].Model;

module.exports = {
  Model: require("./footnote"),
  View: require("./footnote_view")
};
