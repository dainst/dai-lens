var LensNodes = require("lens/article/nodes");
var AnnotationView = LensNodes["annotation"].View;

var LinkView = function(node) {
  AnnotationView.call(this, node);
};

LinkView.Prototype = function() {

  this.createElement = function() {
    var div = document.createElement('div');
    var el = document.createElement('span');
    el.setAttribute('href', this.node.url);
    if (this.node.properties.specificUse && this.node.properties.specificUse === "weblink"){
      el.setAttribute('target', '_blank');
    }
    el.textContent = this.node.url;
    div.appendChild(el)
    return div;
  };

  this.setClasses = function() {
    this.$el.addClass('link');
  };

};
LinkView.Prototype.prototype = AnnotationView.prototype;
LinkView.prototype = new LinkView.Prototype();

module.exports = LinkView;
