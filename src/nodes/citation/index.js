"use strict";
var LensNodes = require("lens/article/nodes");
var CitationView = LensNodes["citation"].View;

module.exports = {
  Model: require('./citation'),
  View: require('./citation_view'),
};