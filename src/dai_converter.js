"use strict";

var LensConverter = require('lens/converter');

var LensArticle = require("lens/article");
var CustomNodeTypes = require("./nodes");

var DaiConverter = function(options) {
  LensConverter.call(this, options);
};

DaiConverter.Prototype = function() {

  this.test = function(xmlDoc) {
    var publisherName = xmlDoc.querySelector("publisher-name").textContent;
    var isDaiDocument = xmlDoc.URL.search('https://bkry.gitlab.io/dai/dai-examples/') >= 0;
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
    var article = state.xmlDoc.querySelector("article");
    var volume = state.xmlDoc.querySelector("volume");

    var publicationInfo = state.doc.get('publication_info');
    publicationInfo.volume = volume;
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
        let daiMatchIndex = fullUrl.search("dai-examples")
        if (daiMatchIndex >= 0) {
          let daiSubstring = fullUrl.substring(daiMatchIndex);
          documentId=daiSubstring.split('/')[1]
        }
      }

      let pictureUrl = [
        "https://bkry.gitlab.io/dai/dai-examples/",
        documentId + '/',
        url,
      ].join('');

      return pictureUrl;
    }
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
