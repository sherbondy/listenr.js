(function() {
  window.Listenr = SC.Application.create();
  Listenr.User = SC.Object.extend({
    name: null,
    likes: null,
    blogs: null,
    getInfo: function() {
      var that;
      that = this;
      return $.post('user/info', function(data) {
        var key, source, value, _ref;
        switch (data.meta.status) {
          case 401:
            source = ($('#login_template')).html();
            ($('#listenr')).html(Handlebars.compile(source));
            return false;
          case 200:
            _ref = data.response.user;
            for (key in _ref) {
              value = _ref[key];
              if (Listenr.User.prototype.hasOwnProperty(key)) {
                that.set(key, value);
              }
            }
            return true;
          default:
            console.log("unexpected status " + data);
            return false;
        }
      }, 'json');
    }
  });
  Listenr.Song = SC.Object.extend({
    postID: null,
    artist: null,
    track_name: null,
    album: null,
    album_art: null,
    caption: null,
    post_url: null,
    post_date: null,
    blog_name: null,
    reblog_key: null,
    liked: false,
    origin: null
  });
  Listenr.dashboardController = SC.ArrayProxy.create({
    content: [],
    addSong: function(song_data) {
      var key, song, value;
      song = Listenr.Song.create();
      for (key in song_data) {
        value = song_data[key];
        if (Listenr.Song.prototype.hasOwnProperty(key)) {
          song.set(key, value);
        }
      }
      song.set('origin', 'dashboard');
      this.pushObject(song);
      return console.log(song.album_art);
    },
    getSongs: function(offset) {
      var that;
      if (offset == null) {
        offset = this.content.length;
      }
      that = this;
      return $.getJSON('user/dashboard', {
        type: 'audio',
        offset: offset
      }, function(data) {
        var song, _i, _len, _ref, _results;
        _ref = data.response.posts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          song = _ref[_i];
          _results.push(that.addSong(song));
        }
        return _results;
      });
    }
  });
  ($(document)).ready(function() {
    var me;
    me = Listenr.User.create();
    if (me.getInfo()) {
      Listenr.dashboardController.getSongs();
    }
    return ($(window)).scroll(function(e) {
      if ((($(window)).scrollTop() + ($(window)).height() + 150) > ($(document)).height()) {
        return Listenr.dashboardController.getSongs();
      }
    });
  });
}).call(this);
