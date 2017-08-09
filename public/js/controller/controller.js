let socket = io('http://corentinlabroche.ddns.net:3000')
// Recuperation des serveurs deja connecte
socket.on('connection', (init) => {
  console.log('connection');
})



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
  }).fail((textstatus)=>{
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
