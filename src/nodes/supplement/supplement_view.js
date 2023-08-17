var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
// var AnnotationView = LensNodes["annotation"].View;
var NodeView = LensNodes["node"].View;
var ResourceView = require('lens/article/resource_view');
var SupplementsService = require('../linkdata_service');
var $$ = require("lens/substance/application").$$;

var SupplementView = function(node, viewFactory, options) {
  NodeView.apply(this, arguments);

  // Mix-in
  ResourceView.call(this, options);
};

SupplementView.Prototype = function() {
  _.extend(this, ResourceView.prototype);

  var service = new SupplementsService();

  // initialize the map
  this.initMap = function(id, coord) {

    // set tile layers:
    var mapLayer = L.tileLayer.wms("https://basemap.dainst.org/osm/wms?service=WMS", {
      layers: "osm:Vector--color-slow",
      tiled: true,
      format: "image/jpeg",
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var imageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    var baseMaps = {
      "Open Street Map": mapLayer,
      "World imagery": imageryLayer
    };

    var location = {lat: coord[1], lng: coord[0]};

    var map = L.map(
        document.getElementById("map_" + id), {
          zoom: 6,
          center: location,
        });

    // disable zooming by scroll wheel:
    map.scrollWheelZoom.disable();

    // show mapLayer by default:
    mapLayer.addTo(map);

    // add all layers to layer-control
    L.control.layers(baseMaps).addTo(map);
    L.control.scale().addTo(map);    // show dynamic scale (Maßstab)

    // add a marker to location:
    L.marker(location).addTo(map);
  };

  this.renderSupplement = function(supplement, type, url) {

    var $supplements = $('<div class="supplements"></div>');

    if (type === 'arachne') {

      if (supplement.images && supplement.images.length) {
       $supplements.append($(`<img class="supplement-image" loading="lazy" src="https://arachne.dainst.org/data/image/${supplement.images[0].imageId}" >`));
      }
      if (supplement.title ) {
        $supplements.append($(`<div class="supplement-title">${supplement.title}</div>`));
      }
      if (supplement.subtitle ) {
        $supplements.append($(`<div class="supplement-subtitle">${supplement.subtitle}</div>`));
      }

      var $supplementsLink = $('<div class="supplement-link"></div>');
      $supplementsLink.append($('<span>Link to iDAI.objects: </span>'));
      $supplementsLink.append($(`<a class="external" href="${url}" target="_blank" rel="noopener noreferrer"></a>`).text(url));
      $supplements.append($supplementsLink);

    }
    if (type === 'gazetteer') {
      if (supplement.gazId && supplement.location && supplement.location.coordinates && supplement.location.coordinates.length) {
        $supplements.append($(`<div style="height: 400px" id="map_${supplement.gazId}"></div>`));
      }
      if (supplement.prefName ) {
        $supplements.append($(`<div class="supplement-title">Name: ${supplement.prefName.title}</div>`));
      }
      if (supplement.location && supplement.location.coordinates && supplement.location.coordinates.length ) {
        $supplements.append($(`<div class="supplement-location">Location: Latitude: ${supplement.location.coordinates[1]}, Longitude: ${supplement.location.coordinates[0]}</div>`));
      }
      var $supplementsLink = $('<div class="supplement-link"></div>');
      $supplementsLink.append($('<span>Link to iDAI.gazetteer: </span>'));
      $supplementsLink.append($(`<a class="external" href="${url}" target="_blank" rel="noopener noreferrer"></a></span>`).text(url));
      $supplements.append($supplementsLink);
    }
    if (type === 'field') {

      if (supplement.imageSource) {
        $supplements.append($(`<img class="supplement-image" loading="lazy" src="${supplement.imageSource}" >`));

        /* onerror="var imgSrc = $(this).attr('src');
        $(this).attr('src',imgSrc); console.log('src refreshed for ' + imgSrc);"
         */
      }
      if (supplement.shortDescription) {
        $supplements.append($(`<div class="supplement-title">${supplement.shortDescription}</div>`));
      }
      var $supplementsLink = $('<div class="supplement-link"></div>');
      $supplementsLink.append($('<span>Link to iDAI.field-web: </span>'));
      $supplementsLink.append($(`<a class="external" href="${url}" target="_blank" rel="noopener noreferrer"></a>`).text(url));
      $supplements.append($supplementsLink);
    }

    this.$el.append($supplements);
    if (supplement.gazId && supplement.location && supplement.location.coordinates && supplement.location.coordinates.length) {
      this.initMap(supplement.gazId, supplement.location.coordinates);
    }


  };

  this.renderExternalLink = function(properties) {
    var $supplements = $('<div class="supplements-link"></div>');
    $supplements.append($('<a class="external" href="${properties.url}" target="_blank"></a>').text(properties.url));

    this.$el.append($supplements);
  };

  this.renderBody = function() {
    var self = this;

    if (this.node.properties && this.node.properties.urltype === 'external') {
      this.renderExternalLink(this.node.properties);
    } else {
      service.getLinkData(this.node.properties, function(err, supplements) {
        if (!err) {
          self.renderSupplement(supplements, self.node.properties.urltype, self.node.properties.url);
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
    this.$el.addClass('supplement');
  };

};
SupplementView.Prototype.prototype = NodeView.prototype;
SupplementView.prototype = new SupplementView.Prototype();

module.exports = SupplementView;
