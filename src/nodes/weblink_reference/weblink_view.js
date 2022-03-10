var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;

var WebLinkView = function(node) {
  AnnotationView.call(this, node);
};

WebLinkView.Prototype = function() {

  this.createElement = function() {
    var el = document.createElement('a');
    var span = document.createElement('span');
    var el = null;
    if (this.node.properties.specificUse && this.node.properties.specificUse === "weblink"){
      el = document.createElement('a');
      el.setAttribute('target', '_blank');
      el.setAttribute('href', this.node.url);
      el.classList.add('external-link-ref');

    }
    return el;
  };

  this.setClasses = function() {
    this.$el.addClass('link');
  };

};
WebLinkView.Prototype.prototype = AnnotationView.prototype;
WebLinkView.prototype = new WebLinkView.Prototype();

module.exports = WebLinkView;
