window.Listenr = SC.Application.create()

Listenr.Song = SC.Object.extend {
  postID: null
  artist: null
  track_name: null
  album: null
  album_art: null
  caption: null
  post_url: null
  post_date: null
  blog_name: null
  reblog_key: null
  liked: false
  origin: null
}

Listenr.dashboardController = SC.ArrayProxy.create {
  content: []

  addSong: (song_data)->
    song = Listenr.Song.create()
    for key, value of song_data
      if Listenr.Song.prototype.hasOwnProperty key
        song.set key, value
    song.set 'origin', 'dashboard'
    this.pushObject song
    console.log song

  getSongs: (offset=0)->
    that = this
    $.getJSON 'user/dashboard', {type:'audio', offset:offset}, (data)->
      for song in data.response.posts
        console.log song
        that.addSong song

      console.log that.content
}

($ document).ready ->
  Listenr.dashboardController.getSongs()
