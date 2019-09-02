"use strict";
var LensNodes = require("lens/article/nodes");
var PubInfoModel = LensNodes["publication_info"].Model;
module.exports = {
  Model: PubInfoModel,
  View: require("./publication_info_view")
};
