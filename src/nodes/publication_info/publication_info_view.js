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
      this.node.customArticleContributions.forEach(contributor => {
        if (contributor.type === 'author'){
          var authors = $$('.authors');
          var authorsHeaderEl = $$('.metadata-title', {
            html: `<span class="metadata-title-text">Authors</span>`
          });
          authors.appendChild(authorsHeaderEl);
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
            if (contributor.address.email){
              var addressEmailEl = $$('.metadata-text-container', {
                html: `<span class="metadata-text">${contributor.address.email}</span>`
              });
              authors.appendChild(addressEmailEl);
            }
          
          }
          metaData.appendChild(authors);

        }
      })
    }

    // article-digital-edition
    var digitalEdition = $$('digital-edition')
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

      if (this.node.selfUrisObj && this.node.selfUrisObj['lens-url']){
        var urlEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">URL: ${this.node.selfUrisObj['lens-url']}</span>`
        });
        digitalEdition.appendChild(urlEl);
      }
      digitalEdition.appendChild($$('br'))
      if (this.node.customPermissions.online.license){
        var copyrightEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${this.node.customPermissions.online.license.copyright}</span>`
        });
        digitalEdition.appendChild(copyrightEl);
      }
      var publishedEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text">Online Published On: ????????????????????</span>`
      });
      digitalEdition.appendChild(publishedEl);

      if (this.node.customMeta && this.node.customMeta['citation-guideline']) {
        var citGuideEl = $$('.metadata-text-container', {
          html: `<span class="metadata-text">${this.node.customMeta['citation-guideline']}</span>`
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
          html: `<span class="metadata-text">URL(Viewer): ????????????????????</span>`
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
          html: `<span class="metadata-text">${this.node.customMeta['issue-bibliography']}</span>`
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
    var printEdition = $$('print-edition')
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
          html: `<span class="metadata-text">${this.node.customPermissions.print.license}</span>`
        });
        printEdition.appendChild(licenseEl);
      }
      printEdition.appendChild($$('br'));
      var urlEl = $$('.metadata-text-container', {
        html: `<span class="metadata-text"> For the print issueclick here ????????????????????</span>`
      });
      printEdition.appendChild(urlEl);
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






    if (this.node.publisherName) {
      var publisherNameEl = $$('.publisherName.container', {
        children: [
          $$('div.label', {text: "Publisher Name"}),
          $$('div.value', {text: this.node.publisherName})
        ]
      });
      metaData.appendChild(publisherNameEl);
    }

    if (this.node.publisherLoc) {
      var publisherLocEl = $$('.publisherLoc.container', {
        children: [
          $$('div.label', {text: "Publisher Location"}),
          $$('div.value', {
            children: [
              $$('.publisher-address', {text: `${this.node.publisherLoc.address}`}),
              $$('.publisher-city', {text: `${this.node.publisherLoc.city}`}),
              $$('.publisher-country', {text: `${this.node.publisherLoc.country}`}),
              $$('.publisher-link', {
                children: [
                  $$('a', {
                    href: this.node.publisherLoc.link,
                    target: "_new",
                    text: this.node.publisherLoc.link
                  })
                ]
              })
            ]
          })
        ]
      });
      metaData.appendChild(publisherLocEl);
    }

    if (this.node.journalId) {
      var journalIdEl = $$('.journalId.container', {
        children: [
          $$('div.label', {text: "Journal Id"}),
          $$('div.value', {text: this.node.journalId})
        ]
      });
      metaData.appendChild(journalIdEl);
    }

    if (this.node.articleId) {
      var articleIdEl = $$('.articleId.container', {
        children: [
          $$('div.label', {text: "Article Id"}),
          $$('div.value', {text: `${this.node.articleId.type} ${this.node.articleId.text}`})
        ]
      });
      metaData.appendChild(articleIdEl);
    }
    

    if (this.node.journal) {
      var journalNameEl = $$('.journalName.container', {
        children: [
          $$('div.label', {text: "Journal Name"}),
          $$('div.value', {text: this.node.journal})
        ]
      });
      metaData.appendChild(journalNameEl);
    }

    if (this.node.issns && this.node.issns.length) {
      this.node.issns.forEach(issn => {
        let label = `${issn.type} ${issn.format}`;
        var issnsEl = $$('.issn.container', {
          children: [
            $$('div.label', {text: label}),
            $$('div.value', {text: issn.text})
          ]
        });
        metaData.appendChild(issnsEl);
      })
    }

    if (this.node.isbns && this.node.isbns.length) {
      this.node.isbns.forEach(isbn => {
        let label = `${isbn.type} ${isbn.format}`;
        var isbnsEl = $$('.isbn.container', {
          children: [
            $$('div.label', {text: label}),
            $$('div.value', {text: isbn.text})
          ]
        });
        metaData.appendChild(isbnsEl);
      })
    }

    if (this.node.selfUris && this.node.selfUris.length) {
      this.node.selfUris.forEach(selfUri => {
        var selfUrisEl = $$('.self-uri.container', {
          children: [
            $$('b', {text: selfUri.type}),
            $$('a.self-uri-link', {
              href: selfUri.link,
              target: "_new",
              text: selfUri.link
            })
          ]
        });
        metaData.appendChild(selfUrisEl);
      })
    }

    var historyEl = this.describePublicationHistory();

    metaData.appendChild(historyEl);


    if (this.node.customKeywords && this.node.customKeywords.length) {
      this.node.customKeywords.forEach(keyword => {
        var words = keyword.keys.join(', ')
        var keywordEl = $$('.kwd.container', {
          children: [
            $$('div.label', {text: keyword.title}),
            $$('div.value', {text: words})
          ]
        });
        metaData.appendChild(keywordEl);
      })
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
