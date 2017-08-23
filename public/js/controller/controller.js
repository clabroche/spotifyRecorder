const bootInterval = setInterval(function() {
  $('.anim').css({
    background: "radial-gradient(rgba(0,0,0,0.1)60%,rgba(0,0,0,1) 100%)",
    width: "+=6px",
    height: "+=6px"
  })
  if (x > ~~($('body').height() / 1.8)) {
    x = 0
    $('.anim').css({
      width: "0px",
      height: "0px"
    })
  }
  x += 6
  console.log('lk');
}, 25);
let socket = io('http://localhost:3000')
// Recuperation des serveurs deja connecte
socket.on('connection', (init) => {
  console.log(init);
})
socket.emit('connection', true)
$('body').append(
  $('<div>').addClass('boot').append(
    $('<div>').addClass('anim').append(
      $('<div>').addClass('logo').text('SpotiRecorder')
    )
  )
)

$('input').focusin(function (data){
  $(this).animate({
    width:'100%'
  },500)
})

$('input').focusout(function (data){
  $(this).animate({
    width:'75px'
  },500)
})


let searchItem = false
$('.searchItem').click(function() {
  if (!searchItem) {
    searchItem = true
    $('.search').css({
      display: 'inline-block'
    })
    $('.search').animate({
      width: '90vw'
    }, 100)
  } else {
    searchItem = false
    $('.search').animate({
      width: '0'
    }, 100, function() {
      $('.search').css({
        display: 'none'
      })
    })
  }
})
socket.on('init', function() {
  setTimeout(function() {
    $('.boot').fadeToggle('300')
    clearInterval(bootInterval)
  }, 1000);
})

socket.on('getDownload', data => {

  $('.menu ul').empty()

  for (var i = 0; i < data.queue.length; i++) {
    $('.waitingQueue ul').append(createQueue(data.queue[i]))
  }
  for (var i = 0; i < data.currentQueue.length; i++) {
    $('.currentQueue ul').append(createCurrentQueue(data.currentQueue[i]))
  }
  for (var i = 0; i < data.currentQueue.length; i++) {
    $('.doneQueue ul').append(createCurrentQueue(data.doneQueue[i]))
  }
})


function createCurrentQueue(data) {
  const percent = ~~((data.currentTime * 100) / data.duration_ms)
  console.log(percent);
  return $('<li>').append(
    $('<div>').addClass('cover').css({
      'backgroundImage': 'url("/tmp/' + data.uri + '.jpg")'
    }),
    $('<div>').addClass('name').text(data.artists[0].name + '-' + data.album.name + '-' + data.name),
    $('<div>').addClass('progressbar').append(
      $('<div>').addClass('progressbarInternal').css({
        'width': percent + '%'
      })
    )
  )
}

function createQueue(data) {
  if (data.artists === undefined) {
    console.log(data);
    return
  }
  return $('<li>').append(
    $('<div>').addClass('cover').css({
      'backgroundImage': 'url("/tmp/' + data.uri + '.jpg")'
    }),
    $('<div>').addClass('name').text(data.artists[0].name + '-' + data.album.name + '-' + data.name),
  )
}
let triggerToggle = false
let interval
$('.trigger').click(data => {
  triggerToggle = !triggerToggle
  const move = 90
  if (triggerToggle) {
    interval = setInterval(function() {
      socket.emit('getDownload')
    }, 500)
    $('.menu').animate({
      left: '-=90vw'
    }, 100)
  } else {
    clearInterval(interval)
    $('.menu').animate({
      left: '+=90vw'
    }, 100)
  }
})

let x = 0

$('.load').click(data => {
  socket.emit('load', '/data/MUSIQUE/MUSIQUE/Adagio/Archangels in Black/01 Vamphyri.mp3')
})
$('.playPause').click(data => {
  socket.emit('playPause')
})


socket.on('playPause', function(data) {
  setInfos(data.tag)
  if (data.status === "pause") {
    $('.playPause').text('play')
    return;
  }
  $('.playPause').text('pause')
});

$('.playPauseSpotify').click(_ => {
  sendAjax("/method/PlayPause")
})
$('.nextSpotify').click(_ => {
  sendAjax("/method/Next")
})
$('.previousSpotify').click(_ => {
  sendAjax("/method/Previous")
})
$('.stopSpotify').click(_ => {
  sendAjax("/method/Stop")
})
$(function() {
  $('.inputSearchSpotify').change(function() {
    $('.searchResultSpotify').empty()
    if (!$('.inputSearchSpotify').val().length) return
    console.log($(this).prop('id'));
    let ajaxPromise
    switch ($(this).prop('id')) {
      case 'track':
        ajaxPromise = sendAjax("/search/track/" + $('.inputSearchSpotify#track').val()).done(result=>{
          HTMLSearchtrack(result)
        })
        break;
      case 'album':
        ajaxPromise = sendAjax("/search/album/" + $('.inputSearchSpotify#album').val()).done(result=>{
          HTMLSearchAlbum(result)
        })
        break;
      case 'artist':
        ajaxPromise = sendAjax("/search/artist/" + $('.inputSearchSpotify#artist').val()).done(result=>{
          HTMLSearchArtists(result)
        })
        break;
      default:
        ajaxPromise = new Promise()
    }
    ajaxPromise.fail((textstatus) => {
      window.location.replace("/login");
    })

  })
})
$('body').on('click', '.spotifyItem', function(a) {
  sendAjax('/open/' + $(this).attr('id'))
})
function HTMLSearchtrack(result){
  result = result[Object.keys(result)[0]].items
  for (i = 0; i < result.length; i++) {
    const artistDiv = $('<div>').addClass('artistSpotify').text(result[i].name)
    const artDiv = $('<div>').addClass('art').css({
      background: 'url(' + result[i].album.images[0].url + ') no-repeat center',
      backgroundSize: 'cover',
    })
    const item = $('<div>').addClass('spotifyItem').attr({
      'id': result[i].uri
    }).append(artDiv, artistDiv)
    $('.searchResultSpotify').append(item)
  }
}
function HTMLSearchAlbum(result){
  result = result[Object.keys(result)[0]].items
  console.log(result);
  for (i = 0; i < result.length; i++) {
    const artistDiv = $('<div>').addClass('artistSpotify').text(result[i].artists[0].name)
    const artDiv = $('<div>').addClass('art').css({
      background: 'url(' + result[i].images[0].url + ') no-repeat center',
      backgroundSize: 'cover',
    })
    const item = $('<div>').addClass('spotifyItem').attr({
      'id': result[i].uri
    }).append(artDiv, artistDiv)
    $('.searchResultSpotify').append(item)
  }
}

function HTMLSearchArtists(result){
  result = result[Object.keys(result)[0]].items
  console.log(result);
  for (i = 0; i < result.length; i++) {
    const artistDiv = $('<div>').addClass('artistSpotify').text(result[i].name)
    const artDiv = $('<div>').addClass('art').css({
      background: 'url(' + result[i].images[0].url + ') no-repeat center',
      backgroundSize: 'cover',
    })
    const item = $('<div>').addClass('spotifyItem').attr({
      'id': result[i].uri
    }).append(artDiv, artistDiv)
    $('.searchResultSpotify').append(item)
  }
}

function setInfos(tags) {
  $('.currentArtist').text(tags.artist)
  $('.currentAlbum').text(tags.album)
  $('.currentTitle').text(tags.title)
}


function sendAjax(url) {
  return $.ajax({
    url,
    method: "get"
  });
}
