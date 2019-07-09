var LinkDataService = function() {
  
};

LinkDataService.Prototype = function() {

  // Get all key references for a particular article
  // ---------------
  //

  this.getLinkData = function(slug, cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: `https://arachne.dainst.org/data/entity/${slug}`,
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };

};

LinkDataService.prototype = new LinkDataService.Prototype();

var __instance__ = null;
LinkDataService.instance = function() {
  if (!__instance__) __instance__ = new LinkDataService();
  return __instance__;
};

module.exports = LinkDataService;