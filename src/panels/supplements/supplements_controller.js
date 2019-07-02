var PanelController = require("lens/reader").PanelController;
var SupplementsView = require("./supplements_view");

var SupplementsController = function(document, config) {
  PanelController.call(this, document, config);
};

SupplementsController.Prototype = function() {
  this.createView = function() {
    return new SupplementsView(this, this.config);
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

SupplementsController.Prototype.prototype = PanelController.prototype;
SupplementsController.prototype = new SupplementsController.Prototype();

module.exports = SupplementsController;