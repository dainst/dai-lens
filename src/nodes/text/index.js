"use strict";
var LensNodes = require("lens/article/nodes");
var TextModel = LensNodes["text"].Model;

module.exports = {
  Model: TextModel,
  View: require("./text_view")
};