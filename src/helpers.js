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


function isScrolledIntoView(elem){
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top - 80;
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

function registerTOCHighlightFix(latency){
  $(".heading-ref").click(function(event) {
    console.log('cliiiicked', event)
    setTimeout(() => {
      console.log('change')
      $(".heading-ref").removeClass('active');
      $(event.currentTarget).addClass('active')
    }, latency || 100);
    
  })
}

function registerContentScroll(){
  

  $(".surface.content").scroll(function() {
    updateCentralBar()
  })

  $(window).on('hashchange', function(e){
    let newUrl = e.originalEvent.newURL
    let urlSplit = newUrl.split('#')
    if (urlSplit.length > 0){
      let hash = urlSplit[1];
      let reference = false
      if (hash.indexOf('content/figure_reference') >= 0) {
        reference = hash.split('/')[1]
      }
      if (hash.indexOf('figures/figure') >= 0) {
        let figure = hash.split('/')[1];
        Object.keys(e.currentTarget.figurePreviews).forEach(figureKey => {
          if (e.currentTarget.figurePreviews[figureKey].figure === figure) reference = e.currentTarget.figurePreviews[figureKey].id
        })
      }
      $(`.central-bar-preview`).removeClass('selected')
      if (reference) {
        $(`#${reference}_preview`).addClass('selected')
      }
    }

   });
}

function registerCentralBarHighlight(){
  $(window).on('hashchange', function(e){
    let newUrl = e.originalEvent.newURL
    let urlSplit = newUrl.split('#')
    if (urlSplit.length > 0){
      let hash = urlSplit[1];
      let reference = false
      if (hash.indexOf('content/figure_reference') >= 0) {
        reference = hash.split('/')[1]
      }
      if (hash.indexOf('figures/figure') >= 0) {
        let figure = hash.split('/')[1];
        Object.keys(e.currentTarget.figurePreviews).forEach(figureKey => {
          if (e.currentTarget.figurePreviews[figureKey].figure === figure) reference = e.currentTarget.figurePreviews[figureKey].id
        })
      }
      $(`.central-bar-preview`).removeClass('selected')
      if (reference) {
        $(`#${reference}_preview`).addClass('selected')
      }
    }

   });
}



function updateCentralBar() {

  var figurePreviews = {}
    let lastHeight = 0;
    $('.content .figure_reference').each(function(){
      let data_id = this.attributes['data-id'];
      var $elem = $(this);

      if(isScrolledIntoView($elem)){
        let selected = $elem.context && $elem.context.className.indexOf('highlighted') > 0;
        let referencePosition = $elem.offset().top;
        if ( window && window.doc && data_id && data_id.nodeValue) {
          var referenceNode = window.doc.get(data_id.nodeValue);
          var target = referenceNode.target
          if (target) {
            var targetNode = window.doc.get(target);
            var height = referencePosition - 80;
            if ((lastHeight + 50) >= height) height = lastHeight + 60;
            var isDuplicate = false;
            Object.keys(figurePreviews).forEach(preview => {
              if(figurePreviews[preview].figure === target) isDuplicate = true;
            })
            if (!isDuplicate) {
              figurePreviews[data_id.nodeValue] = {
                figure: target,
                figureUrl: targetNode.url,
                id: data_id.nodeValue,
                topOffset: referencePosition,
                content: `<div class="central-bar-preview ${selected ? 'selected' : ''}" reference="${data_id.nodeValue}" id="${data_id.nodeValue}_preview" data-id="${target}_preview"><a href="#content/${data_id.nodeValue}" class="figure_preview_link"><img class="figure_preview_img" src="${targetNode.url}" /></a></div>`,
                css: {top: height, position: 'absolute'},
                selected: selected
              }
            }
            lastHeight = height;
          }
        }
      }
    });

    // remove old
    $('.central-bar-preview').each(function() {
      let reference = this.attributes['reference'].nodeValue;
      if (! figurePreviews[reference]) {
        $(this).remove()
      }
    })

    // add or update visible
    Object.keys(figurePreviews).forEach(previewKey => {
      var figure = figurePreviews[previewKey].id
      if ($( `#${figure}_preview` ).length > 0){
        if (figurePreviews[previewKey].selected)
          $( `#${figure}_preview` ).css(figurePreviews[previewKey].css).addClass('selected')
        else
          $( `#${figure}_preview` ).css(figurePreviews[previewKey].css).removeClass('selected')
      } else {
        $(".scrollbar-cover").append($(figurePreviews[previewKey].content).css(figurePreviews[previewKey].css))
      }
    })  
  window.figurePreviews = figurePreviews;
}

module.exports = {
  extractDocumentIdFromUrl: extractDocumentIdFromUrl,
  baseDocsURL: baseDocsURL,
  setCoverImage: setCoverImage,
  registerNavbarToggle: registerNavbarToggle,
  registerContentScroll: registerContentScroll,
  updateCentralBar: updateCentralBar,
  registerCentralBarHighlight: registerCentralBarHighlight,
  registerTOCHighlightFix: registerTOCHighlightFix
};