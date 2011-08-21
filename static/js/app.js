(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.Listenr = SC.Application.create();
  Listenr.User = SC.Object.extend({
    name: null,
    likes: null,
    blogs: null,
    getInfo: function() {
      return $.post('user/info', __bind(function(data) {
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
                this.set(key, value);
              }
            }
            return true;
          default:
            console.log("unexpected status " + data);
            return false;
        }
      }, this), 'json');
    }
  });
  Listenr.Song = SC.Object.extend({
    id: null,
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
    dashboard: false
  });
  Listenr.songs = SC.Object.create(SC.MutableArray, {
    content: [],
    replace: function(idx, amt, objects) {
      return content.replace;
    }
  });
  Listenr.MusicController = SC.ArrayProxy.extend({
    content: [],
    dashboard: false,
    url: null,
    addSong: function(song_data) {
      var key, song, value;
      console.log(this.content);
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
      song.set('dashboard', this.dashboard);
      if (!this.content.findProperty('id', song.id)) {
        console.log(song_data);
        return this.pushObject(song);
      }
    },
    loading: false,
    getSongs: function(offset) {
      if (offset == null) {
        offset = this.content.length;
      }
      if (!this.loading) {
        this.loading = true;
        console.log("offset " + offset);
        return $.getJSON(this.url, {
          type: 'audio',
          offset: offset
        }, __bind(function(data) {
          var post, posts, _i, _len, _results;
          this.loading = false;
          posts = data.response.posts;
          if (this.origin === 'likes') {
            posts = data.response.liked_posts;
          }
          _results = [];
          for (_i = 0, _len = posts.length; _i < _len; _i++) {
            post = posts[_i];
            _results.push(post.type === 'audio' ? this.addSong(post) : void 0);
          }
          return _results;
        }, this));
      }
    }
  });
  Listenr.dashboardController = Listenr.MusicController.create({
    url: 'user/dashboard',
    dashboard: true
  });
  Listenr.likesController = Listenr.MusicController.create({
    url: 'user/likes'
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
