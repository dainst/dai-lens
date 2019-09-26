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

  this.initMap = function(id, coord) {
    // The location of Uluru
    var uluru = {lat: coord[1], lng: coord[0]};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById("map_" + id), {zoom: 8, center: uluru});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: uluru, map: map});
  }
  
  this.renderExtrafeature = function(extrafeature, type, url) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle()

    var $extrafeatures = $('<div class="extrafeatures"></div>');
    if (type === 'arachne') {
      if (extrafeature.images && extrafeature.images.length) {

        $extrafeatures.append($(`<img class="extrafeature-image" src="https://arachne.dainst.org/data/image/${extrafeature.images[0].imageId}" >`))
      }
      if (extrafeature.title ) {
        $extrafeatures.append($(`<div class="extrafeature-title">${extrafeature.title}</div>`));
      }
      if (extrafeature.subtitle ) {
        $extrafeatures.append($(`<div class="extrafeature-subtitle">${extrafeature.subtitle}</div>`));
      }
      var $extrafeaturesLink = $('<div class="extrafeature-link"></div>');
      $extrafeaturesLink.append($(`<span>Link to iDAI.world: </span>`));
      $extrafeaturesLink.append($(`<a class="external" href="${url}" target="_blank"></a>`).text(url));
      $extrafeatures.append($extrafeaturesLink)
      // $extrafeatures.append($(`<div style="height: 400px" id="map"></div>`));
      

    }
    if (type === 'gazetteer') {
      if (extrafeature.gazId && extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length) {
        $extrafeatures.append($(`<div style="height: 400px" id="map_${extrafeature.gazId}"></div>`));
      }
      if (extrafeature.prefName ) {
        $extrafeatures.append($(`<div class="extrafeature-title">Name: ${extrafeature.prefName.title}</div>`));
      }
      if (extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length ) {
        $extrafeatures.append($(`<div class="extrafeature-location">Lage: Breite: ${extrafeature.location.coordinates[1]}, Länge: ${extrafeature.location.coordinates[0]}</div>`));
      }
      var $extrafeaturesLink = $('<div class="extrafeature-link"></div>');
      $extrafeaturesLink.append($(`<span>Link to iDAI.world: </span>`));
      $extrafeaturesLink.append($(`<a class="external" href="${url}" target="_blank"></a>`).text(url));
      $extrafeatures.append($extrafeaturesLink)

    }

    this.$el.append($extrafeatures);
    if (extrafeature.gazId && extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length) {
      this.initMap(extrafeature.gazId, extrafeature.location.coordinates);
    }
    

  };

  this.renderExternalLink = function(properties) {
    var $extrafeatures = $('<div class="extrafeature-link"></div>');
    $extrafeatures.append($(`<span>Link to iDAI.world: </span>`));
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
          self.renderExtrafeature(extrafeatures, self.node.properties.urltype, self.node.properties.url); 
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
