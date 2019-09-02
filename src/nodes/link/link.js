var _ = require('underscore');
var Document = require('lens/substance/document');

// Lens.Link
// -----------------
//

var Link = function(node, doc) {
  Document.Node.call(this, node, doc);
};

// Type definition
// -----------------
//

Link.type = {
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

Link.description = {
  "name": "Link",
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
    "citation_type": "Link Type",
    "publisher_name": "Publisher Name",
    "publisher_location": "Publisher Location",
    "fpage": "First page",
    "lpage": "Last page",
    "year": "The year of publication",
    "comment": "Author comment.",
    "citation_urls": "A list of links for accessing the article on the web"
  }
};



// Example Link
// -----------------
//

Link.example = {
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


Link.Prototype = function() {

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

  this.getSupplements = function(cb) {
    // var doi = this.document.get('publication_info').doi;

		$.ajax({
		  url: "https://arachne.dainst.org/data/entity/1124982",
		  dataType: "json",
		}).done(function(res) {
			cb(null, res);
		});
  };
};

Link.Prototype.prototype = Document.Node.prototype;
Link.prototype = new Link.Prototype();
Link.prototype.constructor = Link;

Document.Node.defineProperties(Link);

module.exports = Link;
