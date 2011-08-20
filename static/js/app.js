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
    audio_url: null,
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
          if (key === 'audio_url') {
            song.set(key, value + '?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio');
          }
        }
      }
      if (!song.artist) {
        song.set('artist', 'Unkown Artist');
      }
      if (!song.track_name) {
        song.set('track_name', 'Unknown Song');
      }
      if (!song.album) {
        song.set('album', 'Unkown Album');
      }
      if (!song.album_art) {
        song.set('album_art', '/img/album.png');
      }
      song.set('origin', 'dashboard');
      this.pushObject(song);
      return console.log(song_data);
    },
    loading: false,
    getSongs: function(offset) {
      var that;
      if (offset == null) {
        offset = this.content.length;
      }
      that = this;
      if (!that.loading) {
        that.loading = true;
        console.log("offset " + offset);
        return $.getJSON('user/dashboard', {
          type: 'audio',
          offset: offset
        }, function(data) {
          var song, _i, _len, _ref, _results;
          that.loading = false;
          _ref = data.response.posts;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            song = _ref[_i];
            _results.push(that.addSong(song));
          }
          return _results;
        });
      }
    }
  });
  ($(document)).ready(function() {
    var me;
    me = Listenr.User.create();
    if (me.getInfo()) {
      Listenr.dashboardController.getSongs();
    }
    ($('#login')).live('click', function(e) {
      e.preventDefault();
      return window.location = ($(this)).attr('href');
    });
    ($('#listenr li a')).live('click', function(e) {
      e.preventDefault();
      ($('#player')).attr('src', ($(this)).attr('href'));
      return document.getElementById('player').play();
    });
    return ($(window)).scroll(function(e) {
      if ((($(window)).scrollTop() + ($(window)).height() + 150) > ($(document)).height()) {
        return Listenr.dashboardController.getSongs();
      }
    });
  });
}).call(this);
