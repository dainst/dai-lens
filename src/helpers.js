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

function registerContentScroll(){
  $(".surface.content").scroll(function() {
    updateCentralBar()
  })

  $(".annotation.figure_reference.resource-reference").click(function(event){
    let reference = event.target.attributes['data-id'];
    let wasSelected = event.target.className.indexOf('highlighted') > 0;
    console.log('clicked', event.target.attributes['data-id'])
    $(`.central-bar-preview`).removeClass('selected')
    if (!wasSelected)
      $(`#${reference.nodeValue}_preview`).addClass('selected')
  })

  $(".central-bar-preview").click(function(event){
    let reference = event.target.attributes['data-id'];
    console.log('clicked', event.target.attributes['data-id'])
    $(`.central-bar-preview`).removeClass('selected')
    $(`#${reference.nodeValue}_preview`).addClass('selected')
  })

  $(window).on('hashchange', function(e){
    console.log('changed url', e)

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
                content: `<div class="central-bar-preview ${selected ? 'selected' : ''}" reference="${data_id.nodeValue}" id="${data_id.nodeValue}_preview" data-id="${target}_preview"><a href="#content/${data_id.nodeValue}"><img class="figure_preview_img" src="${targetNode.url}" /></a></div>`,
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
      console.log(this)
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
      console.log(figurePreviews[previewKey].id, figurePreviews[previewKey].css.top)
    })  
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