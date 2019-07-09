var _ = require('underscore');
var Document = require('lens/substance/document');

// Lens.Extrafeature
// -----------------
//

var Extrafeature = function(node, doc) {
  Document.Node.call(this, node, doc);
};

// Type definition
// -----------------
//

Extrafeature.type = {
  "id": "article_citation", // type name
  "parent": "content",
  "properties": {
    "source_id": "string",
    "title": "string",
    "label": "string",
    "authors": ["array", "string"],
    "doi": "string",
    "source": "string",
    "volume": "string",
    "citation_type": "string",
    "publisher_name": "string",
    "publisher_location": "string",
    "fpage": "string",
    "lpage": "string",
    "year": "string",
    "comment": "string",
    "citation_urls": ["array", "object"],
    "source_formats": ["array", "object"]
  }
};

// This is used for the auto-generated docs
// -----------------
//

Extrafeature.description = {
  "name": "Extrafeature",
  "remarks": [
    "A journal citation.",
    "This element can be used to describe all kinds of citations."
  ],
  "properties": {
    "title": "The article's title",
    "label": "Optional label (could be a number for instance)",
    "doi": "DOI reference",
    "source": "Usually the journal name",
    "volume": "Issue number",
    "citation_type": "Extrafeature Type",
    "publisher_name": "Publisher Name",
    "publisher_location": "Publisher Location",
    "fpage": "First page",
    "lpage": "Last page",
    "year": "The year of publication",
    "comment": "Author comment.",
    "citation_urls": "A list of links for accessing the article on the web"
  }
};



// Example Extrafeature
// -----------------
//

Extrafeature.example = {
  "id": "article_nature08160",
  "type": "article_citation",
  "label": "5",
  "title": "The genome of the blood fluke Schistosoma mansoni",
  "authors": [
    "M Berriman",
    "BJ Haas",
    "PT LoVerde"
  ],
  "citation_type": "Journal Article",
  "doi": "http://dx.doi.org/10.1038/nature08160",
  "source": "Nature",
  "volume": "460",
  "fpage": "352",
  "lpage": "8",
  "year": "1984",
  "comment": "This is a comment.",
  "citation_urls": [
    {
      "name": "PubMed",
      "url": "https://www.ncbi.nlm.nih.gov/pubmed/19606141"
    }
  ]
};


Extrafeature.Prototype = function() {

  // Returns the citation URLs if available
  // Falls back to the DOI url
  // Always returns an array;
  this.urls = function() {
    var urls = this.properties.citation_urls.length > 0 ? this.properties.citation_urls
                                                    : [this.properties.doi];
    if (this.properties.custom_urls && this.properties.custom_urls.length > 0){
      urls = urls.concat(this.properties.custom_urls)
    }
    return urls;
  };

  this.getHeader = function() {
    return _.compact([this.properties.label]).join('');
  };

  this.getExtrafeature = function(cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: "https://arachne.dainst.org/data/entity/1124982",
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };
};

Extrafeature.Prototype.prototype = Document.Node.prototype;
Extrafeature.prototype = new Extrafeature.Prototype();
Extrafeature.prototype.constructor = Extrafeature;

Document.Node.defineProperties(Extrafeature);

module.exports = Extrafeature;
