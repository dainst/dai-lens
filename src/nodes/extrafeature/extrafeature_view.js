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
    var location = {lat: coord[1], lng: coord[0]};
    var map = new google.maps.Map(
        document.getElementById("map_" + id), {zoom: 8, center: location});
    var marker = new google.maps.Marker({position: location, map: map});
  };

  this.renderExtrafeature = function(extrafeature, type, url, extrafeatureId) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle()

    var $extrafeatures = $('<div class="extrafeatures"></div>');
    if (type === 'arachne') {
      if (extrafeature.images && extrafeature.images.length) {

        $extrafeatures.append($(`<img class="extrafeature-image" loading="lazy" src="https://arachne.dainst.org/data/image/${extrafeature.images[0].imageId}" >`));
      }
      if (extrafeature.title ) {
        $extrafeatures.append($(`<div class="extrafeature-title">${extrafeature.title}</div>`));
      }
      if (extrafeature.subtitle ) {
        $extrafeatures.append($(`<div class="extrafeature-subtitle">${extrafeature.subtitle}</div>`));
      }
      var $extrafeaturesLink = $('<div class="extrafeature-link"></div>');
      $extrafeaturesLink.append($('<span>Link to iDAI.objects: </span>'));
      $extrafeaturesLink.append($(`<a class="external" href="${url}" target="_blank"></a>`).text(url));
      $extrafeatures.append($extrafeaturesLink);

    }
    if (type === 'gazetteer') {
      if (extrafeature.gazId && extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length) {
        $extrafeatures.append($(`<div style="height: 400px" id="map_${extrafeatureId}_${extrafeature.gazId}"></div>`));
      }
      if (extrafeature.prefName ) {
        $extrafeatures.append($(`<div class="extrafeature-title">Name: ${extrafeature.prefName.title}</div>`));
      }
      if (extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length ) {
        $extrafeatures.append($(`<div class="extrafeature-location">Location: Latitude: ${extrafeature.location.coordinates[1]}, Longitude: ${extrafeature.location.coordinates[0]}</div>`));
      }
      var $extrafeaturesLink = $('<div class="extrafeature-link"></div>');
      $extrafeaturesLink.append($('<span>Link to iDAI.gazetteer: </span>'));
      $extrafeaturesLink.append($(`<a class="external" href="${url}" target="_blank"></a>`).text(url));
      $extrafeatures.append($extrafeaturesLink);
    }

    if (type === 'field') {
      if (extrafeature.imageSource) {
        $extrafeatures.append($(`<img class="supplement-image" loading="lazy" src="${extrafeature.imageSource}" >`));
      }
      if (extrafeature.shortDescription) {
        $extrafeatures.append($(`<div class="supplement-title">${extrafeature.shortDescription}</div>`));
      }
      var $extrafeaturesLink = $('<div class="extrafeature-link"></div>');
      $extrafeaturesLink.append($('<span>Link to iDAI.field-web: </span>'));
      $extrafeaturesLink.append($(`<a class="external" href="${url}" target="_blank"></a>`).text(url));
      $extrafeatures.append($extrafeaturesLink);
    }

    this.$el.append($extrafeatures);
    if (extrafeature.gazId && extrafeature.location && extrafeature.location.coordinates && extrafeature.location.coordinates.length) {
      this.initMap(`${extrafeatureId}_${extrafeature.gazId}`, extrafeature.location.coordinates);
    }
  };

  this.renderExternalLink = function(properties) {
    var $extrafeatures = $('<div class="extrafeature-link"></div>');
    $extrafeatures.append($('<span>Link to iDAI.world: </span>'));
    $extrafeatures.append($(`<a class="external" href="${properties.url}" target="_blank"></a>`).text(properties.url));

    this.$el.append($extrafeatures);
  };

  this.renderBody = function() {
    var self = this;

    if (this.node.properties && this.node.properties.urltype === 'external') {
      this.renderExternalLink(this.node.properties);
    } else {
      service.getLinkData(this.node.properties, function(err, extrafeatureData) {
        if (!err) {
          self.renderExtrafeature(extrafeatureData, self.node.properties.urltype, self.node.properties.url, self.node.properties.id);
        } else {
          self.renderExternalLink(this.node.properties);
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
