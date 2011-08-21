window.Listenr = SC.Application.create()

Listenr.User = SC.Object.extend {
  name: null
  likes: null
  blogs: null
  getInfo: ->
    $.post('user/info', (data)=>
      # not authorized, present login
      switch data.meta.status
        when 401
          source = ($ '#login_template').html()
          ($ '#listenr').html Handlebars.compile source
          return false
        when 200
          for key, value of data.response.user
            if Listenr.User.prototype.hasOwnProperty key
              @set key, value
          return true
        else
          console.log "unexpected status #{data}"
          return false
    , 'json')
}

Listenr.Song = SC.Object.extend {
  id: null
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

Listenr.songs = SC.Object.create SC.MutableArray

Listenr.MusicController = SC.ArrayProxy.extend {
  content: []

  origin: 'dashboard' # set to dashboard by default

  addSong: (song_data)->
    console.log @content
    song = Listenr.Song.create()
    for key, value of song_data
      if Listenr.Song.prototype.hasOwnProperty key
        song.set key, value
        if key is 'audio_url'
          song.set key, value+'?plead=please-dont-download-this-or-our-lawyers-wont-let-us-host-audio'

    song.set 'artist', 'Unkown Artist' unless song.artist
    song.set 'track_name', 'Unknown Song' unless song.track_name
    song.set 'album', 'Unkown Album' unless song.album
    song.set 'album_art', '/img/album.png' unless song.album_art
    # default origin is dashboard
    song.set 'origin', @origin

    unless @content.findProperty 'id', song.id
      console.log song_data
      @pushObject song

  loading: false

  getSongs: (offset=@content.length)->
    unless @loading
      @loading = true # to avoid spawning heaps of requests
      console.log "offset #{offset}"

      audio_url = 'user/dashboard'
      if @origin is 'likes'
        audio_url 'user/likes'
      else if @origin isnt 'dashboard'
        audio_url = "blog/#{origin}"
      console.log audio_url

      $.getJSON audio_url, {type:'audio', offset:offset}, (data)=>
        @loading = false
        posts = data.response.posts
        if @origin is 'likes'
          posts = data.response.liked_posts

        for post in posts
          if post.type is 'audio' then @addSong post
}

Listenr.dashboardController = Listenr.MusicController.create()
Listenr.likesController = Listenr.MusicController.create {
  origin: 'likes'
}


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
