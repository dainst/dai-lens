var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;
var NodeView = LensNodes["node"].View;
var ResourceView = require('lens/article/resource_view');
var SupplementsService = require('./supplements_service');
var $$ = require("lens/substance/application").$$;

var LinkView = function(node, viewFactory, options) {
  NodeView.apply(this, arguments);

  // Mix-in
  ResourceView.call(this, options);
};

LinkView.Prototype = function() {
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

  // this.createElement = function() {
  //   var div = document.createElement('div');
  //   var el = null;
  //   if (this.node.properties.specificUse && this.node.properties.specificUse === "weblink"){
  //     el = document.createElement('a');
  //     el.setAttribute('target', '_blank');
  //     el.setAttribute('href', this.node.url);
  //     el.classList.add('external-link-ref')
  //     // el.addClass('external-weblink')
  //     el.text = this.node.properties.text;
    
  //   } else {
  //     el = document.createElement('span');
  //     el.textContent = this.node.url;
  //   }
  //   div.appendChild(el)
  //   return div;
  // };
  this.renderBody = function() {
    var self = this;
    this.content.appendChild($$('.label', {text: this.node.properties.title}));

    // if (this.node.url) {
    //   // Add graphic (img element)
    //   var imgEl = $$('.image-wrapper', {
    //     children: [
    //       $$("a", {
    //         href: 'this.node.url',
    //         target: "_blank",
    //         children: [$$("img", {src: 'this.node.url'})]
    //       })
    //     ]
    //   });
    //   this.content.appendChild(imgEl);
    // }
    service.getSupplements(this.node.properties.slug, function(err, supplements) {
      if (!err) {
        self.renderSupplements(supplements); 
      } else {
        console.error("Could not retrieve supplements data:", err);
      }
    });
    // this.renderChildren();
    // Attrib
    if (this.node.attrib) {
      this.content.appendChild($$('.figure-attribution', {text: this.node.attrib}));
    }
  };

  this.setClasses = function() {
    this.$el.addClass('link');
  };

};
LinkView.Prototype.prototype = NodeView.prototype;
LinkView.prototype = new LinkView.Prototype();

module.exports = LinkView;
