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
  if (panel.config.name === 'info') panel.config.title = 'Meta Data'
})

// Insert altmetrics panel at next to last position
panels.splice(-1, 0, notesPanel);
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

//TODO: move this somewhere else
$("img.topbar-logo-img").ready(function () {
  var navBar = function () {
    $("img.topbar-logo-img").click(function () {
      $(".resources").toggleClass("active");
    });
  }
  setTimeout(navBar, 2500);
});

$( window ).on( "load", function() { 
  var documentId = Helpers.extractDocumentIdFromUrl(window.document.URL);
  var info = window.doc.get('publication_info');
  var url = info.poster.children[0].getAttribute('xlink:href')
  let coverImageUrl = [
    Helpers.baseDocsURL,
    documentId + '/',
    url,
  ].join('');
  $("div[class='toc']").prepend( `<div><img class="cover-image" src="${coverImageUrl}"/></div>` );

})