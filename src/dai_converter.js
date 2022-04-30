"use strict";
var _ = require("underscore");
var LensConverter = require('lens/converter');
var Helpers = require('./helpers');
var LensArticle = require("./article");
var CustomNodeTypes = require("./nodes");
var util = require("lens/substance/util");
var DaiConverter = function(options) {
  LensConverter.call(this, options);
};

/** Important notice:
 * Watch out lens_converter.js in node_modules (library root), which
 * might not be visible in the src-code. Try deploying it locally by npm
 * (install and start). It´s also usefull for faster development
 * (instead of docker-compose build)
 ***/

DaiConverter.Prototype = function() {

  this.logging = function(log) {
      console.groupCollapsed("Notice:");
      console.info(log);
      console.groupEnd();
  };

  this.createDocument = function() {
    var doc = new LensArticle({
      nodeTypes: CustomNodeTypes
    });
    return doc;
  };

  /* define article
  -----------------------*/
  this.article = function(state, article) {

    this.extractArticleId(state, article);

    this.extractBody(state, article);

    this.extractDefinitions(state, article);

    this.extractAffilitations(state, article);

    this.extractContributors(state, article);

    this.extractCitations(state, article);

    this.extractCover(state, article);

    this.extractLinks(state, article);

    this.extractPublicationInfo(state, article);

    this.extractArticleMeta(state, article);

    this.extractFootNotes(state, article);

    this.extractFigures(state, article);

    this.enhanceArticle(state, article);

    this.extractBack(state, article);
  };

  /* -----------------------------------*/
  this.acceptedParagraphElements = {
    "boxed-text": {handler: "boxedText"},
    "disp-quote": {handler: "quoteText"},
    "list": {handler: "list"},
    "table-wrap": {handler: "tableWrap"}
  };

  this._ignoredBodyNodes = {
    "fig": true,
    "table": true,
    "speaker": true
  };

  this.appGroup = function(state, appGroup) {
    var title = appGroup.querySelector('title');
    if (!title) {
      this.logging("Notice: Every app should have a title:" + "\n" + this.toHtml("No app-title"));
    }
  };

  this._bodyNodes["table-wrap"] = function (state, child) {
    return this.tableWrap(state, child);
  };

  this.section = function(state, section) {
    // pushing the section level to track the level for nested sections
    state.sectionLevel++;

    var doc = state.doc;
    var children = util.dom.getChildren(section);
    var nodes = [];

    // Optional heading label
    var label = this.selectDirectChildren(section, "label")[0];

    // create a heading
    var title = this.selectDirectChildren(section, 'title')[0];
    if (!title) {
      this.logging("Notice: There is a section without a title:" + "\n" + this.toHtml(section));
    }

    // Recursive Descent: get all section body nodes
    nodes = nodes.concat(this.bodyNodes(state, children, {
      ignore: ["title", "label"]
    }));

    if (nodes.length > 0 && title) {
      var id = state.nextId("heading");
      var heading = {
        id: id,
        source_id: section.getAttribute("id"),
        type: "heading",
        level: state.sectionLevel,
        content: title ? this.annotatedText(state, title, [id, 'content']) : ""
      };

      if (label) {
        heading.label = label.textContent;
      }

      if (heading.content.length > 0) {
        doc.create(heading);
        nodes.unshift(heading);
      }
    }
    else if (nodes.length === 0) {
      this.logging("Notice: Section without content skipped:" + "\n" + this.toHtml(section));
    }

    // popping the section level
    state.sectionLevel--;
    return nodes;
  };

  this.extractBody = function(state, article) {
    var body = article.querySelector("body");
    if (body) {
      var nodes = this.bodyNodes(state, util.dom.getChildren(body));
      if (nodes.length > 0) {
        this.show(state, nodes);
      }
    }
    else {
      this.logging("No body-element found");
    }
  };

  this.paragraph = function(state, children) {
    var doc = state.doc;

    // Reset whitespace handling at the beginning of a paragraph.
    // I.e., whitespaces at the beginning will be removed rigorously.
    state.skipWS = true;

    var node = {
      id: state.nextId("paragraph"),
      type: "paragraph",
      children: null
    };
    var nodes = [];

    var iterator = new util.dom.ChildNodeIterator(children);
    while (iterator.hasNext()) {
      var child = iterator.next();
      var type = util.dom.getNodeType(child);

      // annotated text node
      if (type === "text" || this.isAnnotation(type)) {
        var textNode = {
          id: state.nextId("text"),
          type: "text",
          content: null
        };
        // pushing information to the stack so that annotations can be created appropriately
        state.stack.push({
          path: [textNode.id, "content"]
        });
        // Note: this will consume as many textish elements (text and annotations)
        // but will return when hitting the first un-textish element.
        // In that case, the iterator will still have more elements
        // and the loop is continued
        // Before descending, we reset the iterator to provide the current element again.
        var annotatedText = this._annotatedText(state, iterator.back(), { offset: 0, breakOnUnknown: true });

        // Ignore empty paragraphs
        if (annotatedText.length > 0) {
          textNode.content = annotatedText;
          doc.create(textNode);
          nodes.push(textNode);
        }

        // popping the stack
        state.stack.pop();
      }

      // inline image node
      else if (type === "inline-graphic") {
        var url = child.getAttribute("xlink:href");
        var img = {
          id: state.nextId("image"),
          type: "image",
          url: this.resolveURL(state, url)
        };
        doc.create(img);
        nodes.push(img);
      }
      else if (type === "inline-formula") {
        var formula = this.formula(state, child, "inline");
        if (formula) {
          nodes.push(formula);
        }
        else if (type === "table-wrap") {
          this.tableWrap(state, child);

        }
      }

    }

    // return if there is no content
    if (nodes.length === 0) return null;

    // FIXME: ATM we can not unwrap single nodes, as there is code relying
    // on getting a paragraph with children
    // // if there is only a single node, do not create a paragraph around it
    // if (nodes.length === 1) {
    //   return nodes[0];
    // } else {
    //   node.children = _.map(nodes, function(n) { return n.id; } );
    //   doc.create(node);
    //   return node;
    // }

    node.children = _.map(nodes, function(n) { return n.id; } );
    doc.create(node);
    return node;
  };

  this.extractArticleId = function(state, article) {
    var doc = state.doc;
    var articleId = article.querySelector("article-id");
    // assign articleId to doc:
    if (articleId) {
      doc.id = articleId.textContent;
    } else {
      doc.id = util.uuid(); // create a random id if id not set
    }
  };

  this.extractDefinitions = function(state /*, article*/) {
    var defItems = state.xmlDoc.querySelectorAll("def-item");

    _.each(defItems, function(defItem) {
      var term = defItem.querySelector("term");
      var def = defItem.querySelector("def");

      // using hwp:id as a fallback MCP articles don't have def.id set
      var id = def.id || def.getAttribute("hwp:id") || state.nextId('definition');

      var definitionNode = {
        id: id,
        type: "definition",
        title: term.textContent,
        description: def.textContent
      };

      state.doc.create(definitionNode);
      state.doc.show("definitions", definitionNode.id);
    });
  };

  this.extractCitations = function(state, xmlDoc) {
    var refList = xmlDoc.querySelector("ref-list");
    if (refList) {
      this.refList(state, refList);
    }
  };

  this.extractContributors = function(state, article) {
    // TODO: the spec says, that there may be any combination of
    // 'contrib-group', 'aff', 'aff-alternatives', and 'x'
    // However, in the articles seen so far, these were sub-elements of 'contrib-group', which itself was single
    var contribGroup = article.querySelector("article-meta contrib-group");
    if (contribGroup) {
      this.contribGroup(state, contribGroup);
    }
  };

  this.extractFigures = function(state, article) {
    var figureElements = article.querySelectorAll(
        "fig, supplementary-material, media[mimetype=video]");
    var nodes = [];
    for (var i = 0; i < figureElements.length; i++) {
      var figEl = figureElements[i];
      // skip converted elements
      if (figEl._converted) continue;
      var type = util.dom.getNodeType(figEl);
      var node = null;
      if (type === "fig") {
        node = this.figure(state, figEl);
      } else if (type === "media") {
        node = this.video(state, figEl);
      } else if (type === "supplementary-material") {
        node = this.supplement(state, figEl);
      }

      if (node) {
        if (node.source_id !== 'poster-image')     // exclude cover-image
          nodes.push(node);
      }
    }
    this.show(state, nodes);
  };

  this.enhanceFigure = function(state, node, element) {

    var graphic = element.querySelector("graphic");
    var url = graphic.getAttribute("xlink:href");
    node.url = this.resolveURL(state, url);

    var attrib = element.querySelector("attrib");
    if (attrib) {
      var linkElem = attrib.querySelector('ext-link');
      if (linkElem){
        url = linkElem.getAttribute('xlink:href');
        var linkText = linkElem.textContent;
        node.attribLink = {url: url, linkText: linkText};
      }
    }
  };

  this.extractPublicationInfo = function(state, article) {
    var doc = state.doc;

    var articleMeta = article.querySelector("article-meta");
    var pubDate = articleMeta.querySelector("pub-date");
    var history = articleMeta.querySelectorAll("history date");

    // Journal title
    var journalTitle = article.querySelector("journal-title");

    // DOI
    // <article-id pub-id-type="doi">10.7554/eLife.00003</article-id>
    var articleDOI = article.querySelector("article-id[pub-id-type=doi]");

    // Related article if exists
    //
    // TODO: can't there be more than one?
    var relatedArticle = article.querySelector("related-article");

    // Article information
    var articleInfo = this.extractArticleInfo(state, article);

    // Funding information
    var fundingInfo = this.extractFundingInfo(state, article);

    // Create PublicationInfo node
    // ---------------
    var pubInfoNode = {
      "id": "publication_info",
      "type": "publication_info",
      "published_on": this.extractDate(pubDate),
      "journal": journalTitle ? journalTitle.textContent : "",
      "related_article": relatedArticle ? relatedArticle.getAttribute("xlink:href") : "",
      "doi": articleDOI ? articleDOI.textContent : "",
      "article_info": articleInfo.id,
      "funding_info": fundingInfo,
      // TODO: 'article_type' should not be optional; we need to find a good default implementation
      "article_type": "",
      // Optional fields not covered by the default implementation
      // Implement config.enhancePublication() to complement the data
      // TODO: think about how we could provide good default implementations
      "keywords": [],
      "links": [],
      "subjects": [],
      "supplements": [],
      "history": [],
      // TODO: it seems messy to have this in the model
      // Instead it would be cleaner to add 'custom': 'object' field
      "research_organisms": [],
      // TODO: this is in the schema, but seems to be unused
      "provider": "",
    };

    for (var i = 0; i < history.length; i++) {
      var dateEl = history[i];
      var historyEntry = {
        type: dateEl.getAttribute('date-type'),
        date: this.extractDate(dateEl)
      };
      pubInfoNode.history.push(historyEntry);
    }

    doc.create(pubInfoNode);
    doc.show("info", pubInfoNode.id, 0);

    this.enhancePublicationInfo(state, pubInfoNode);
  };

  this.enhancePublicationInfo = function(state, pubInfo) {
    var volume = state.xmlDoc.querySelector("volume");
    var articleTitle = state.xmlDoc.querySelector("article-title");
    var subtitle = state.xmlDoc.querySelector("subtitle");
    var titleDepartement = state.xmlDoc.querySelector("title-departement");
    var titleTopicLocation = state.xmlDoc.querySelector("title-topic-location");
    var customMeta = {};
    var customMetaEls = state.xmlDoc.querySelectorAll('article-meta custom-meta');
    for (var i = 0; i < customMetaEls.length; i++) {
      var customMetaEl = customMetaEls[i];
      var metaNameEl = customMetaEl.querySelector('meta-name');
      var metaValueEl = customMetaEl.querySelector('meta-value');
      if (metaNameEl && metaValueEl){
        customMeta[metaNameEl.textContent] = metaValueEl.textContent;
      }
    }
    var podOrderLink = state.xmlDoc.querySelector('ext-link[ext-link-type="pod-order"]');
    if (podOrderLink) {
      customMeta['pod_order_link'] = podOrderLink.getAttribute('xlink:href');
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
        var contribs = contribGroup.querySelectorAll('contrib');
        _.each(contribs, (contrib) => {
          var customArticleContribution = {};
          var type = contrib.getAttribute('contrib-type');
          if (type) customArticleContribution['type'] = type;
          var contribIdEl = contrib.querySelector('contrib-id');
          var nameEl = contrib.querySelector('name');
          var addressEl = contrib.querySelector('address');
          var affEl = contrib.querySelector('aff');

          if (contribIdEl) {
            customArticleContribution['contribId'] = contribIdEl.textContent;
          }
          if (nameEl){
            let surnameEl  = nameEl.querySelector('surname');
            let givenNamesEl  = nameEl.querySelector('given-names');
            let prefixEl  = nameEl.querySelector('prefix');
            customArticleContribution['name'] = {
              surname: surnameEl ? surnameEl.textContent : '',
              givenNames: givenNamesEl ? givenNamesEl.textContent : '',
              prefix: prefixEl ? prefixEl.textContent : '',
            };
          }
          if (addressEl){
            let labelEl  = addressEl.querySelector('label');
            let addrLineEl  = addressEl.querySelector('addr-line');
            let cityEl  = addressEl.querySelector('city');
            let countryEl  = addressEl.querySelector('country');
            let emailEl  = addressEl.querySelector('email');
            let phoneEl  = addressEl.querySelector('phone');
            customArticleContribution['address'] = {
              label: labelEl ? labelEl.textContent : '',
              addrLine: addrLineEl ? addrLineEl.textContent : '',
              city: cityEl ? cityEl.textContent : '',
              country: countryEl ? countryEl.textContent : '',
              email: emailEl ? emailEl.textContent : '',
              phone: phoneEl ? phoneEl.textContent : '',
            };
          }
          if (affEl){
            let institutionIdEl  = affEl.querySelector('institution-id');
            let institutionEl  = affEl.querySelector('institution');
            let addrLineEl  = affEl.querySelector('addr-line');
            let cityEl  = affEl.querySelector('city');
            let emailEl  = affEl.querySelector('email');
            let countryEl  = affEl.querySelector('country');
            let phoneEl  = affEl.querySelector('phone');
            customArticleContribution['aff'] = {
              institutionId: institutionIdEl ? institutionIdEl.textContent : '',
              institution: institutionEl ? institutionEl.textContent : '',
              addrLine: addrLineEl ? addrLineEl.textContent : '',
              city: cityEl ? cityEl.textContent : '',
              country: countryEl ? countryEl.textContent : '',
              phone: phoneEl ? phoneEl.textContent : '',
              email: emailEl ? emailEl.textContent : '',
            };
          }
          customArticleContributions.push(customArticleContribution);
        }, this);
        this.contribGroup(state, contribGroup);
      }, this);

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
    var abstractKeywords = []
    keywordElements.forEach(keywordElem => {
      let lang = keywordElem.getAttribute('xml:lang');
      let titleElem = keywordElem.querySelector('title');
      let keyElems = keywordElem.querySelectorAll("kwd");
      let keys = [];
      keyElems.forEach(key => {
        keys.push(key.textContent)
      })
      abstractKeywords.push({
        lang: keywordElem.getAttribute('xml:lang'),
        title: titleElem.textContent,
        keys: keys
      })
      if (lang == 'en-GB'){
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
    journalCoEditors.joinedList = journalCoEditors.list.join(', ')


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
    publicationInfo.subtitle = subtitle ? subtitle.textContent : '';
    publicationInfo.articleTitle = articleTitle ? articleTitle.textContent : '';
    publicationInfo.titleDepartement = titleDepartement ? titleDepartement.textContent : '';
    publicationInfo.titleTopicLocation = titleTopicLocation ? titleTopicLocation.textContent : '';
    publicationInfo.customMeta = customMeta;
    publicationInfo.customPubDate = pubDate
    publicationInfo.customArticleContributions = customArticleContributions
    publicationInfo.customPermissions = permissions
    publicationInfo.poster = poster;
    publicationInfo.journalId = journalId ? journalId.textContent : '';
    publicationInfo.articleId = articleId;
    publicationInfo.publisherName = publisherName ? publisherName.textContent : '';
    publicationInfo.publisherLoc = publisherLoc;
    publicationInfo.issns = issns;
    publicationInfo.isbns = isbns;
    publicationInfo.selfUris = selfUris;
    publicationInfo.selfUrisObj = selfUrisObj;
    publicationInfo.issue = issue ? issue.textContent : '';
    publicationInfo.customKeywords = keywords;
    publicationInfo.abstractKeywords = abstractKeywords;
    publicationInfo.journalCustomMeta = journalCustomMeta;
    publicationInfo.journalEditors = journalEditors;
    publicationInfo.journalCoEditors = journalCoEditors;
    publicationInfo.journalAdvisoryBoard = journalAdvisoryBoard;
    pubInfo.enhancedInfo = publicationInfo;

  }

  this.extractLinks = function(state, article) {

    var linkEls = article.querySelectorAll('ext-link[ext-link-type="uri"]');
    for (var i = 0; i < linkEls.length; i++) {
      var specUse = linkEls[i].getAttribute('specific-use')
      if (specUse === "supplements") {
        var linkEl = linkEls[i];
        if (linkEl.__converted__) continue;
        var link = this.link(state, linkEl, "supplement");
        state.doc.show("supplements", link.id);
      }
      if (specUse === "extrafeatures") {
        var linkEl = linkEls[i];
        if (linkEl.__converted__) continue;
        var link = this.link(state, linkEl, "extrafeature");
        state.doc.show("extrafeatures", link.id);
      }

    }
  };

  this.link = function(state, linkElement, type) {
    var doc = state.doc;
    var nextId = state.nextId(type)
    var link = {
      type: type,
      id: nextId,
      source_id: nextId,
      label: linkElement.textContent,
      children: [],
      url: '',
      title: ''
    };
    link.title = linkElement.textContent;
    link.url = linkElement.getAttribute('xlink:href')
    link.urltype = 'external';
    if (link.url.includes('arachne')) {
      link.urltype = 'arachne'
    }
    if (link.url.includes('gazetteer')) {
      link.urltype = 'gazetteer'
    }
    if (link.url.includes('field')) {
      link.urltype = 'field'
    }
    link.slug = link.url.substring(link.url.lastIndexOf("/") + 1);
    doc.create(link);
    // leave a trace for the catch-all converter
    // to know that this has been converted already
    linkElement.__converted__ = true;
    return link;
  };

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
        let fullUrl = window.location.href;
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

  this.extractCover = function(state, article) {
    var doc = state.doc;
    var docNode = doc.get("document");
    var cover = {
      id: "cover",
      type: "cover",
      title: docNode.title,
      authors: [], // docNode.authors,
      abstract: docNode.abstract
    };

    // Create authors paragraph that has contributor_reference annotations
    // to activate the author cards

    _.each(docNode.authors, function (contributorId) {
      var contributor = doc.get(contributorId);

      var authorsPara = {
        "id": "text_" + contributorId + "_reference",
        "type": "text",
        "content": contributor.name
      };

      doc.create(authorsPara);
      cover.authors.push(authorsPara.id);

      var anno = {
        id: state.nextId("contributor_reference"),
        type: "contributor_reference",
        path: ["text_" + contributorId + "_reference", "content"],
        range: [0, contributor.name.length],
        target: contributorId
      };

      doc.create(anno);
    }, this);

    this.enhanceCover(state, cover, article);

    doc.create(cover);
    doc.show("content", cover.id, 0);
  };

  this.extractArticleMeta = function(state, article) {
    var articleMeta = article.querySelector("article-meta");
    if (!articleMeta) {
      throw new ImporterError("Expected element: 'article-meta'");
    }

    // <article-id> Article Identifier, zero or more
    var articleIds = articleMeta.querySelectorAll("article-id");
    this.articleIds(state, articleIds);

    // <title-group> Title Group, zero or one
    var titleGroup = articleMeta.querySelector("title-group");
    if (titleGroup) {
      this.titleGroup(state, titleGroup);
    }

    // <pub-date> Publication Date, zero or more
    var pubDates = articleMeta.querySelectorAll("pub-date");
    this.pubDates(state, pubDates);

    this.abstracts(state, articleMeta);

    // Not supported yet:
    // <trans-abstract> Translated Abstract, zero or more
    // <kwd-group> Keyword Group, zero or more
    // <conference> Conference Information, zero or more
    // <counts> Counts, zero or one
    // <custom-meta-group> Custom Metadata Group, zero or one
  };

  this.extractFootNotes = function(state, article) {
    var fnEls = article.querySelectorAll('fn');
    for (var i = 0; i < fnEls.length; i++) {
      var fnEl = fnEls[i];
      if (fnEl.__converted__) continue;
      var footnote = this.footnote(state, fnEl);

      state.doc.show("footnotes", footnote.id);
    }
  };

  this.footnote = function(state, footnoteElement) {
    var doc = state.doc;
    var footnote = {
      type: 'footnote',
      id: state.nextId('fn'),
      source_id: footnoteElement.getAttribute("id"),
      label: '',
      children: []
    };
    var children = footnoteElement.children;
    var i = 0;
    if (children && children[i] && children[i].tagName.toLowerCase() === 'label') {
      footnote.label = this.annotatedText(state, children[i], [footnote.id, 'label']);
      i++;
    }
    footnote.children = [];
    if(children){
      for (; i<children.length; i++) {
        var nodes = this.paragraphGroup(state, children[i]);
        Array.prototype.push.apply(footnote.children, _.pluck(nodes, 'id'));
      }
    }

    doc.create(footnote);
    // leave a trace for the catch-all converter
    // to know that this has been converted already
    footnoteElement.__converted__ = true;
    return footnote;
  };

  this.citation = function(state, ref, citation) {
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
    }

    doc.create(citationNode);
    doc.show("citations", id);

    return citationNode;
  };

  this.abstracts = function(state, articleMeta) {
    var doc = state.doc;
    var nodes = [];
    var abstracts = articleMeta.querySelectorAll("abstract");
    var trans_abstracts = articleMeta.querySelectorAll("trans-abstract");

    if (abstracts.length !== 0 || trans_abstracts.length !== 0) {
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
      classes: ['abstract-elem', 'abstract_title_hr']
    };
    doc.create(underline_heading);
    nodes.push(underline_heading);

    var title = abs.querySelector("title");
    var heading = {
      id: state.nextId("text"),
      type: "text",
      content: title ? title.textContent : "Abstract",
      classes: ['abstract-elem', 'abstract-heading']
    };
    doc.create(heading);
    nodes.push(heading);

    var absTitle = abs.querySelector('styled-content[style-type="abstract-title"]')
    var absTitleText = {
      id: state.nextId("text"),
      type: "text",
      content: absTitle ? absTitle.textContent : '',
      classes: ['abstract-elem', 'abstract-title']
    };
    doc.create(absTitleText);
    nodes.push(absTitleText);

    var absSubtitle = abs.querySelector('styled-content[style-type="abstract-subtitle"]')
    var absSubtitleText = {
      id: state.nextId("text"),
      type: "text",
      content: absSubtitle ? absSubtitle.textContent : '',
      classes: ['abstract-elem', 'abstract-subtitle']
    };
    doc.create(absSubtitleText);
    nodes.push(absSubtitleText);

    var absAuthor = abs.querySelector('styled-content[style-type="abstract-author"]')
    var absAuthorText = {
      id: state.nextId("text"),
      type: "text",
      content: absAuthor ? absAuthor.textContent : '',
      classes: ['abstract-elem', 'abstract-author']
    };
    doc.create(absAuthorText);
    nodes.push(absAuthorText);

    var absText = abs.querySelector('styled-content[style-type="abstract-text"]')

    var textNodes = this.paragraphGroup(state, absText);

    nodes = nodes.concat(textNodes);

    var lang = abs.getAttribute('xml:lang');

    var absKeywords = null;
    if ( lang && doc && doc.nodes && doc.nodes.publication_info && doc.nodes.publication_info.abstractKeywords) {

      doc.nodes.publication_info.abstractKeywords.forEach(kwdGroup => {
        if (kwdGroup.lang === lang) {
          absKeywords = kwdGroup.keys;
          if (absKeywords.length) {
            var heading = {
              id: state.nextId("text"),
              type: "text",
              content: kwdGroup.title,
              classes: ['abstract-elem', 'abstract-kwd-heading']
            };
            doc.create(heading);
            nodes.push(heading);
            var absKeywordsEl = {
              id: state.nextId("text"),
              type: "text",
              content: absKeywords.join(', '),
              classes: ['abstract-elem', 'abstract-kwd']
            };
            doc.create(absKeywordsEl);
            nodes.push(absKeywordsEl);
          }

        }
      })
    }

    // with eLife there are abstracts having an object-id.
    // TODO: we should store that in the model instead of dropping it
    var newNodes = this.bodyNodes(state, util.dom.getChildren(abs), {
      ignore: ["title", "object-id"]
    });
    // nodes = nodes.concat(newNodes);

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

  var supplementID = 1;
  var extraFeatureID = 1;

  this.enhanceAnnotationData = function(state, anno, el, type){
    var styleType = el.getAttribute('style-type');
    if (styleType) {
      anno.name = styleType
    }
    var specificUse = el.getAttribute('specific-use');
    if (specificUse) {
      anno.specificUse = specificUse;
      if (specificUse === "supplements") {
        anno.type = "supplement_reference";
        anno.target = "supplement_" + supplementID
        supplementID++
      }
      else if (specificUse === "extrafeatures") {
        anno.type = "extrafeature_reference";
        anno.target = "extrafeature_" + extraFeatureID
        extraFeatureID++
      }
      else {
        anno.type = "weblink_reference"
        anno.urltext = el.textContent;
      }
    }
  }

  this.enhanceCover = function(state, cover, article){
    cover.authors.forEach((authorRef, idx) => {
      if (idx < (cover.authors.length -1)) {
        doc.get(authorRef).content = `${doc.get(authorRef).content},`
      }
    })
  };

  this.tableWrap = function(state, tableWrap) {

    // https://jats.nlm.nih.gov/archiving/tag-library/1.1d1/n-44a2.html
    var position = tableWrap.getAttribute("position");
    var label = tableWrap.querySelector("label");
    var table = tableWrap.querySelector("table")

    if(table) {
      var content = "";
      var type = "";
      // render table in body node:
      if(position === "anchor") {
        content = this.renderTable(state, table);
        type = "table";
      }
      // render table as figure
      else if (position === "float") {
        content = this.toHtml(table);
        type = "html_table";
      }
    }
    else {
      this.logging('Notice: table-element not found in', tableWrap);
    }

    // define table node:
    var tableNode = {
      "id": state.nextId("table"),
      "source_id": tableWrap.getAttribute("id"),
      "type": type,
      "label": label ? label.textContent : "",
      "children": content,
      "content": content,
      "table_attributes": table.attributes,
    };

    this.extractTableCaption(state, tableNode, tableWrap);
    state.doc.create(tableNode);
    return tableNode;
  };

  this.renderTable = function(state, table) {

    // based on: https://github.com/withanage/UBHD-Lens/blob/master/src/nodes/table/table_view.js
    var content = {};
    var trs = {};
    var tds = {};
    var _trs = table.children;
    for (var i = 0; i < _trs.length; i++) {
      var _tds = _trs[i].children;
      for (var j = 0; j < _tds.length; j++) {
        var childNodes = _tds[j].childNodes;
        for (var k = 0; k < childNodes.length; k++) {
          var child = childNodes[k];
          tds[k] = {}
          if (child.nodeName === '#text') {
            var textContent = child.data.trim();
            if (textContent.length > 0) {
              var p = document.createElement('p');
              var t = document.createTextNode(textContent);
              p.appendChild(t);
              tds[k].nodes = this.paragraphGroup(state, p);
            }
          }
          else if (child.nodeName === 'p') {
            tds[k].nodes = this.paragraphGroup(state, child);
          }

          tds[k].attributes = _tds[j].attributes;
        }
        trs[j] = tds;
        tds = {};
      }
      content[i] = trs;
      trs = {};
    }
    return(content);
  }

  this.extractTableCaption = function(state, tableNode, tableWrap) {
    var caption = tableWrap.querySelector("caption");
    if (caption) {
      var captionNode = this.caption(state, caption);
      if (captionNode) {
        tableNode.caption = captionNode.id;
      }
    }
  };

  this.extractBack = function(state, article) {
    var back = article.querySelector("back");
    if (back){
      this.back(state,back);
    }
    else alert("Warning: XML has no back-element!");
  };

  this.toHtml = function(el) {
    if (!el) return "";
    var tmp = document.createElement("DIV");
    tmp.appendChild(el.cloneNode(true));
    return tmp.innerHTML;
  };

};

// -----------------------------------------------------------

DaiConverter.Prototype.prototype = LensConverter.prototype;
DaiConverter.prototype = new DaiConverter.Prototype();
DaiConverter.prototype.constructor = DaiConverter;

module.exports = DaiConverter;
