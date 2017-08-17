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



socket.on('init', function(){
  setTimeout(function () {
    $('.boot').fadeToggle('300')
  }, 1000);
})

socket.on('queueAdd', function (data) {
  for (var i = 0; i < data.length; i++) {
    $('.menu ul').append('<li>').text(data[i])
  }
})


let triggerToggle = false
let interval
$('.trigger').click(data=>{
  triggerToggle = !triggerToggle
  const move = 90
  if (triggerToggle) {
    interval = setInterval(function(){

    },500)
    $('.menu').animate({left:'-=90vw'},1000)
    $('body').animate({marginRight:'+=90vw'},1000)
  }
  else{
    $('.menu').animate({left:'+=90vw'},1000)
    $('body').animate({marginRight:'-=90vw'},1000)
  }
})

let x = 0
setInterval(function() {
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
  x+=6
}, 25);

$('.load').click(data => {
  socket.emit('load', '/data/MUSIQUE/MUSIQUE/Adagio/Archangels in Black/01 Vamphyri.mp3')
})
$('.playPause').click(data => {
  console.log('click');
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
$('.inputSearchSpotify').change(function() {
  console.log('klj');
  $('.searchResultSpotify').empty()
  if (!$('.inputSearchSpotify').val().length) return
  sendAjax("/search/" + $('.inputSearchSpotify').val()).done(result => {
    console.log(result);
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
  }).fail((textstatus) => {
    window.location.replace("/login");
  })
})
$('body').on('click', '.spotifyItem', function(a) {
  sendAjax('/open/' + $(this).attr('id'))
})


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
