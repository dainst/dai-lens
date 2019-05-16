var LensNodes = require("lens/article/nodes");
var CoverView = LensNodes["cover"].View;
var $$ = require("lens/substance/application").$$;

var CustomCoverView = function(node, viewFactory) {
  CoverView.call(this, node, viewFactory);
};

CustomCoverView.Prototype = function() {
  this.render = function() {
    CoverView.prototype.render.call(this);
    var pubInfo = this.node.document.get('publication_info');
    var year = pubInfo.published_on || '';
    var edition = pubInfo.volume ? pubInfo.volume.textContent : ''

    // Add feeback info
    var topBar = $$('.topbar', {
      children: [
        $$('.topbar-logo', {
          html: '<img class="topbar-logo-img" src="AA_Logo.png" />'
        }),
        $$('.topbar-title', {
          html: `<span> ${window.doc.title} </span>`
        }),
        $$('.topbar-date', {
          html: `<span> ${edition}/${year} </span>`
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
