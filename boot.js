window.Lens = require("./src/my-lens");
require('nodelist-foreach-polyfill');

// Little helper used to parse query strings from urls
// --------
//

var qs = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
} ();


function load_xml(document_url) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", document_url, false);
  xhttp.send();
  if (!xhttp.responseXML) {
    alert("XML could not be found!");
  }
  return xhttp.responseXML;
}

function load_journals_json() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", '/repository/config/journals.json', false);
  xhttp.send();
  if (xhttp.status !== 200) return [];
  return JSON.parse(xhttp.responseText) || [];
}
function get_journal_config(document_url) {
	
  var config = {
    "title": "Lens Viewer",
    "logo": "/repository/config/lens.png",
    "favicon": "/repository/config/lens.png",
    "homepage": "https://publications.dainst.org/journals/index.php",
    "colors": {
		"topbar": "#E2510C",
        "topbar_issue": "#DA7D37",
        "cover_headline": "#E2510C",
        "content_headline_1": "#E2510C",
		"content_headline_2": "#000000",
        "content_figure_reference": "#E2510C",
        "content_figure_reference_hover": "#fbd5c4",
        "content_figure_reference_focus": "#fbd5c4",
		"content_extrafeature_reference": "#568A50",
        "content_extrafeature_reference_hover": "#e4eee3",
        "content_extrafeature_reference_focus": "#e4eee3",
        "content_citation_reference": "#E2510C",
        "content_citation_reference_hover": "#E2510C",
        "content_citation_reference_focus": "#fbd5c4",
		"resources_contents_toc": "#E2510C",
		"resources_references": "#CDC7C0",
		"resources_references_hover": "#CDC7C0",
		"resources_focus_footnote_number": "#E2510C",
		"resources_focus_author_year": "#E2510C",
		"resources_focus_references": "#E2510C",
		"resources_focus_header_background": "#E2510C"
    },
    "issue_pattern": "volume",
    "print": true,
	"advisory_board": true
  };
  
  var journal_identifier = load_xml(document_url).querySelector("journal-id").textContent;
  var journal = load_journals_json().find(e => e.xml_identifier === journal_identifier);
  if (journal) {
    $.extend(true, config, journal.config);
  }
  return config;
}


// This document gets loaded by default
// --------

var documentURL = "data/example.xml";

$(function() {

  // Create a new Lens app instance
  // --------
  //
  // Injects itself into body


  var document_url = qs.url ? decodeURIComponent(qs.url) : documentURL;
  var app = new window.Lens({
    document_url: document_url,
    journal_config: get_journal_config(document_url)
  });
  app.start();

  window.app = app;

});