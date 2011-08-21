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
  audio_url: null
  post_url: null
  post_date: null
  blog_name: null
  reblog_key: null
  liked: false
  origin: null
}

Listenr.MusicController = SC.ArrayProxy.extend {
  content: []

  origin: 'dashboard' # set to dashboard by default

  addSong: (song_data)->
    song = Listenr.Song.create()
    for key, value of song_data
      if Listenr.Song.prototype.hasOwnProperty key
        song.set key, value
        if key is 'audio_url'
          song.set key, value+'?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio'

    if not song.artist then song.set 'artist', 'Unkown Artist'
    if not song.track_name then song.set 'track_name', 'Unknown Song'
    if not song.album then song.set 'album', 'Unkown Album'
    if not song.album_art then song.set 'album_art', '/img/album.png'
    # default origin is dashboard
    song.set 'origin', @origin

    @pushObject song
    console.log song_data

  loading: false

  getSongs: (offset=@content.length)->
    that = this
    if not that.loading
      that.loading = true # to avoid spawning heaps of requests
      console.log "offset #{offset}"

      audio_url = 'user/dashboard'
      if that.origin is 'likes'
        audio_url 'user/likes'
      else if that.origin isnt 'dashboard'
        audio_url = "blog/#{origin}"
      console.log audio_url

      $.getJSON audio_url, {type:'audio', offset:offset}, (data)->
        that.loading = false
        for post in data.response.posts
          if post.type is 'audio' then that.addSong post
}

Listenr.dashboardController = Listenr.MusicController.create()


($ document).ready ->
  #Listenr.dashboardController.getSongs()
  me = Listenr.User.create()
  if me.getInfo()
    Listenr.dashboardController.getSongs()

  ($ '#login').live 'click', (e)->
    # to avoid breaking out of mobile app mode
    e.preventDefault()
    window.location = ($ this).attr 'href'

  ($ '#listenr li a').live 'click', (e)->
    e.preventDefault()
    ($ '#player').attr 'src', ($ this).attr 'href'
    document.getElementById('player').play()

  ($ window).scroll (e)->
    if (($ window).scrollTop() + ($ window).height() + 150) > ($ document).height()
      # scrolled to bottom
      Listenr.dashboardController.getSongs()
