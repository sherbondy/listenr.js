window.Listenr = SC.Application.create()

Listenr.User = SC.Object.extend {
  name: null
  likes: null
  blogs: null
  getInfo: ->
    that = this

    $.post('user/info', (data)->
      # not authorized, present login
      switch data.meta.status
        when 401
          source = ($ '#login_template').html()
          ($ '#listenr').html Handlebars.compile source
          return false
        when 200
          for key, value of data.response.user
            if Listenr.User.prototype.hasOwnProperty key
              that.set key, value
          return true
        else
          console.log "unexpected status #{data}"
          return false
    , 'json')
}

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
    console.log song.album_art

  getSongs: (offset=this.content.length)->
    that = this
    $.getJSON 'user/dashboard', {type:'audio', offset:offset}, (data)->
      for song in data.response.posts
        that.addSong song
}

($ document).ready ->
  #Listenr.dashboardController.getSongs()
  me = Listenr.User.create()
  if me.getInfo()
    Listenr.dashboardController.getSongs()

  ($ window).scroll (e)->
    if (($ window).scrollTop() + ($ window).height() + 150) > ($ document).height()
      # scrolled to bottom
      Listenr.dashboardController.getSongs()
