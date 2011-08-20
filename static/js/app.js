(function() {
  window.Listenr = SC.Application.create();
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
      return console.log(song);
    },
    getSongs: function(offset) {
      var that;
      if (offset == null) {
        offset = 0;
      }
      that = this;
      return $.getJSON('user/dashboard', {
        type: 'audio',
        offset: offset
      }, function(data) {
        var song, _i, _len, _ref;
        _ref = data.response.posts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          song = _ref[_i];
          console.log(song);
          that.addSong(song);
        }
        return console.log(that.content);
      });
    }
  });
  ($(document)).ready(function() {
    return Listenr.dashboardController.getSongs();
  });
}).call(this);
