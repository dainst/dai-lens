"use strict";
var ContainerPanel = require('lens/reader/panels/container_panel');

var Panel = require('lens/reader').Panel;
var SupplementsController = require('./supplements_controller');

var panel = new ContainerPanel({
  type: 'resource',
  name: 'supplements',
  container: 'supplements',
  title: 'Supplements',
  icon: 'fa-link',
  references: ['link_reference'],
});


// new Panel({
//   name: "supplements",
//   type: 'resource',
//   title: 'Supplements',
//   icon: 'fa-bar-chart-o',
// });

panel.createController = function(doc) {
  return new SupplementsController(doc, this.config);
};

module.exports = panel;
