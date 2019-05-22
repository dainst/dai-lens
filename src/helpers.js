"use strict";

const extractDocumentIdFromUrl = function(url) {
  let daiMatchIndex = url.search("dai-examples")
  if (daiMatchIndex >= 0) {
    let daiSubstring = url.substring(daiMatchIndex);
    return daiSubstring.split('/')[1]
  }
  return '0000'
};

const baseDocsURL = "https://bkry.gitlab.io/dai/dai-examples/";

var figurePreviews = {}

function isScrolledIntoView(elem){
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  var elemBottom = elemTop + $elem.height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function setCoverImage() {
  var documentId = extractDocumentIdFromUrl(window.document.URL);
  var info = window.doc.get('publication_info');
  var url = info.poster.children[0].getAttribute('xlink:href')
  let coverImageUrl = [
    baseDocsURL,
    documentId + '/',
    url,
  ].join('');
  $("div[class='toc']").prepend( `<div><img class="cover-image" src="${coverImageUrl}"/></div>` );
}

function registerNavbarToggle(){
  $("img.topbar-logo-img").ready(function () {
    var navBar = function () {
      $("img.topbar-logo-img").click(function () {
        $(".resources").toggleClass("active");
      });
    }
    setTimeout(navBar, 2500);
  });
}

function registerContentScroll(){
  $(".surface.content").scroll(function() {
    updateCentralBar()
  })
}

function updateCentralBar() {

  let scrollBarReferences = [];
    let lastHeight = 0;
    $(".scrollbar-cover").empty();
    $('.content .figure_reference').each(function(){
      let data_id = this.attributes['data-id'];

      if(isScrolledIntoView($(this))){
        var $elem = $(this);
        let referencePosition = $(this).offset().top;
        if ( window && window.doc && data_id && data_id.nodeValue) {
          var referenceNode = window.doc.get(data_id.nodeValue);
          var target = referenceNode.target
          if (target) {
            var targetNode = window.doc.get(target);
            // console.log('url', targetNode.url)
            if( !scrollBarReferences.includes(data_id.nodeValue)){
              var height = referencePosition - 60;
              if ((lastHeight + 10) >= height) height = lastHeight + 50;
              // $(".scrollbar-cover").append($(`<div class="central-bar-preview" data-id="${target}_preview">${target}</div>`).css({top: height, position: 'absolute'}))
              scrollBarReferences.push(data_id.nodeValue);
              var isDuplicate = false;
              $(".scrollbar-cover").append($(`<div class="central-bar-preview" data-id="${target}_preview"><img width="100%" src="${targetNode.url}" /></div>`).css({top: height, position: 'absolute'}))

              Object.keys(figurePreviews).forEach(preview => {
                if(figurePreviews[preview].figure === target) isDuplicate = true;
              })
              if (!isDuplicate){
                figurePreviews[data_id.nodeValue] = {
                  figure: target,
                  figureUrl: targetNode.url,
                  id: data_id.nodeValue,
                  topOffset: referencePosition,
                  content: `<div class="central-bar-preview" data-id="${target}_preview"><img width="100%" src="${targetNode.url}" /></div>`,
                  css: {top: height, position: 'absolute'}
                }
              }
              lastHeight = height;
            }
          }
        }
      }
      else{
        delete figurePreviews[data_id.nodeValue]
      }
    });
  window.figurePreviews = figurePreviews;
}

module.exports = {
  extractDocumentIdFromUrl: extractDocumentIdFromUrl,
  baseDocsURL: baseDocsURL,
  setCoverImage: setCoverImage,
  registerNavbarToggle: registerNavbarToggle,
  registerContentScroll: registerContentScroll,
  updateCentralBar: updateCentralBar
};