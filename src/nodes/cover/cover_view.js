var LensNodes = require("lens/article/nodes");
var CoverView = LensNodes["cover"].View;
var $$ = require("lens/substance/application").$$;

var CustomCoverView = function(node, viewFactory) {
  CoverView.call(this, node, viewFactory);
};

CustomCoverView.Prototype = function() {
  this.render = function() {
    CoverView.prototype.render.call(this);

    function getTopBarDate(pubInfo) {
      var topBarDate;
      var issuePattern = window.app.config.journal_config.issue_pattern;

      var year = pubInfo.published_on || '';
      if (year.length > 3) year = year.slice(2,4);
      var edition = pubInfo.volume ? pubInfo.volume.textContent : '';

      if (issuePattern === "volume") {
        topBarDate = edition;
      } else {
        topBarDate = `${edition}/${year}`;
      }
      return topBarDate;
    }
    var pubInfo = this.node.document.get('publication_info');
    var topBarDate = getTopBarDate(pubInfo);

    var subtitleText = pubInfo.subtitle;

    // Add feeback info
    var topBar = $$('.topbar', {
      children: [
        $$('.topbar-logo', {
          html: '<a href="https://publications.dainst.org/journals/index.php/aa" ><img class="topbar-logo-img" src="' + window.app.config.journal_config.logo + '" /></a>'
        }),
        $$('.topbar-title', {
          html: `<span></span>`
        }),
        $$('.topbar-date', {
          html: `<span> ${topBarDate} </span>`
        })

      ]
    });

    var subtitle = $$('.cover-subtitle', {
      html: subtitleText
    });

    // Add coauthors
    var coauthors = pubInfo.customArticleContributions.filter(contrib => contrib.type === "co-author")
    if (coauthors.length){
      var coauthorsHtml = "<span>";
      coauthors.forEach((coauthor, idx) => {
        if( idx !== coauthors.length -1 || coauthors.length === 1){
          coauthorsHtml += `${coauthor.name.givenNames} ${coauthor.name.surname}`
          if (coauthors.length > 1 ) coauthorsHtml += ', '
        } else {
          coauthorsHtml += `${coauthor.name.givenNames} ${coauthor.name.surname}`
        }
      })
      coauthorsHtml += '</span>'
      var cover_coauthors = $$('.cover-coauthors', {
        html: coauthorsHtml
      });
    }
    // Prepend
    this.content.insertBefore(topBar, this.content.firstChild);
    this.content.insertBefore(subtitle, this.content.childNodes[3]);
    

    if (this.content.lastElementChild.className === "doi") {
      this.content.removeChild(this.content.lastElementChild)
    }

    if (this.content.lastElementChild.className === "published-on") {
      this.content.removeChild(this.content.lastElementChild)
    }

    if(coauthors.length){
      this.content.append(cover_coauthors);
    }
    
    return this;
  }
};

CustomCoverView.Prototype.prototype = CoverView.prototype;
CustomCoverView.prototype = new CustomCoverView.Prototype();
CustomCoverView.prototype.constructor = CustomCoverView;

module.exports = CustomCoverView;
