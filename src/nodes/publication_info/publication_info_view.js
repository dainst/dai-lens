"use strict";

var LensNodes = require("lens/article/nodes");
var NodeView = LensNodes["node"].View;
var $$ = require("lens/substance/application").$$;
var articleUtil = require("lens/article/article_util");

var _labels = {
  "received": "received",
  "accepted" : "accepted",
  "revised": "revised",
  "corrected": "corrected",
  "rev-recd": "revised",
  "rev-request": "returned for modification",
  "published": "published",
  "default": "updated",
};

// Lens.PublicationInfo.View
// ==========================================================================

var PublicationInfoView = function(node, viewFactory) {
  NodeView.call(this, node, viewFactory);

};

PublicationInfoView.Prototype = function() {

  this.renderAuthorInfo = function(authors, contributor) {
    if (contributor.name) {
      var authorNameEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${contributor.name.prefix} ${contributor.name.givenNames} ${contributor.name.surname}</span>`
      });
      authors.appendChild(authorNameEl);
    }
    
    if (contributor.address) {
      if (contributor.address.addrLine){
        var addressLineEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.address.addrLine}</span>`
        });
        authors.appendChild(addressLineEl);
      }
      if (contributor.address.city){
        var addressCityEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.address.city}</span>`
        });
        authors.appendChild(addressCityEl);
      }
      if (contributor.address.country){
        var addressCountryEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.address.country}</span>`
        });
        authors.appendChild(addressCountryEl);
      }
      
    
    }

    if (contributor.aff) {
      
      if (contributor.aff.institution){
        var institutionEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.aff.institution}</span>`
        });
        authors.appendChild(institutionEl);
      }
      if (contributor.aff.addrLine){
        var affAddrEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.aff.addrLine}</span>`
        });
        authors.appendChild(affAddrEl);
      }
      if (contributor.aff.city){
        var affCityEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.aff.city}</span>`
        });
        authors.appendChild(affCityEl);
      }
      if (contributor.aff.country){
        var affCountryEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${contributor.aff.country}</span>`
        });
        authors.appendChild(affCountryEl);
      }
    }
    if (contributor.address && contributor.address.email){
      var addressEmailEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${contributor.address.email}</span>`
      });
      authors.appendChild(addressEmailEl);
    }
    if (contributor.aff && contributor.aff.email){
      var addressEmailEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${contributor.aff.email}</span>`
      });
      authors.appendChild(addressEmailEl);
    }
    if (contributor.contribId) {
      var authorContribIdEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">ORCID-ID: <a class="metadata-link" target="_blank" href="${contributor.contribId}">${contributor.contribId}</a></span>`
      });
      authors.appendChild(authorContribIdEl);
    }
    if (contributor.aff && contributor.aff.institutionId){
      var institutionIdEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">GND: <a class="metadata-link" target="_blank" href="${contributor.aff.institutionId}">${contributor.aff.institutionId}</a></span>`
      });
      authors.appendChild(institutionIdEl);
    }
    authors.appendChild($$('br'));
  }


  this.render = function() {
    NodeView.prototype.render.call(this);

    // Display article meta information
    // ----------------

    var metaData = $$('.meta-data');

    // All sections commented are part of the lens native implementation. Uncomment to show them in the Metadata Panel


    // // Article Type
    // //

    // if (this.node.article_type) {
    //   var articleTypeEl = $$('.article-type.container', {
    //     children: [
    //       $$('div.label', {text: "Article Type"}),
    //       $$('div.value', {
    //         text: this.node.article_type
    //       })
    //     ]
    //   });
    //   metaData.appendChild(articleTypeEl);
    // }

    // // Subject
    // //

    // if (this.node.subjects && this.node.subjects.length > 0) {
    //   var subjectEl = $$('.subject.container', {
    //     children: [
    //       $$('div.label', {text: "Subject"}),
    //       $$('div.value', {
    //         text: this.node.subjects.join(', ')
    //       })
    //     ]
    //   });
    //   metaData.appendChild(subjectEl);
    // }

    // // Organisms
    // //

    // if (this.node.research_organisms && this.node.research_organisms.length > 0) {
    //   var organismsEl = $$('.subject.container', {
    //     children: [
    //       $$('div.label', {text: "Organism"}),
    //       $$('div.value', {
    //         text: this.node.research_organisms.join(', ')
    //       })
    //     ]
    //   });
    //   metaData.appendChild(organismsEl);
    // }

    // // Keywords
    // //

    // if (this.node.keywords && this.node.keywords.length > 0) {
    //   var keywordsEl = $$('.keywords.container', {
    //     children: [
    //       $$('div.label', {text: "Keywords"}),
    //       $$('div.value', {
    //         text: this.node.keywords.join(', ')
    //       })
    //     ]
    //   });
    //   metaData.appendChild(keywordsEl);
    // }

    // // DOI
    // //

    // if (this.node.doi) {
    //   var doiEl = $$('.doi.container', {
    //     children: [
    //       $$('div.label', {text: "DOI"}),
    //       $$('div.value', {
    //         children: [$$('a', {href: "http://dx.doi.org/"+this.node.doi, text: this.node.doi, target: '_blank'})]
    //       })
    //     ]
    //   });
    //   metaData.appendChild(doiEl);
    // }

    // // Related Article
    // //

    // if (this.node.related_article) {
    //   var relatedArticleEl = $$('.related-article.container', {
    //     children: [
    //       $$('div.label', {text: "Related Article"}),
    //       $$('div.value', {
    //         children: [$$('a', {href: this.node.related_article, text: this.node.related_article})]
    //       })
    //     ]
    //   });
    //   metaData.appendChild(relatedArticleEl);
    // }

    /** 
     * custom overriding to add publication info to metadata panel for DAI
     * */ 

    // article-meta heading
    var articleMetaHeaderEl = $$('.metadata-header', {
      html: '<span class="metadata-header-text">Article Metadata</span>'
    });
    metaData.appendChild(articleMetaHeaderEl);

    // article-title
    if (this.node.articleTitle) {
      var articleTitleEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.articleTitle}</span>`
      });
      metaData.appendChild(articleTitleEl);
    }
    // article-subtite
    if (this.node.subtitle) {
      var subtitleEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.subtitle}</span>`
      });
      metaData.appendChild(subtitleEl);
    }
    // article-issue
    if (this.node.customPubDate && this.node.issue && this.node.journalId) {
      var issueEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">Issue: ${this.node.journalId} ${this.node.customPubDate.year}/${this.node.issue}</span>`
      });
      metaData.appendChild(issueEl);
    }

    // article-issue-summary
    if (this.node.customMeta && this.node.customMeta['issue-summary']) {
      var issueEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.customMeta['issue-summary']}</span>`
      });
      metaData.appendChild(issueEl);
    }

    // article-authors
    if (this.node.customArticleContributions && this.node.customArticleContributions.length > 0) {
      var authors = $$('.authors');
          var authorsHeaderEl = $$('.metadata-title', {
            html: `<span class="metadata-title-text">Authors</span>`
          });
          authors.appendChild(authorsHeaderEl);
      this.node.customArticleContributions.forEach(contributor => {
        if (contributor.type === 'author'){
          this.renderAuthorInfo(authors, contributor)
        }
      })
      metaData.appendChild(authors);
    }

    // article-coauthors
    if (this.node.customArticleContributions && this.node.customArticleContributions.length > 0) {
      var coauthors = $$('.co-authors');
          var authorsHeaderEl = $$('.metadata-title', {
            html: `<span class="metadata-title-text">Co-Authors</span>`
          });
          coauthors.appendChild(authorsHeaderEl);
      this.node.customArticleContributions.forEach(contributor => {
        if (contributor.type === 'co-author'){
          this.renderAuthorInfo(coauthors, contributor)
        }
      })
      metaData.appendChild(coauthors);
    }

    // article-digital-edition
    var digitalEdition = $$('digitaledition')
    var deHeaderEl = $$('.metadata-title', {
      html: `<span class="metadata-title-text">Digital edition</span>`
    });
    digitalEdition.appendChild(deHeaderEl);
    if (this.node.customPermissions && this.node.customPermissions.online){
      var statementEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.customPermissions.online.statement}</span>`
      });
      digitalEdition.appendChild(statementEl);

      var issnEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">E-ISSN: ${this.node.customPermissions.online.issn}</span>`
      });
      digitalEdition.appendChild(issnEl);

      if (this.node.selfUrisObj && this.node.selfUrisObj['online-url']){
        var urlEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${this.node.selfUrisObj['online-url']}</span>`
        });
        digitalEdition.appendChild(urlEl);
      }
      digitalEdition.appendChild($$('br'))
      if (this.node.customPermissions.online.license){
        var copyrightEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">All rights reserved.</span>`
        });
        digitalEdition.appendChild(copyrightEl);
      }
      if (this.node.customPubDate){
        var publishedEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">Online Published On: ${this.node.customPubDate.day}.${this.node.customPubDate.month}.${this.node.customPubDate.year}</span>`
        });
        digitalEdition.appendChild(publishedEl);
      }
      

      if (this.node.customMeta && this.node.customMeta['citation-guideline']) {
        var citGuideEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text"> Please cite the article as follows: ${this.node.customMeta['citation-guideline']}</span>`
        });
        digitalEdition.appendChild(citGuideEl);
      }
      digitalEdition.appendChild($$('br'));
      if (this.node.selfUrisObj && this.node.selfUrisObj['pdf-url']){
        var urlEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">URN(PDF): ${this.node.selfUrisObj['pdf-url']}</span>`
        });
        digitalEdition.appendChild(urlEl);
        var urlEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">URL(Viewer): ${this.node.selfUrisObj['lens-url']}</span>`
        });
        digitalEdition.appendChild(urlEl);
      }
      digitalEdition.appendChild($$('br'));
      if (this.node.customKeywords && this.node.customKeywords.length) {
        this.node.customKeywords.forEach(keyword => {
          var words = keyword.keys.join(', ')
          var keywordEl = $$('.metadata-text-container', {
            html: `<span class="metadata-text">${keyword.title}: ${words}</span>`
          });
          digitalEdition.appendChild(keywordEl);
        })
      }
      if (this.node.customMeta && this.node.customMeta['issue-bibliography']) {
        var issueBibEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text"> Bibliographic reference: ${this.node.customMeta['issue-bibliography']}</span>`
        });
        digitalEdition.appendChild(issueBibEl);
      }
      if (this.node.customPermissions.online.license){
        var termsEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${this.node.customPermissions.online.license.terms}</span>`
        });
        digitalEdition.appendChild(termsEl);
      }
    }
    metaData.appendChild(digitalEdition);

    // article-print-edition
    var printEdition = $$('printedition')
    var deHeaderEl = $$('.metadata-title', {
      html: `<span class="metadata-title-text">Print edition</span>`
    });
    printEdition.appendChild(deHeaderEl);
    if (this.node.customPermissions && this.node.customPermissions.print){
      var statementEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.customPermissions.print.statement}</span>`
      });
      printEdition.appendChild(statementEl);
      var holderEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.customPermissions.print.holder}</span>`
      });
      printEdition.appendChild(holderEl);

      var issnEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">P-ISSN: ${this.node.customPermissions.print.issn}  ISBN: ${this.node.customPermissions.print.isbn}</span>`
      });
      printEdition.appendChild(issnEl);

      printEdition.appendChild($$('br'));

      if (this.node.customPermissions.print.license){
        var licenseEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${this.node.customPermissions.print.license.terms}</span>`
        });
        printEdition.appendChild(licenseEl);
      }
      printEdition.appendChild($$('br'));
      var podOrderEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text"> <a class="metadata-link" href="${this.node.customMeta['pod_order_link']}">${this.node.customMeta['pod-order']}</a></span>`
      });
      printEdition.appendChild(podOrderEl);
      printEdition.appendChild($$('br'));
      printEdition.appendChild($$('br'));
    }
    metaData.appendChild(printEdition);


    // journal-meta heading
    var journalMetaHeaderEl = $$('.metadata-header', {
      html: '<span class="metadata-header-text">Journal Metadata</span>'
    });

    // journal
    metaData.appendChild(journalMetaHeaderEl);
    if (this.node.properties && this.node.properties.journal){
      var journalEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.properties.journal}</span>`
      });
      metaData.appendChild(journalEl);
    }
    // journal history
     if (this.node.journalCustomMeta && this.node.journalCustomMeta['publishing-history']) {
      var historyEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['publishing-history']}</span>`
      });
      metaData.appendChild(historyEl);
    }
    metaData.appendChild($$('br'));

    // journal info
    var journalInfo = $$('journal-info')
    
    if (this.node.journalEditors) {
      var titleEl = $$('.metadata-title', {
        html: `<span class="metadata-title-text">Publisher/Editors</span>`
      });
      journalInfo.appendChild(titleEl);
      var editors = ''
      this.node.journalEditors.forEach(editor => {
        editors += `${editor.surname} ${editor.givenNames}, `
      })
      var editorsEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${editors}</span>`
      });
      journalInfo.appendChild(editorsEl);
    }
    if (this.node.publisherName) {
      var publisherNameEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.publisherName}</span>`
      });
      journalInfo.appendChild(publisherNameEl);
    }
    if (this.node.publisherLoc) {
      var publisherLocAddrEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.publisherLoc.address}</span>`
      });
      journalInfo.appendChild(publisherLocAddrEl);
      var publisherLocCityEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.publisherLoc.city}</span>`
      });
      journalInfo.appendChild(publisherLocCityEl);
      var publisherLocCountryEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.publisherLoc.country}</span>`
      });
      journalInfo.appendChild(publisherLocCountryEl);
      var publisherLocLinkEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.publisherLoc.link}</span>`
      });
      journalInfo.appendChild(publisherLocLinkEl);
    }
    metaData.appendChild(journalInfo);
    metaData.appendChild($$('br'));

    // co-editors
    if (this.node.journalCoEditors && this.node.journalCoEditors.list.length){
      var coEditorsEl = $$('co-editors')
      var coHeaderEl = $$('.metadata-title', {
        html: `<span class="metadata-title-text">Co-Editors</span>`
      });
      coEditorsEl.appendChild(coHeaderEl);

      var roleEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCoEditors.role}</span>`
      });
      coEditorsEl.appendChild(roleEl);

      var listEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCoEditors.joinedList}</span>`
      });
      coEditorsEl.appendChild(listEl);

      metaData.appendChild(coEditorsEl);
    }

    // advisory-board
    if (this.node.journalAdvisoryBoard){
      var advBoardEl = $$('advisory-board')
      var coHeaderEl = $$('.metadata-title', {
        html: `<span class="metadata-title-text">Advisory Board</span>`
      });
      advBoardEl.appendChild(coHeaderEl);

      // var roleEl = $$('.metadata-text-container', {
      //   html: `<span class="metadata-text">${this.node.journalAdvisoryBoard.role}</span>`
      // });
      // advBoardEl.appendChild(roleEl);

      var listEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalAdvisoryBoard.joinedList}</span>`
      });
      advBoardEl.appendChild(listEl);

      metaData.appendChild(advBoardEl);
    }

    metaData.appendChild($$('br'));

    // peer review
    if (this.node.journalCustomMeta && this.node.journalCustomMeta['peer-review-label']) {
      var peerReviewLabel = $$('.metadata-title', {
        html: `<span class="metadata-title-text">${this.node.journalCustomMeta['peer-review-label']}</span>`
      });
      metaData.appendChild(peerReviewLabel);
    }
    if (this.node.journalCustomMeta && this.node.journalCustomMeta['peer-review-text']) {
      var peerReviewText = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['peer-review-text']}</span>`
      });
      metaData.appendChild(peerReviewText);
    }


    // editing-typesetting
    var editingEl = $$('editing-typesetting')
    var editingHeaderEl = $$('.metadata-title', {
      html: `<span class="metadata-title-text">Editing and Typesetting</span>`
    });
    editingEl.appendChild(editingHeaderEl);

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['editing-notice-publishing-editor']) {
      var publishingEditor = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['editing-notice-publishing-editor']}</span>`
      });
      editingEl.appendChild(publishingEditor);
    }

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['editing-notice-article-submissions']) {
      var articleSubmissions = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['editing-notice-article-submissions']}</span>`
      });
      editingEl.appendChild(articleSubmissions);
    }

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['editing-notice-editing']) {
      var editing = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['editing-notice-editing']}</span>`
      });
      editingEl.appendChild(editing);
    }

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['editing-notice-typesetting']) {
      var editingTypesetting = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['editing-notice-typesetting']}</span>`
      });
      editingEl.appendChild(editingTypesetting);
    }

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['editing-notice-layout']) {
      var editingTypesetting = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['editing-notice-layout']}</span>`
      });
      editingEl.appendChild(editingTypesetting);
    }

    metaData.appendChild(editingEl);
    metaData.appendChild($$('br'));

    if (this.node.journalCustomMeta && this.node.journalCustomMeta['printing-notice']) {
      var printingNotice = $$('.metadata-text-container', {
        html: `<span class="metadata-text">${this.node.journalCustomMeta['printing-notice']}</span>`
      });
      metaData.appendChild(printingNotice);
    }

    this.content.appendChild(metaData);

    // Display article information
    // ----------------

    var articleInfo = this.node.getArticleInfo();

    var articleInfoView = this.viewFactory.createView(articleInfo);
    var articleInfoViewEl = articleInfoView.render().el;
    this.content.appendChild(articleInfoViewEl);

    return this;
  };

  // Creates an element with a narrative description of the publication history

  this.describePublicationHistory = function() {
    var datesEl = $$('.dates');
    var i;

    var dateEntries = [];
    if (this.node.history && this.node.history.length > 0) {
      dateEntries = dateEntries.concat(this.node.history);
    }
    if (this.node.published_on) {
      dateEntries.push({
        type: 'published',
        date: this.node.published_on
      });
    }

    // If there is any pub history, create a narrative following
    // 'The article was ((<action> on <date>, )+ and) <action> on <date>'
    // E.g.,
    // 'This article was published on 11. Oct. 2014'
    // 'This article was accepted on 06.05.2014, and published on 11. Oct. 2014'

    if (dateEntries.length > 0) {
      datesEl.appendChild(document.createTextNode("The article was "));
      for (i = 0; i < dateEntries.length; i++) {
        // conjunction with ', ' or ', and'
        if (i > 0) {
          datesEl.appendChild(document.createTextNode(', '));
          if (i === dateEntries.length-1) {
            datesEl.appendChild(document.createTextNode('and '));
          }
        }
        var entry = dateEntries[i];
        datesEl.appendChild(document.createTextNode((_labels[entry.type] || _labels.default)+ ' on '));
        datesEl.appendChild($$('b', {
          text: entry.date
        }));
      }
      datesEl.appendChild(document.createTextNode('.'));
    }

    return datesEl;
  };

  this.dispose = function() {
    NodeView.prototype.dispose.call(this);
  };
};

PublicationInfoView.Prototype.prototype = NodeView.prototype;
PublicationInfoView.prototype = new PublicationInfoView.Prototype();

module.exports = PublicationInfoView;
