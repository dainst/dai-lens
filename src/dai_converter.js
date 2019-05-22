"use strict";

var LensConverter = require('lens/converter');
var Helpers = require('./helpers')
var LensArticle = require("./article");
var CustomNodeTypes = require("./nodes");

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

  // Resolve figure urls
  // --------
  // 

  this.enhanceFigure = function(state, node, element) {
    var graphic = element.querySelector("graphic");
    var url = graphic.getAttribute("xlink:href");
    node.url = this.resolveURL(state, url);
  };

  this.enhancePublicationInfo = function(state) {
    var volume = state.xmlDoc.querySelector("volume");
    var subtitle = state.xmlDoc.querySelector("subtitle");
    var poster = state.xmlDoc.querySelector("fig#poster-image");

    var publicationInfo = state.doc.get('publication_info');
    publicationInfo.volume = volume;
    publicationInfo.subtitle = subtitle;
    publicationInfo.poster = poster;
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
        "citation_urls": []
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
