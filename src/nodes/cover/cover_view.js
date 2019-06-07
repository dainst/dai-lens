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
    
    if (year.length > 3) year = year.slice(2,4)
    var edition = pubInfo.volume ? pubInfo.volume.textContent : '';
    var subtitleText = pubInfo.subtitle ?  pubInfo.subtitle.textContent : '';

    // Add feeback info
    var topBar = $$('.topbar', {
      children: [
        $$('.topbar-logo', {
          html: '<a href="https://publications.dainst.org/journals/index.php/aa" ><img class="topbar-logo-img" src="AA_Logo.png" /></a>'
        }),
        $$('.topbar-title', {
          html: `<span></span>`
        }),
        $$('.topbar-date', {
          html: `<span> ${edition}/${year} </span>`
        })

      ]
    });

    var subtitle = $$('.cover-subtitle', {
      html: subtitleText
    });

    // Prepend
    this.content.insertBefore(topBar, this.content.firstChild);
    this.content.insertBefore(subtitle, this.content.childNodes[3]);
    
    return this;
  }
};

CustomCoverView.Prototype.prototype = CoverView.prototype;
CustomCoverView.prototype = new CustomCoverView.Prototype();
CustomCoverView.prototype.constructor = CustomCoverView;

module.exports = CustomCoverView;
