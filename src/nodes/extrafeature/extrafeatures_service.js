var ExtrafeaturesService = function() {
  
};

ExtrafeaturesService.Prototype = function() {

  // Get all key references for a particular article
  // ---------------
  //

  this.getExtrafeature = function(slug, cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: `https://arachne.dainst.org/data/entity/${slug}`,
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };

};

ExtrafeaturesService.prototype = new ExtrafeaturesService.Prototype();

var __instance__ = null;
ExtrafeaturesService.instance = function() {
  if (!__instance__) __instance__ = new ExtrafeaturesService();
  return __instance__;
};

module.exports = ExtrafeaturesService;