var PanelController = require("lens/reader").PanelController;
var Lens = require('lens/reader');
var ContainerPanelController = Lens.ContainerPanelController;
var ContainerPanelView = Lens.ContainerPanelView;
var SupplementsView = require("./supplements_view");

var SupplementsController = function(document, config) {
  ContainerPanelController.call(this, document, config);
};

SupplementsController.Prototype = function() {
  this.createView = function() {
    if (!this.view) {
      var doc = this.getDocument();
      var DefaultViewFactory = doc.constructor.ViewFactory;
      var viewFactory = new DefaultViewFactory(doc.nodeTypes, this.config);
      this.view = new SupplementsView(this, viewFactory, this.config);
      // this.view = new ContainerPanelView(this, viewFactory, this.config);
    }
    return this.view;
  };

  this.getSupplements = function(cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: "https://arachne.dainst.org/data/entity/1124982",
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };
};

SupplementsController.Prototype.prototype = ContainerPanelController.prototype;
SupplementsController.prototype = new SupplementsController.Prototype();

module.exports = SupplementsController;

// var ContainerPanelController = require('../container_panel_controller');
// var ContentPanelView = require('./content_panel_view');

// var ContentPanelController = function(doc, config) {
//   ContainerPanelController.call(this, doc, config);
// };
// ContentPanelController.Prototype = function() {
//   this.createView = function() {
//     if (!this.view) {
//       var doc = this.getDocument();
//       var DefaultViewFactory = doc.constructor.ViewFactory;
//       var viewFactory = new DefaultViewFactory(doc.nodeTypes, this.config);
//       this.view = new ContentPanelView(this, viewFactory, this.config);
//     }
//     return this.view;
//   };
// };
// ContentPanelController.Prototype.prototype = ContainerPanelController.prototype;
// ContentPanelController.prototype = new ContentPanelController.Prototype();

// module.exports = ContentPanelController;