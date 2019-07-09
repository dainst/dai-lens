var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;
var NodeView = LensNodes["node"].View;
var ResourceView = require('lens/article/resource_view');
var ExtrafeatureService = require('../linkdata_service');
var $$ = require("lens/substance/application").$$;

var ExtrafeatureView = function(node, viewFactory, options) {
  NodeView.apply(this, arguments);

  // Mix-in
  ResourceView.call(this, options);
};

ExtrafeatureView.Prototype = function() {
  _.extend(this, ResourceView.prototype);

  var service = new ExtrafeatureService();
  
  this.renderExtrafeature = function(extrafeature) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle();
    var $extrafeatures = $('<div class="extrafeatures"></div>');

    Object.keys(extrafeature).forEach(key => {
      $extrafeatures.append($(`<div class="label">${key}</div>`));
      $extrafeatures.append($(`<div class="value"></div>`).text(JSON.stringify(extrafeature[key])));
      $extrafeatures.append($(`<br>`));
    })

    // var $extrafeatures = $('<div class="extrafeatures"></div>');
    // if (extrafeature.titel){
    //   $extrafeatures.append($('<div class="label">Title</div>'));
    //   $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.title));
    // }
    // if (extrafeature.subtitle){
    //   $extrafeatures.append($('<div class="label">Subtitle</div>'));
    //   $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.subtitle));
    // }

    // if (extrafeature.prefName){
    //   $extrafeatures.append($('<div class="label">Title</div>'));
    //   $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.prefName.title));
    // }

    // if (extrafeature.location){
    //   $extrafeatures.append($('<div class="label">Coordinates</div>'));
    //   $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.coordinates.join(', ')));
    // }
    
    // $extrafeatures.append($('<div class="value"></div>').text(JSON.stringify(extrafeatures, null, 2)));

    this.$el.append($extrafeatures);
  };

  this.renderExternalLink = function(properties) {
    var $extrafeatures = $('<div class="extrafeatures-link"></div>');
    $extrafeatures.append($(`<a class="external" href="${properties.url}" target="_blank"></a>`).text(properties.url));

    this.$el.append($extrafeatures);
  }

  this.renderBody = function() {
    var self = this;

    if (this.node.properties && this.node.properties.urltype === 'external') {
      this.renderExternalLink(this.node.properties)
    } else {
      service.getLinkData(this.node.properties, function(err, extrafeatures) {
        if (!err) {
          self.renderExtrafeature(extrafeatures); 
        } else {
          self.renderExternalLink(this.node.properties)
        }
      });
    }
    
    // this.renderChildren();
    // Attrib
    if (this.node.attrib) {
      this.content.appendChild($$('.figure-attribution', {text: this.node.attrib}));
    }
  };

  this.setClasses = function() {
    this.$el.addClass('extrafeature');
  };

};
ExtrafeatureView.Prototype.prototype = NodeView.prototype;
ExtrafeatureView.prototype = new ExtrafeatureView.Prototype();

module.exports = ExtrafeatureView;
