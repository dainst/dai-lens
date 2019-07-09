var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;
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
  
  this.renderSupplements = function(supplement, type) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle();

    var $supplements = $('<div class="supplements"></div>');

    Object.keys(supplement).forEach(key => {
      $supplements.append($(`<div class="label">${key}</div>`));
      $supplements.append($(`<div class="value"></div>`).text(JSON.stringify(supplement[key])));
      $supplements.append($(`<br>`));
    })
    this.$el.append($supplements);
  };

  this.renderExternalLink = function(properties) {
    var $supplements = $('<div class="supplements-link"></div>');
    $supplements.append($(`<a class="external" href="${properties.url}" target="_blank"></a>`).text(properties.url));

    this.$el.append($supplements);
  }

  this.renderBody = function() {
    var self = this;

    if (this.node.properties && this.node.properties.urltype === 'external') {
      this.renderExternalLink(this.node.properties)
    } else {
      service.getLinkData(this.node.properties, function(err, supplements) {
        if (!err) {
          self.renderSupplements(supplements, self.node.properties.urltype); 
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
    this.$el.addClass('supplement');
  };

};
SupplementView.Prototype.prototype = NodeView.prototype;
SupplementView.prototype = new SupplementView.Prototype();

module.exports = SupplementView;
