var SupplementsService = function() {
  
};

SupplementsService.Prototype = function() {

  // Get all key references for a particular article
  // ---------------
  //

  this.getSupplements = function(articleDOI, cb) {

    // TODO query for:
    // http://api.altmetric.com/v1/doi/10.7554/eLife.00005
    window.setTimeout(function() {
      cb(null, {
        twitter_mentions: 201
      });
    }, 1000);
  };

};

SupplementsService.prototype = new SupplementsService.Prototype();

var __instance__ = null;
SupplementsService.instance = function() {
  if (!__instance__) __instance__ = new SupplementsService();
  return __instance__;
};

module.exports = SupplementsService;