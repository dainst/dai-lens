var PanelView = require('lens/reader').PanelView;
var ViewFactory = require('lens/article/view_factory');


var NotesView = function(panelCtrl, config) {
  PanelView.call(this, panelCtrl, config);
  this.viewFactory = new ViewFactory(panelCtrl.document.nodeTypes, config)
  this.$el.addClass('notes-panel');

  // Hide toggle on contruction, it will be displayed once data has arrived
  this.hideToggle();
};

NotesView.Prototype = function() {
  this.render = function() {
    var self = this;
    this.el.innerHTML = '';

    this.controller.getNotes(function(err, notes) {
      if (!err) {
        self.renderNotes(notes);  
      } else {
        console.error("Could not retrieve notes data:", err);
      }
    });
    
    return this;
  };

  this.renderNotes = function(data) {
    // Finally data is available so we tell the panel to show up as a tab
    this.showToggle();

    var $notes = $('<div class="notes"></div>');
    $notes.append($('<div class="label">NOTES</div>'));
    data.notes.map(note => {
      this.footnoteView = this._createView(note).render();
      this.footnoteView.$el.addClass('footnote');
      // $notes.append(note);
      // $notes.append($('<div class="value"></div>').text(note.properties.id));
      // this.footnoteView = this._createView(note).render();
      // console.log(this.footnoteView)
      $notes.append(this.footnoteView.el);
    })
    // $notes.append($('<div class="value"></div>').text(notes.data));

    this.$el.append($notes);
  };

  this._createView = function(node) {
    var view = this.viewFactory.createView(node);
    return view;
  };

};


NotesView.Prototype.prototype = PanelView.prototype;
NotesView.prototype = new NotesView.Prototype();
NotesView.prototype.constructor = NotesView;

module.exports = NotesView;