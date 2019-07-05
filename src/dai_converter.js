"use strict";

var _ = require("underscore");
var LensConverter = require('lens/converter');
var Helpers = require('./helpers')
var LensArticle = require("./article");
var CustomNodeTypes = require("./nodes");
var util = require("lens/substance/util");
var DaiConverter = function(options) {
  LensConverter.call(this, options);
};

DaiConverter.Prototype = function() {
  this.test = function(xmlDoc) {
    var publisherName = xmlDoc.querySelector("publisher-name").textContent;
    var isDaiDocument = xmlDoc.URL.search(Helpers.baseDocsURL) >= 0;
    console.log('isDaiDocument', isDaiDocument)
    return isDaiDocument;
  };

  // Override document factory so we can create a customized Lens article,
  // including overridden node types
  this.createDocument = function() {
    var doc = new LensArticle({
      nodeTypes: CustomNodeTypes
    });
    return doc;
  };


  // Override article creation to move abstract to bottom
  this.article = function(state, article) {
    var doc = state.doc;

    // Assign id
    var articleId = article.querySelector("article-id");
    // Note: Substance.Article does only support one id
    if (articleId) {
      doc.id = articleId.textContent;
    } else {
      // if no id was set we create a random one
      doc.id = util.uuid();
    }

    // Extract glossary
    this.extractDefinitions(state, article);

    // Extract authors etc.
    this.extractAffilitations(state, article);
    this.extractContributors(state, article);

    // Same for the citations, also globally
    this.extractCitations(state, article);

    // Make up a cover node
    this.extractCover(state, article);

    this.extractLinks(state, article);

    



    // Populate Publication Info node
    this.extractPublicationInfo(state, article);

    var body = article.querySelector("body");
    if (body) {
      this.body(state, body);
    }

        // Extract ArticleMeta
    this.extractArticleMeta(state, article);

    this.extractFigures(state, article);

    // catch all unhandled foot-notes
    this.extractFootNotes(state, article);

    // Extract back element, if it exists
    var back = article.querySelector("back");
    if (back){
        this.back(state,back);
    }

    this.enhanceArticle(state, article);
  };



  // Override app group to remove appendix
  this.appGroup = function(state, appGroup) {
    var apps = appGroup.querySelectorAll('app');
    var doc = state.doc;
    var title = appGroup.querySelector('title');
    if (!title) {
      console.error("FIXME: every app should have a title", this.toHtml(title));
    }

    var headingId =state.nextId("heading");
    // Insert top level element for Appendix
    var heading = doc.create({
      "type" : "heading",
      "id" : headingId,
      "level" : 1,
      "content" : "Appendices"
    });

    if (apps.length){

      this.show(state, [heading]);
      _.each(apps, function(app) {
        state.sectionLevel = 2;
        this.app(state, app);
      }.bind(this));
    }
};

  // Resolve figure urls
  // --------
  // 

  this.enhanceFigure = function(state, node, element) {
    var graphic = element.querySelector("graphic");
    var url = graphic.getAttribute("xlink:href");
    node.url = this.resolveURL(state, url);
  };

  this.extractFigures = function(state, xmlDoc) {
    console.log('override extract figures')
    // Globally query all figure-ish content, <fig>, <supplementary-material>, <table-wrap>, <media video>
    // mimetype="video"

    // NOTE: We previously only considered figures within <body> but since
    // appendices can also have figures we now use a gobal selector.
    var figureElements = xmlDoc.querySelectorAll("fig, table-wrap, supplementary-material, media[mimetype=video]");
    var nodes = [];
    for (var i = 0; i < figureElements.length; i++) {
      var figEl = figureElements[i];
      // skip converted elements
      if (figEl._converted) continue;
      var type = util.dom.getNodeType(figEl);
      var node = null;
      if (type === "fig") {
        node = this.figure(state, figEl);
      } else if (type === "table-wrap") {
        node = this.tableWrap(state, figEl);
      } else if (type === "media") {
        node = this.video(state, figEl);
      } else if (type === "supplementary-material") {
        node = this.supplement(state, figEl);
      }
      if (node) {
        // adding custom behaviour here to skip cover images
        if (node.source_id !== 'poster-image')
        nodes.push(node);
      }
    }
    this.show(state, nodes);
  };

  this.enhancePublicationInfo = function(state, pubInfo) {
    var volume = state.xmlDoc.querySelector("volume");
    var articleTitle = state.xmlDoc.querySelector("article-title");
    var subtitle = state.xmlDoc.querySelector("subtitle");
    var customMeta = {}
    var customMetaEls = state.xmlDoc.querySelectorAll('article-meta custom-meta');
    for (var i = 0; i < customMetaEls.length; i++) {
      var customMetaEl = customMetaEls[i];
      var metaNameEl = customMetaEl.querySelector('meta-name');
      var metaValueEl = customMetaEl.querySelector('meta-value');
      if (metaNameEl && metaValueEl){
        customMeta[metaNameEl.textContent] = metaValueEl.textContent;
      }
    }
    var podOrderLink = state.xmlDoc.querySelector('ext-link[ext-link-type="pod-order"]')
    if (podOrderLink) {
      customMeta['pod_order_link'] = podOrderLink.getAttribute('xlink:href')
    }

    var pubDate = {};
    var pubDateEl = state.xmlDoc.querySelector("pub-date");
    if (pubDateEl) {
      var pubDateYearEl = pubDateEl.querySelector("year");
      if (pubDateYearEl) pubDate['year'] = pubDateYearEl.textContent;
      var pubDateMonthEl = pubDateEl.querySelector("month");
      if (pubDateMonthEl) pubDate['month'] = pubDateMonthEl.textContent;
      var pubDateDayEl = pubDateEl.querySelector("day");
      if (pubDateDayEl) pubDate['day'] = pubDateDayEl.textContent;
    }

    var customArticleContributions = [];
    var contribGroups = state.xmlDoc.querySelectorAll("article-meta contrib-group");
    if (contribGroups) {
      _.each(contribGroups, (contribGroup) => {
        var contribs = contribGroup.querySelectorAll('contrib')
        _.each(contribs, (contrib) => {
          var customArticleContribution = {}
          var type = contrib.getAttribute('contrib-type');
          if (type) customArticleContribution['type'] = type
          var nameEl = contrib.querySelector('name')
          var addressEl = contrib.querySelector('address')
          var affEl = contrib.querySelector('aff')
          if (nameEl){
            let surnameEl  = nameEl.querySelector('surname')
            let givenNamesEl  = nameEl.querySelector('given-names')
            let prefixEl  = nameEl.querySelector('prefix')
            customArticleContribution['name'] = {
              surname: surnameEl ? surnameEl.textContent : '',
              givenNames: givenNamesEl ? givenNamesEl.textContent : '',
              prefix: prefixEl ? prefixEl.textContent : '',
            };
          }
          if (addressEl){
            let labelEl  = addressEl.querySelector('label')
            let addrLineEl  = addressEl.querySelector('addr-line')
            let cityEl  = addressEl.querySelector('city')
            let countryEl  = addressEl.querySelector('country')
            let emailEl  = addressEl.querySelector('email')
            customArticleContribution['address'] = {
              label: labelEl ? labelEl.textContent : '',
              addrLine: addrLineEl ? addrLineEl.textContent : '',
              city: cityEl ? cityEl.textContent : '',
              country: countryEl ? countryEl.textContent : '',
              email: emailEl ? emailEl.textContent : '',
            };
          }
          if (affEl){
            let institutionEl  = affEl.querySelector('institution')
            let cityEl  = affEl.querySelector('city')
            let countryEl  = affEl.querySelector('country')
            customArticleContribution['aff'] = {
              institution: institutionEl ? institutionEl.textContent : '',
              city: cityEl ? cityEl.textContent : '',
              country: countryEl ? countryEl.textContent : '',
            };
          }
          customArticleContributions.push(customArticleContribution)
        }, this)
        this.contribGroup(state, contribGroup);
      }, this)
      
    }

    // var digitalEdition = {};
    // digitalEdition.title = 'Digital edition'

    // var printEdition = {};
    // digitalEdition.title = 'Digital edition'
    var permissions = {online: {}, print: {}};
    var permissionsEl = state.xmlDoc.querySelector("article-meta permissions")
    if (permissionsEl) {
      var statementElements = permissionsEl.querySelectorAll('copyright-statement');
      if (statementElements){
        statementElements.forEach(statementEl => {
          let type = statementEl.getAttribute('content-type');
          if (type) {
              permissions[type]['statement'] = statementEl.textContent
          }
        })
      }
      var holderElements = permissionsEl.querySelectorAll('copyright-holder');
      if (holderElements){
        holderElements.forEach(holderEl => {
          let type = holderEl.getAttribute('content-type');
          if (type) {
              permissions[type]['holder'] = holderEl.textContent
          }
        })
      }
      var licenseElements = permissionsEl.querySelectorAll('license');
      if (licenseElements){
        licenseElements.forEach(licenseEl => {
          let type = licenseEl.getAttribute('license-type');
          if (type === 'print') {
            let printLicense = {};
            printLicense.href = licenseEl.getAttribute('xlink:href')
            let copyrightEl = licenseEl.querySelector('license-p[content-type="copyright"]')
            let termsEl = licenseEl.querySelector('license-p[content-type="terms-of-use"]')
            if (copyrightEl){
              printLicense.copyright = copyrightEl.textContent
            }
            if (termsEl){
              printLicense.terms = termsEl.textContent
            }
            permissions[type]['license'] = printLicense;
          }
          if (type === 'online'){
            let onlineLicense = {};
            onlineLicense.href = licenseEl.getAttribute('xlink:href')
            let copyrightEl = licenseEl.querySelector('license-p[content-type="copyright"]')
            let termsEl = licenseEl.querySelector('license-p[content-type="terms-of-use"]')
            if (copyrightEl){
              onlineLicense.copyright = copyrightEl.textContent
            }
            if (termsEl){
              onlineLicense.terms = termsEl.textContent
            }
            permissions[type]['license'] = onlineLicense;
          }
        })
      }
    }



    var poster = state.xmlDoc.querySelector("fig#poster-image");
    var journalId = state.xmlDoc.querySelector("journal-id");
    var articleIdElem = state.xmlDoc.querySelector("article-id");

    var articleId = articleIdElem ? {
      type: articleIdElem.getAttribute('pub-id-type'),
      text: articleIdElem.textContent
    }
    :
    '';
    
    var publisherName = state.xmlDoc.querySelector("publisher-name");
    var publisherLocAddrElem = state.xmlDoc.querySelector("publisher-loc addr-line");
    var publisherLocCityElem = state.xmlDoc.querySelector("publisher-loc city");
    var publisherLocCountryElem = state.xmlDoc.querySelector("publisher-loc country");
    var publisherLocLinkElem = state.xmlDoc.querySelector("publisher-loc ext-link");
    var publisherLoc = {
      address: publisherLocAddrElem ? publisherLocAddrElem.textContent : '',
      city: publisherLocAddrElem ? publisherLocCityElem.textContent : '',
      country: publisherLocAddrElem ? publisherLocCountryElem.textContent : '',
      link: publisherLocAddrElem ? publisherLocLinkElem.textContent : ''
    }

    var issnElements = state.xmlDoc.querySelectorAll("issn");
    var isbnElements = state.xmlDoc.querySelectorAll("isbn");

    var issns = [];
    issnElements.forEach(issnelem => {
      issns.push({
        format: issnelem.getAttribute('publication-format'),
        type: issnelem.tagName,
        text: issnelem.textContent
      })
      permissions[issnelem.getAttribute('publication-format')]['issn'] = issnelem.textContent;

    })
    var isbns = [];

    isbnElements.forEach(isbnelem => {
      isbns.push({
        format: isbnelem.getAttribute('publication-format'),
        type: isbnelem.tagName,
        text: isbnelem.textContent
      })
      permissions[isbnelem.getAttribute('publication-format')]['isbn'] = isbnelem.textContent;
    })

    var selfUriElements = state.xmlDoc.querySelectorAll("self-uri");
    var selfUris = [];
    var selfUrisObj = {};

    selfUriElements.forEach(selfUriElem => {
      selfUris.push({
        type: selfUriElem.getAttribute('content-type'),
        link: selfUriElem.textContent
      })
      selfUrisObj[selfUriElem.getAttribute('content-type')] = selfUriElem.textContent
    })

    var issue = state.xmlDoc.querySelector("issue");


    var keywordElements = state.xmlDoc.querySelectorAll("kwd-group");
    var keywords = [];

    keywordElements.forEach(keywordElem => {
      let lang = keywordElem.getAttribute('xml:lang');
      if (lang == 'en'){
        let titleElem = keywordElem.querySelector('title');
        let keyElems = keywordElem.querySelectorAll("kwd");
        let keys = [];
        keyElems.forEach(key => {
          keys.push(key.textContent)
        })
        keywords.push({
          lang: keywordElem.getAttribute('xml:lang'),
          title: titleElem.textContent,
          keys: keys
        })
      }
      
    })


    var journalCustomMeta = {}
    var customMetaEls = state.xmlDoc.querySelectorAll('journal-meta custom-meta');
    for (var i = 0; i < customMetaEls.length; i++) {
      var customMetaEl = customMetaEls[i];
      var metaNameEl = customMetaEl.querySelector('meta-name');
      var metaValueEl = customMetaEl.querySelector('meta-value');
      if (metaNameEl && metaValueEl){
        journalCustomMeta[metaNameEl.textContent] = metaValueEl.textContent;
      }
    }

    var journalEditors = [];
    var journalEditorsEls =  state.xmlDoc.querySelectorAll('contrib[contrib-type="Editor"]');
    if (journalEditorsEls) {
      journalEditorsEls.forEach(editorEl => {
        let surnameEl  = editorEl.querySelector('surname')
        let givenNamesEl  = editorEl.querySelector('given-names')
        journalEditors.push({surname: surnameEl.textContent, givenNames: givenNamesEl.textContent })
      })
    }

    var journalCoEditors = {role: '', list: []};
    var journalCoEditorGroupEl =  state.xmlDoc.querySelector('contrib-group[content-type="Mitherausgeber/Co-Editors"]');
    if (journalCoEditorGroupEl) {
      let roleEl = journalCoEditorGroupEl.querySelector('role');
      if (roleEl) journalCoEditors.role = roleEl.textContent;
    }
    var journalCoEditorsEls = state.xmlDoc.querySelectorAll('contrib[contrib-type="Co-Editor"]');
    journalCoEditorsEls.forEach(coEditor => {
      let surnameEl  = coEditor.querySelector('surname')
      let givenNamesEl  = coEditor.querySelector('given-names')
      let cityEl  = coEditor.querySelector('city')
      journalCoEditors.list.push(`${givenNamesEl.textContent} ${surnameEl.textContent} (${cityEl.textContent})`)
    })

    var journalAdvisoryBoard = {role: '', list: []};
    var journalAdvBoardGroupEl =  state.xmlDoc.querySelector('contrib-group[content-type="Wissenschaftlicher Beirat/Advisory Board"]');
    if (journalAdvBoardGroupEl) {
      let roleEl = journalAdvBoardGroupEl.querySelector('role');
      if (roleEl) journalAdvisoryBoard.role = roleEl.textContent;
    }
    var journalAdvisoryBoardEls = state.xmlDoc.querySelectorAll('contrib[contrib-type="Advisory Board Member"]');
    journalAdvisoryBoardEls.forEach(coEditor => {
      let surnameEl  = coEditor.querySelector('surname')
      let givenNamesEl  = coEditor.querySelector('given-names')
      let cityEl  = coEditor.querySelector('city')
      journalAdvisoryBoard.list.push(`${givenNamesEl.textContent} ${surnameEl.textContent} (${cityEl.textContent})`)
    })
    journalAdvisoryBoard.joinedList = journalAdvisoryBoard.list.join(', ')



    var publicationInfo = state.doc.get('publication_info');
    publicationInfo.volume = volume;
    publicationInfo.subtitle = subtitle.textContent;
    publicationInfo.articleTitle = articleTitle.textContent;
    publicationInfo.customMeta = customMeta;
    publicationInfo.customPubDate = pubDate
    publicationInfo.customArticleContributions = customArticleContributions
    publicationInfo.customPermissions = permissions
    publicationInfo.poster = poster;
    publicationInfo.journalId = journalId.textContent;
    publicationInfo.articleId = articleId;
    publicationInfo.publisherName = publisherName.textContent;
    publicationInfo.publisherLoc = publisherLoc;
    publicationInfo.issns = issns;
    publicationInfo.isbns = isbns;
    publicationInfo.selfUris = selfUris;
    publicationInfo.selfUrisObj = selfUrisObj;
    publicationInfo.issue = issue ? issue.textContent : '';
    publicationInfo.customKeywords = keywords;
    publicationInfo.journalCustomMeta = journalCustomMeta;
    publicationInfo.journalEditors = journalEditors;
    publicationInfo.journalCoEditors = journalCoEditors;
    publicationInfo.journalAdvisoryBoard = journalAdvisoryBoard;
    

    pubInfo.enhancedInfo = publicationInfo;

  }

  // Example url to JPG: http://cdn.elifesciences.org/elife-articles/00768/svg/elife00768f001.jpg
  this.resolveURL = function(state, url) {
    // Use absolute URL
    if (url.match(/http:\/\//)) return url;

    // Look up base url
    var baseURL = this.getBaseURL(state);

    if (baseURL) {
      return [baseURL, url].join('');
    } else {
      // Use special URL resolving for production articles
      // get the document id from the url
      let documentId = '0000'
      if (state && state.xmlDoc) {
        let fullUrl = state.xmlDoc.URL;
        documentId = Helpers.extractDocumentIdFromUrl(fullUrl)
      }

      let pictureUrl = [
        Helpers.baseDocsURL,
        documentId + '/',
        url,
      ].join('');

      return pictureUrl;
    }
  };

  this.extractFootNotes = function(state, article) {
    console.log('called dai extract footnotes')
    var fnEls = article.querySelectorAll('fn');
    for (var i = 0; i < fnEls.length; i++) {
      var fnEl = fnEls[i];
      if (fnEl.__converted__) continue;
      var footnote = this.footnote(state, fnEl);
      
      state.doc.show("footnotes", footnote.id);
    }
  };

  this.extractLinks = function(state, article) {

    var linkEls = article.querySelectorAll('ext-link[ext-link-type="uri"]');
    for (var i = 0; i < linkEls.length; i++) {
      var specUse = linkEls[i].getAttribute('specific-use')
      if (specUse === "supplements" || specUse === "extrafeatures") {
        var linkEl = linkEls[i];
        if (linkEl.__converted__) continue;
        var link = this.link(state, linkEl);
        state.doc.show("supplements", link.id);
      }
      
    }
  };

  this.link = function(state, linkElement) {
    var doc = state.doc;
    var nextId = state.nextId('link')
    var link = {
      type: 'link',
      id: nextId,
      source_id: nextId,
      label: 'link',
      children: [],
      url: '',
      title: ''
    };
    link.title = linkElement.textContent;
    link.url = linkElement.getAttribute('xlink:href')
    doc.create(link);
    // leave a trace for the catch-all converter
    // to know that this has been converted already
    linkElement.__converted__ = true;
    return link;
  };

  this.citation = function(state, ref, citation) {
    console.log('called dai citation')
    var doc = state.doc;
    var citationNode;
    var i;

    var id = state.nextId("article_citation");

    // TODO: we should consider to have a more structured citation type
    // and let the view decide how to render it instead of blobbing everything here.
    var personGroup = citation.querySelector("person-group");

    // HACK: we try to create a 'articleCitation' when there is structured
    // content (ATM, when personGroup is present)
    // Otherwise we create a mixed-citation taking the plain text content of the element
    if (true) {

      citationNode = {
        "id": id,
        "source_id": ref.getAttribute("id"),
        "type": "citation",
        "title": "N/A",
        "label": "",
        "authors": [],
        "doi": "",
        "source": "",
        "volume": "",
        "fpage": "",
        "lpage": "",
        "citation_urls": [],
        "custom_urls": []
      };

      if (personGroup) {
        var nameElements = personGroup.querySelectorAll("name");
        for (i = 0; i < nameElements.length; i++) {
          citationNode.authors.push(this.getName(nameElements[i]));
        }
  
        // Consider collab elements (treat them as authors)
        var collabElements = personGroup.querySelectorAll("collab");
        for (i = 0; i < collabElements.length; i++) {
          citationNode.authors.push(collabElements[i].textContent);
        }
      }



      var source = citation.querySelector("source");
      if (source) citationNode.source = source.textContent;

      citationNode.title = citation.textContent;

      var volume = citation.querySelector("volume");
      if (volume) citationNode.volume = volume.textContent;

      var publisherLoc = citation.querySelector("publisher-loc");
      if (publisherLoc) citationNode.publisher_location = publisherLoc.textContent;

      var publisherName = citation.querySelector("publisher-name");
      if (publisherName) citationNode.publisher_name = publisherName.textContent;

      var fpage = citation.querySelector("fpage");
      if (fpage) citationNode.fpage = fpage.textContent;

      var lpage = citation.querySelector("lpage");
      if (lpage) citationNode.lpage = lpage.textContent;

      var year = citation.querySelector("year");
      if (year) citationNode.year = year.textContent;

      // Note: the label is child of 'ref'
      var label = ref.querySelector("label");
      if(label) citationNode.label = label.textContent;

      var doi = citation.querySelector("pub-id[pub-id-type='doi'], ext-link[ext-link-type='doi']");
      if(doi) citationNode.doi = "http://dx.doi.org/" + doi.textContent;

      // customized url extraction
      var ext_links = citation.querySelectorAll("ext-link[ext-link-type='uri']")
      _.each(ext_links, link => {
        var specificUse = link.getAttribute('specific-use')
        var linkRef = link.getAttribute('xlink:href')
        if (linkRef && linkRef !== "") {
          citationNode.custom_urls.push({
            url: linkRef,
            specificUse: specificUse
          })
        }
      })
    } else {
      console.error("FIXME: there is one of those 'mixed-citation' without any structure. Skipping ...", citation);
      return;
      // citationNode = {
      //   id: id,
      //   type: "mixed_citation",
      //   citation: citation.textContent,
      //   doi: ""
      // };
    }

    doc.create(citationNode);
    doc.show("citations", id);

    return citationNode;
  };

  this.abstracts = function(state, articleMeta) {
    var doc = state.doc;
    var nodes = [];
    // <abstract> Abstract, zero or more
    var abstracts = articleMeta.querySelectorAll("abstract");
    var trans_abstracts = articleMeta.querySelectorAll("trans-abstract");
    if (abstracts || trans_abstracts) {
        var heading = {
          id: state.nextId("heading"),
          type: "heading",
          level: 1,
          content: "Abstracts"
        };
    
        doc.create(heading);
        nodes.push(heading);
        this.show(state, nodes);
      _.each(abstracts, function(abs) {
        this.abstract(state, abs);
      }, this);
      _.each(trans_abstracts, function(abs) {
        this.abstract(state, abs);
      }, this);
    }
    
  };

  this.abstract = function(state, abs) {
    var doc = state.doc;
    var nodes = [];

    // hack to show a margin on top of abstract title
    var underline_heading = {
      id: 'abstract_title_hr',
      type: "text",
      content: ' ',
    };
    doc.create(underline_heading);
    nodes.push(underline_heading);

    var title = abs.querySelector("title");

    var heading = {
      id: state.nextId("heading"),
      type: "heading",
      level: 3,
      content: title ? title.textContent : "Abstract",
    };

    doc.create(heading);
    nodes.push(heading);

    

    // with eLife there are abstracts having an object-id.
    // TODO: we should store that in the model instead of dropping it

    nodes = nodes.concat(this.bodyNodes(state, util.dom.getChildren(abs), {
      ignore: ["title", "object-id"]
    }));

    if (nodes.length > 0) {
      this.show(state, nodes);
    }
  };

  this.extractContributors = function(state, article) {
    // TODO: the spec says, that there may be any combination of
    // 'contrib-group', 'aff', 'aff-alternatives', and 'x'
    // However, in the articles seen so far, these were sub-elements of 'contrib-group', which itself was single
    var contribGroups = article.querySelectorAll("article-meta contrib-group");
    if (contribGroups) {
      
      _.each(contribGroups, (contribGroup) => {
        // var groupNameEl = contribGroup.querySelector('role');
        // if (groupNameEl && groupNameEl.textContent){
        //   var header = {
        //     "type" : "heading",
        //     "id" : state.nextId("heading"),
        //     "level" : 5,
        //     "content" : "",
        //   };
        //   header.content = groupNameEl.textContent
        //   doc.create(header);
        //   doc.show("info", header.id);
        // }
        this.contribGroup(state, contribGroup);
      }, this)
      
    }

    var journalContribGroups = article.querySelectorAll("journal-meta contrib-group");
    if (journalContribGroups) {
      
      _.each(journalContribGroups, (contribGroup) => {
        // var groupNameEl = contribGroup.querySelector('role');
        // if (groupNameEl && groupNameEl.textContent){
        //   var header = {
        //     "type" : "heading",
        //     "id" : state.nextId("heading"),
        //     "level" : 5,
        //     "content" : "",
        //   };
        //   header.content = groupNameEl.textContent
        //   doc.create(header);
        //   doc.show("info", header.id);
        // }
          
        this.contribGroup(state, contribGroup);
      }, this)
    }
  };

  this.contributor = function(state, contrib) {
    var doc = state.doc;

    var id = state.nextId("contributor");
    var contribNode = {
      id: id,
      source_id: contrib.getAttribute("id"),
      type: "contributor",
      name: "",
      affiliations: [],
      fundings: [],
      bio: [],

      // Not yet supported... need examples
      image: "",
      deceased: false,
      emails: [],
      contribution: "",
      members: []
    };

    // Extract contrib type
    var contribType = contrib.getAttribute("contrib-type");

    // Assign human readable version
    contribNode["contributor_type"] = this._contribTypeMapping[contribType];

    // Extract role
    var role = contrib.querySelector("role");
    if (role) {
      contribNode["role"] = role.textContent;
    }

    // Search for author bio and author image
    var bio = contrib.querySelector("bio");
    if (bio) {
      _.each(util.dom.getChildren(bio), function(par) {
        var graphic = par.querySelector("graphic");
        if (graphic) {
          var imageUrl = graphic.getAttribute("xlink:href");
          contribNode.image = imageUrl;
        } else {
          var pars = this.paragraphGroup(state, par);
          if (pars.length > 0) {
            contribNode.bio = [ pars[0].id ];
          }
        }
      }, this);
    }

    // Deceased?

    if (contrib.getAttribute("deceased") === "yes") {
      contribNode.deceased = true;
    }

    // Extract ORCID
    // -----------------
    //
    // <uri content-type="orcid" xlink:href="http://orcid.org/0000-0002-7361-560X"/>

    var orcidURI = contrib.querySelector("uri[content-type=orcid]");
    if (orcidURI) {
      contribNode.orcid = orcidURI.getAttribute("xlink:href");
    }

    // Extracting equal contributions
    var nameEl = contrib.querySelector("name");
    if (nameEl) {
      contribNode.name = this.getName(nameEl);
    } else {
      var collab = contrib.querySelector("collab");
      // Assuming this is an author group
      if (collab) {
        contribNode.name = collab.textContent;
      } else {
        contribNode.name = "N/A";
      }
    }

    this.extractContributorProperties(state, contrib, contribNode);


    // HACK: for cases where no explicit xrefs are given per
    // contributor we assin all available affiliations
    if (contribNode.affiliations.length === 0) {
      contribNode.affiliations = state.affiliations;
    }

    // HACK: if author is assigned a conflict, remove the redundant
    // conflict entry "The authors have no competing interests to declare"
    // This is a data-modelling problem on the end of our input XML
    // so we need to be smart about it in the converter
    if (contribNode.competing_interests.length > 1) {
      contribNode.competing_interests = _.filter(contribNode.competing_interests, function(confl) {
        return confl.indexOf("no competing") < 0;
      });
    }

    if (contrib.getAttribute("contrib-type") === "author") {
      doc.nodes.document.authors.push(id);
    }

    // Here starts DAI custom code
    var addressEl = contrib.querySelector("address");
    if (addressEl) {
      var address = {
        city: '',
        country: '',
        email: '',
        addressLine: '',
        label: ''
      };
      var labelEl = addressEl.querySelector("label");
      if (labelEl) address.label = labelEl.textContent;
      var cityEl = addressEl.querySelector("city");
      if (cityEl) address.city = cityEl.textContent;
      var countryEl = addressEl.querySelector("country");
      if (countryEl) address.country = countryEl.textContent;
      var emailEl = addressEl.querySelector("email");
      if (emailEl) {
        address.email = emailEl.textContent;
        contribNode.emails.push(address.email)
      }
      var addressLineEl = addressEl.querySelector("addr-line");
      if (addressLineEl) address.addressLine = addressLineEl.textContent;
      contribNode.addressInfo = address;
      contribNode.present_address = `${address.addressLine},${address.city},${address.country}`;
    }

    if (!contribNode.role) contribNode.role = contribType
    



    doc.create(contribNode);
    // doc.show("info", contribNode.id);
  };

  this.extractCustomMetaGroup = function(state, article) {
    var nodeIds = [];
    var doc = state.doc;

    // var customMetaEls = article.querySelectorAll('custom-meta');
    // if (customMetaEls.length === 0) return nodeIds;

    // for (var i = 0; i < customMetaEls.length; i++) {
    //   var customMetaEl = customMetaEls[i];

    //   var metaNameEl = customMetaEl.querySelector('meta-name');
    //   var metaValueEl = customMetaEl.querySelector('meta-value');

    //   if (!_.include(this.__ignoreCustomMetaNames, metaNameEl.textContent)) {
    //     var header = {
    //       "type" : "heading",
    //       "id" : state.nextId("heading"),
    //       "level" : 3,
    //       "content" : ""
    //     };
    //     header.content = this.annotatedText(state, metaNameEl, [header.id, 'content']);
    //     doc.create(header);
    //     var bodyNodes = this.paragraphGroup(state, metaValueEl);

    //     nodeIds.push(header.id);
    //     nodeIds = nodeIds.concat(_.pluck(bodyNodes, 'id'));
    //   }
    // }
    return nodeIds;
  };

  this.extractCopyrightAndLicense = function(state, article) {
    var nodes = [];
    var doc = state.doc;

    // var license = article.querySelector("permissions");
    // if (license) {
    //   var h1 = {
    //     "type" : "heading",
    //     "id" : state.nextId("heading"),
    //     "level" : 3,
    //     "content" : "Copyright & License"
    //   };
    //   doc.create(h1);
    //   nodes.push(h1.id);

    //   // TODO: this is quite messy. We should introduce a dedicated note for article info
    //   // and do that rendering related things there, e.g., '. ' separator

    //   var par;
    //   var copyrights = license.querySelectorAll("copyright-statement");

    //   if (copyrights) {
    //     copyrights.forEach(copyright => {
    //       par = this.paragraphGroup(state, copyright);
    //       if (par && par.length) {
    //         nodes = nodes.concat( _.map(par, function(p) { return p.id; } ) );
    //         // append '.' only if there is none yet
    //         if (copyright.textContent.trim().slice(-1) !== '.') {
    //           // TODO: this needs to be more robust... what if there are no children
    //           var textid = _.last(_.last(par).children);
    //           doc.nodes[textid].content += ". ";
    //         }
    //       }
    //     })

    //   }
    //   var licences = license.querySelectorAll("license");
    //   if (licences) {
    //     licences.forEach(lic => {
    //       for (var child = lic.firstElementChild; child; child = child.nextElementSibling) {
    //         var type = util.dom.getNodeType(child);
    //         if (type === 'p' || type === 'license-p') {
    //           par = this.paragraphGroup(state, child);
    //           if (par && par.length) {
    //             nodes = nodes.concat( _.pluck(par, 'id') );
    //           }
    //         }
    //       }
    //     })
        
    //   }
    // }

    return nodes;
  };

  var linkID = 1;

  this.enhanceAnnotationData = function(state, anno, el, type){
    var styleType = el.getAttribute('style-type');
    if (styleType) {
      anno.name = styleType
    }
    var specificUse = el.getAttribute('specific-use');
    if (specificUse) {
      anno.specificUse = specificUse;
      if (specificUse !== "weblink") {
        anno.type = "link_reference";
        anno.target = "link_" + linkID
        linkID++
        // let linkAnno = Object.assign({}, anno)
        // linkAnno.type = "link"
        // state.annotations.push(linkAnno);
      }
        
    }

  }

  // this.enhanceVideo = function(state, node, element) {
  //   var href = element.getAttribute("xlink:href").split(".");
  //   var name = href[0];
  //   node.url = "http://api.elifesciences.org/v2/articles/"+state.doc.id+"/media/file/"+name+".mp4";
  //   node.url_ogv = "http://api.elifesciences.org/v2/articles/"+state.doc.id+"/media/file//"+name+".ogv";
  //   node.url_webm = "http://api.elifesciences.org/v2/articles/"+state.doc.id+"/media/file//"+name+".webm";
  //   node.poster = "http://api.elifesciences.org/v2/articles/"+state.doc.id+"/media/file/"+name+".jpg";
  // };
};

DaiConverter.Prototype.prototype = LensConverter.prototype;
DaiConverter.prototype = new DaiConverter.Prototype();
DaiConverter.prototype.constructor = DaiConverter;

module.exports = DaiConverter;
