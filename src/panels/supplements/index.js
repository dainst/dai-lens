"use strict";

var Panel = require('lens/reader').Panel;
var SupplementsController = require('./supplements_controller');

var panel = new Panel({
  name: "supplements",
  type: 'resource',
  title: 'Supplements',
  icon: 'fa-bar-chart-o',
});

panel.createController = function(doc) {
  return new SupplementsController(doc, this.config);
};

module.exports = panel;
