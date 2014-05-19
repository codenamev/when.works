define(function(require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  var User = require('models/user');
  var Calendars = require('collections/calendars');
  var Availability = require('collections/taken');

  var SettingsView = require('views/settings');
  var AvailabilityView = require('views/availability');
  var Timeblock = require('jsx!templates/timeblock');

  var React = require('react');

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

      // this.renderTimeblock();

    },

    renderTimeblock: function(){
      this.timeblock = React.renderComponent(
        Timeblock({
          availability: this.availability,
          config: this.config
        }),
        this.$('.availability').get(0)
      );

      var changeEvents = [
        'change:ignoreWeekend',
        'change:start',
        'change:end',
        'change:showUnavailable',
        'change:timezone',
        'change:minDuration'
      ].join(' ');

      this.config.on(changeEvents, function(){
        this.timeblock.setProps({ config: this.config });
      }, this);

      this.availability.on('sync', function(){
        this.timeblock.setProps({ availability: this.availability });
      }, this);
    }
  });
});
