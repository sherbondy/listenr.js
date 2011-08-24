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
  dashboard: false
}

Listenr.songs = []

Listenr.MusicController = SC.ArrayProxy.extend {
  content: Listenr.songs
  propertyToFilter: null
  filterValue: true
  filteredContent: ->
    @content.filterProperty @propertyToFilter, @filterValue

  offset: 0
  origin: null
  url: null

  addSong: (song_data)->
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
    song.set 'dashboard', (@origin is 'dashboard')
    song.set 'liked', (@origin is 'likes')

    unless @content.findProperty 'id', song.id
      @pushObject song

  loading: false

  getSongs: (offset=@offset)->
    unless @loading
      @loading = true # to avoid spawning heaps of requests
      console.log "offset #{offset}"

      $.getJSON @url, {type:'audio', offset:offset}, (data)=>
        @loading = false
        posts = data.response.posts
        if @origin is 'likes'
          posts = data.response.liked_posts

        @offset += posts.length

        for post in posts
          # need to explicitly check the post type
          # because liked posts can't be filtered by type
          if post.type is 'audio' then @addSong post

        console.log @content
}

Listenr.dashboardController = Listenr.MusicController.create {
  url: 'user/dashboard'
  origin: 'dashboard'
  propertyToFilter: 'dashboard'
}
Listenr.likesController = Listenr.MusicController.create {
  url: 'user/likes'
  origin: 'likes'
  propertyToFilter: 'liked'
}

Listenr.currentController = Listenr.dashboardController


($ document).ready ->
  #Listenr.dashboardController.getSongs()
  me = Listenr.User.create()
  if me.getInfo()
    Listenr.currentController.getSongs()

  ($ '#login').live 'click', (e)->
    # to avoid breaking out of mobile app mode
    e.preventDefault()
    window.location = ($ this).attr 'href'

  ($ '#listenr li a').live 'click', (e)->
    e.preventDefault()
    ($ '#listenr li').removeClass 'playing'
    ($ this).parent('li').addClass 'playing'
    ($ '#player').attr 'src', ($ this).attr 'href'
    document.getElementById('player').play()

  ($ window).scroll (e)->
    if (($ window).scrollTop() + ($ window).height() + 150) > ($ document).height()
      # scrolled to bottom
      Listenr.currentController.getSongs()
