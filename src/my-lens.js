"use strict";

var Lens = require("lens/reader");
var panels = Lens.getDefaultPanels();
var Helpers = require('./helpers')


// All available converters
var LensConverter = require("lens/converter");
var CustomConverter = require("./custom_converter");
var DaiConverter = require("./dai_converter");
var ElifeConverter = require("lens/converter/elife_converter");

var ContainerPanel = require('lens/reader/panels/container_panel');
// Custom Panels
// -------------------
// 
// The following lines enable the altmetrics panel
// which can be considered a demo implementation for a custom
// panel in Lens
// 
// Find the code in panels/altmetrics and use it as an inspiration
// to build your own Lens panel

// var notesPanel = require('./panels/notes');
// var metaDataPanel = require('./panels/metaData');

var notesPanel = new ContainerPanel({
  type: 'resource',
  name: 'footnotes',
  container: 'footnotes',
  title: 'Notes',
  icon: 'fa-book',
  references: ['footnote_reference'],
});

console.log(panels)

panels.map(panel => {
  console.log('panel', panel);
  if (panel.config.name === 'info') panel.config.title = 'Metadata'
})

// Insert altmetrics panel at next to last position
panels.splice(1, 0, notesPanel);
// panels.splice(-1, 0, metaDataPanel);

var LensApp = function(config) {
  Lens.call(this, config);
};

LensApp.Prototype = function() {

  // Custom converters
  // --------------
  // 
  // Provides a sequence of converter instances
  // Converter.match will be called on each instance with the
  // XML document to processed. The one that returns true first
  // will be chosen. You can change the order prioritize
  // converters over others

  this.getConverters = function(converterOptions) {
    return [
      new CustomConverter(converterOptions),
      new DaiConverter(converterOptions),
      new ElifeConverter(converterOptions),
      new LensConverter(converterOptions)
    ]
  };

  // Custom panels
  // --------------
  // 

  this.getPanels = function() {
    return panels.slice(0);
  };
};

LensApp.Prototype.prototype = Lens.prototype;
LensApp.prototype = new LensApp.Prototype();
LensApp.prototype.constructor = LensApp;

module.exports = LensApp;module.exports = LensApp;



function initialSetup() {
  Helpers.setCoverImage();
  Helpers.setTopBarImage();
  //Helpers.registerNavbarToggle();
  Helpers.updateCentralBar();
  Helpers.registerContentScroll();
  Helpers.registerCentralBarHighlight();
  Helpers.registerTOCHighlightFix(50);

}

//TODO: move this somewhere else


$( window ).on( "load", function() {
  if (window && window.doc) {
    initialSetup()
  } else {
    setTimeout(initialSetup, 2000);
  }
})


