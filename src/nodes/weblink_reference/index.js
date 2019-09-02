"use strict";
var LensNodes = require("lens/article/nodes");
var LinkModel = LensNodes["link"].Model;

module.exports = {
  Model: LinkModel,
  View: require('./weblink_view.js')
};
