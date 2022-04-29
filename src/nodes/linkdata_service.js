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

    var shortDescription = (res.resource.shortDescription !== undefined) ? res.resource.shortDescription : false;
    var ImageSource = false;

    try{
      var group = res.resource.groups.find(group => group.fields.map(field => field.name).includes('isDepictedIn'));
      var targets = group ? group.fields.find(field => field.name === 'isDepictedIn').targets : undefined;

      // extract first related image:
      if(targets) {
        var categoryName = targets[0].resource.category.name;

        if(categoryName == "Photo" || categoryName == "Drawing") {
          var primaryImageId = targets[0].resource.id;
          var imageApiUrl = "https://field.idai.world/api/images/" + res.project + "/" + primaryImageId + ".jp2";
          var imageSpecs = "/x/full/!500,500/0/default.jpg";
          ImageSource = imageApiUrl + imageSpecs;
        }
      }
    } catch(e){
      console.log( "TypeError: targets are undefined");
    }

    return {
      project: res.project,
      shortDescription: shortDescription,
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
