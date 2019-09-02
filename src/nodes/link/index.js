"use strict";
var LensNodes = require("lens/article/nodes");
var LinkModel = LensNodes["link"].Model;

module.exports = {
  Model: require('./link.js'),
  View: require('./link_view.js')
};
