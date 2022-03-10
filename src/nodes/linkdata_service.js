var LinkDataService = function() {

};

LinkDataService.Prototype = function() {

  // Get all key references for a particular article
  // ------------------------------------------------
  this.getBaseURLForType = {

    "arachne": "https://arachne.dainst.org/data/entity/",
    "gazetteer": "https://gazetteer.dainst.org/doc/",
    "field": "https://field.idai.world/api/documents/"
  };

  this.parseArachneData = function(res) {
    return {
      title: res.title,
      subtitle: res.subtitle,
      images: res.images,
    };
  };

  this.parseGazetteerData = function(res) {
    return {
      provenance: res.provenance,
      location: res.prefLocation,
      prefName: res.prefName,
      gazId: res.gazId
    };
  };

  this.parseFieldData = function(res) {

    var ImageSource = false;

    if(res.resource.groups[0].relations[0].targets.length) {
      var categoryName = res.resource.groups[0].relations[0].targets[0].resource.category.name;

      // extract first related image:
      if(categoryName == "Photo" || categoryName == "Drawing") {
        var primaryImageId = res.resource.groups[0].relations[0].targets[0].resource.id;
        var imageApiUrl = "https://field.idai.world/api/images/" + res.project + "/" + primaryImageId + ".jp2";
        var imageSpecs = "/x/full/!1280,1280/0/default.jpg";
        ImageSource = imageApiUrl + imageSpecs;
      }
    }

    return {
      project: res.project,
      shortDescription: res.resource.shortDescription,
      imageSource: ImageSource
    };
  };

  this.getLinkData = function(nodeProperties, cb) {
    // var doi = this.document.get('publication_info').doi;
    var self = this;
    var url = "";
    url += this.getBaseURLForType[nodeProperties.urltype];
    url += nodeProperties.slug;
		$.ajax({
		  url: url,
		  dataType: "json",
		}).done(function(res) {

          var parsedResponse = res;
          if (nodeProperties.urltype === 'arachne') {
            parsedResponse = self.parseArachneData(res);
          }
          if (nodeProperties.urltype === 'gazetteer') {
            parsedResponse = self.parseGazetteerData(res);
          }
          if (nodeProperties.urltype === 'field') {
            parsedResponse = self.parseFieldData(res);
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
