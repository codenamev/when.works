var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
Backbone.$ = $;

var User = require('../models/user');
var Calendars = require('../collections/calendars');
var Availability = require('../collections/taken');

var SettingsView = require('./settings');
var AvailabilityView = require('./availability');

module.exports = Backbone.View.extend({
  el: $('body'),

  initialize: function() {
    this.config = new Backbone.Model({
      start: '10am',
      end: '6pm'
    });

    this.user = new User();

    if (this.user.load) {
      this.user.load.then(_.bind(function() {
        this.$el.removeClass('logged-out');
      }, this));
    }

    this.calendars = new Calendars();

    this.settings = new SettingsView({
      collection: this.calendars,
      model: this.config,
      user: this.user
    });

    this.availability = new Availability(null, {
      config: this.config
    });

    this.output = new AvailabilityView({
      collection: this.availability
    });

    $(document).ajaxError(function(e, xhr) {
      if (xhr.status === 401) {
        location.replace('/auth/google');
      }
    });
  }
});