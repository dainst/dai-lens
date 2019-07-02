"use strict";
var LensNodes = require("lens/article/nodes");
var LinkModel = LensNodes["link"].Model;

module.exports = {
  Model: LinkModel,
  View: require('./link_view.js')
};
