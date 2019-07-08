var SupplementsService = function() {
  
};

SupplementsService.Prototype = function() {

  // Get all key references for a particular article
  // ---------------
  //

  this.getSupplements = function(slug, cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: `https://arachne.dainst.org/data/entity/${slug}`,
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };

};

SupplementsService.prototype = new SupplementsService.Prototype();

var __instance__ = null;
SupplementsService.instance = function() {
  if (!__instance__) __instance__ = new SupplementsService();
  return __instance__;
};

module.exports = SupplementsService;