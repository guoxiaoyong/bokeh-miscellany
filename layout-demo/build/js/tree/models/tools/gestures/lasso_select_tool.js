var DEFAULT_POLY_OVERLAY, LassoSelectTool, LassoSelectToolView, PolyAnnotation, SelectTool, _, p,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

PolyAnnotation = require("../../annotations/poly_annotation");

p = require("../../../core/properties");

LassoSelectToolView = (function(superClass) {
  extend(LassoSelectToolView, superClass);

  function LassoSelectToolView() {
    return LassoSelectToolView.__super__.constructor.apply(this, arguments);
  }

  LassoSelectToolView.prototype.initialize = function(options) {
    LassoSelectToolView.__super__.initialize.call(this, options);
    this.listenTo(this.model, 'change:active', this._active_change);
    return this.data = null;
  };

  LassoSelectToolView.prototype._active_change = function() {
    if (!this.mget('active')) {
      return this._clear_overlay();
    }
  };

  LassoSelectToolView.prototype._keyup = function(e) {
    if (e.keyCode === 13) {
      return this._clear_overlay();
    }
  };

  LassoSelectToolView.prototype._pan_start = function(e) {
    var canvas, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    this.data = {
      vx: [vx],
      vy: [vy]
    };
    return null;
  };

  LassoSelectToolView.prototype._pan = function(e) {
    var append, canvas, overlay, ref, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    this.data.vx.push(vx);
    this.data.vy.push(vy);
    overlay = this.mget('overlay');
    overlay.update({
      xs: this.data.vx,
      ys: this.data.vy
    });
    if (this.mget('select_every_mousemove')) {
      append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
      return this._select(this.data.vx, this.data.vy, false, append);
    }
  };

  LassoSelectToolView.prototype._pan_end = function(e) {
    var append, ref;
    this._clear_overlay();
    append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
    this._select(this.data.vx, this.data.vy, true, append);
    return this.plot_view.push_state('lasso_select', {
      selection: this.plot_view.get_selection()
    });
  };

  LassoSelectToolView.prototype._clear_overlay = function() {
    return this.mget('overlay').update({
      xs: [],
      ys: []
    });
  };

  LassoSelectToolView.prototype._select = function(vx, vy, final, append) {
    var ds, geometry, i, len, r, ref, sm;
    geometry = {
      type: 'poly',
      vx: vx,
      vy: vy
    };
    ref = this.mget('renderers');
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      ds = r.get('data_source');
      sm = ds.get('selection_manager');
      sm.select(this, this.plot_view.renderers[r.id], geometry, final, append);
    }
    this._save_geometry(geometry, final, append);
    return null;
  };

  return LassoSelectToolView;

})(SelectTool.View);

DEFAULT_POLY_OVERLAY = new PolyAnnotation.Model({
  level: "overlay",
  xs_units: "screen",
  ys_units: "screen",
  fill_color: "lightgrey",
  fill_alpha: 0.5,
  line_color: "black",
  line_alpha: 1.0,
  line_width: 2,
  line_dash: [4, 4]
});

LassoSelectTool = (function(superClass) {
  extend(LassoSelectTool, superClass);

  function LassoSelectTool() {
    return LassoSelectTool.__super__.constructor.apply(this, arguments);
  }

  LassoSelectTool.prototype.default_view = LassoSelectToolView;

  LassoSelectTool.prototype.type = "LassoSelectTool";

  LassoSelectTool.prototype.tool_name = "Lasso Select";

  LassoSelectTool.prototype.icon = "bk-tool-icon-lasso-select";

  LassoSelectTool.prototype.event_type = "pan";

  LassoSelectTool.prototype.default_order = 12;

  LassoSelectTool.prototype.props = function() {
    return _.extend({}, LassoSelectTool.__super__.props.call(this), {
      select_every_mousemove: [p.Bool, true],
      overlay: [p.Instance, DEFAULT_POLY_OVERLAY]
    });
  };

  LassoSelectTool.prototype.initialize = function(attrs, options) {
    LassoSelectTool.__super__.initialize.call(this, attrs, options);
    return this.get('overlay').set('silent_update', true, {
      silent: true
    });
  };

  return LassoSelectTool;

})(SelectTool.Model);

module.exports = {
  Model: LassoSelectTool,
  View: LassoSelectToolView
};
