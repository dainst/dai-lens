"use strict";
var LensNodes = require("lens/article/nodes");
var FigureModel = LensNodes["figure"].Model;

module.exports = {
  Model: FigureModel,
  View: require('./figure_view.js')
};
