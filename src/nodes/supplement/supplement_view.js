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
  
  this.renderSupplements = function(supplements) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle();

    var $supplements = $('<div class="supplements"></div>');
    // $supplements.append($('<div class="label">Title</div>'));
    // $supplements.append($('<div class="value"></div>').text(supplements.title));
    // $supplements.append($('<div class="label">Subtitle</div>'));
    // $supplements.append($('<div class="value"></div>').text(supplements.subtitle));
    $supplements.append($('<div class="value"></div>').text(JSON.stringify(supplements)));

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
      service.getLinkData(this.node.properties.slug, function(err, supplements) {
        if (!err) {
          self.renderSupplements(supplements); 
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
