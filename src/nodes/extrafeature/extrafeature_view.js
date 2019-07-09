var _ = require('underscore');
var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;
var NodeView = LensNodes["node"].View;
var ResourceView = require('lens/article/resource_view');
var ExtrafeatureService = require('./extrafeatures_service');
var $$ = require("lens/substance/application").$$;

var ExtrafeatureView = function(node, viewFactory, options) {
  NodeView.apply(this, arguments);

  // Mix-in
  ResourceView.call(this, options);
};

ExtrafeatureView.Prototype = function() {
  _.extend(this, ResourceView.prototype);

  var service = new ExtrafeatureService();
  
  this.renderExtrafeature = function(extrafeatures) {
    // Finally data is available so we tell the panel to show up as a tab
    // this.showToggle();

    var $extrafeatures = $('<div class="extrafeatures"></div>');
    // $extrafeatures.append($('<div class="label">Title</div>'));
    // $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.title));
    // $extrafeatures.append($('<div class="label">Subtitle</div>'));
    // $extrafeatures.append($('<div class="value"></div>').text(extrafeatures.subtitle));
    $extrafeatures.append($('<div class="value"></div>').text(JSON.stringify(extrafeatures)));

    this.$el.append($extrafeatures);
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
    service.getExtrafeature(this.node.properties.slug, function(err, extrafeatures) {
      if (!err) {
        self.renderExtrafeature(extrafeatures); 
      } else {
        console.error("Could not retrieve extrafeatures data:", err);
      }
    });
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
