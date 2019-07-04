var PanelView = require('lens/reader').PanelView;

var SupplementsView = function(panelCtrl, config) {
  PanelView.call(this, panelCtrl, config);

  this.$el.addClass('supplements-panel');

  // Hide toggle on contruction, it will be displayed once data has arrived
  this.hideToggle();
};

SupplementsView.Prototype = function() {

  this.render = function() {
    var self = this;
    this.el.innerHTML = '';

    this.controller.getSupplements(function(err, supplements) {
      if (!err) {
        self.renderSupplements(supplements);  
      } else {
        console.error("Could not retrieve supplements data:", err);
      }
    });
    
    return this;
  };

  this.renderSupplements = function(supplements) {
    // Finally data is available so we tell the panel to show up as a tab
    this.showToggle();

    var $supplements = $('<div class="supplements"></div>');
    $supplements.append($('<div class="label">Title</div>'));
    $supplements.append($('<div class="value"></div>').text(supplements.title));
    $supplements.append($('<div class="label">Subtitle</div>'));
    $supplements.append($('<div class="value"></div>').text(supplements.subtitle));
    $supplements.append($('<div class="value"></div>').text(JSON.stringify(supplements)));

    this.$el.append($supplements);
  };
};

SupplementsView.Prototype.prototype = PanelView.prototype;
SupplementsView.prototype = new SupplementsView.Prototype();
SupplementsView.prototype.constructor = SupplementsView;

module.exports = SupplementsView;