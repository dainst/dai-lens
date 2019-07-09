var LinkDataService = function() {
  
};

LinkDataService.Prototype = function() {

  // Get all key references for a particular article
  // ---------------
  //
  this.getBaseURLForType = {
    "arachne": "https://arachne.dainst.org/data/entity/",
    "gazetteer": "https://gazetteer.dainst.org/doc/"
  }

  this.parseArachneData = function(res) {
    return {
      title: res.title,
      subtitle: res.subtitle,
      images: res.images,
    }
    // return res;
  }
  this.parseGazetteerData = function(res) {
    // return {
    //   provenance: res.provenance,
    //   location: res.prefLocation,
    //   prefName: res.prefName
    // }
    return res;
  }

  this.getLinkData = function(nodeProperties, cb) {
    // var doi = this.document.get('publication_info').doi;
    var self = this;
    var url = "";
    url += this.getBaseURLForType[nodeProperties.urltype]
    url += nodeProperties.slug
		$.ajax({
		  url: url,
		  dataType: "json",
		}).done(function(res) {
      var parsedResponse = res;
      if (nodeProperties.urltype === 'arachne') {
        parsedResponse = self.parseArachneData(res)
      }
      if (nodeProperties.urltype === 'gazetteer') {
        parsedResponse = self.parseGazetteerData(res)
      }

			cb(null, parsedResponse);
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