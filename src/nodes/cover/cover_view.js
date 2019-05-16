var LensNodes = require("lens/article/nodes");
var CoverView = LensNodes["cover"].View;
var $$ = require("lens/substance/application").$$;

var CustomCoverView = function(node, viewFactory) {
  CoverView.call(this, node, viewFactory);
};

CustomCoverView.Prototype = function() {
  this.render = function() {
    CoverView.prototype.render.call(this);

    var refUrl = encodeURIComponent(window.location.href);

    var titleView = this.createTextPropertyView(['document', 'title'], { classes: 'title', elementType: 'div' });

    // Add feeback info
    var topBar = $$('.topbar', {
      children: [
        $$('.topbar-logo', {
          html: '<img class="topbar-logo-img" src="AA_Logo.png" />'
        }),
        $$('.topbar-title', {
          html: `<span> ${titleView.property.value} </span>`
        })
      ]
    });

    // Prepend
    this.content.insertBefore(topBar, this.content.firstChild);
    
    return this;
  }
};

CustomCoverView.Prototype.prototype = CoverView.prototype;
CustomCoverView.prototype = new CustomCoverView.Prototype();
CustomCoverView.prototype.constructor = CustomCoverView;

module.exports = CustomCoverView;
