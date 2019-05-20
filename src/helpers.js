"use strict";

const extractDocumentIdFromUrl = function(url) {
  let daiMatchIndex = url.search("dai-examples")
  if (daiMatchIndex >= 0) {
    let daiSubstring = url.substring(daiMatchIndex);
    return daiSubstring.split('/')[1]
  }
  return '0000'
};

const baseDocsURL = "https://bkry.gitlab.io/dai/dai-examples/"

module.exports = {
  extractDocumentIdFromUrl: extractDocumentIdFromUrl,
  baseDocsURL: baseDocsURL
};