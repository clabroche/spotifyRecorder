let express = require('express')
let cp = require('child_process')
let HomeController = require('../Controllers/HomeController')
let router = express.Router()
var request = require('request')
var http = require('https');
var path = require('path');
const Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'));
const dbusCommand = 'dbus-send --print-reply '
const dbusdest = '--dest=org.mpris.MediaPlayer2.spotify '
const dbuspath = '/org/mpris/MediaPlayer2 '
const dbusmethod = 'org.mpris.MediaPlayer2.Player.'
const bdd = require(path.resolve(__dirname, '..', 'bdd.json'))
const queue = require('../modules/queue')
router.get('/', (req, res, next) => {
  new HomeController(req, res, next).index()
})

router.get('/method/:method', (req, res, next) => {
  cp.exec(dbusCommand + dbusdest + dbuspath + dbusmethod + req.params.method)
  res.sendStatus(200)
})
router.get('/search/:type/:search', (req, res, next) => {
  sendBearerRequest('https://api.spotify.com/v1/search?type='+ req.params.type+'&q=' + req.params.search).then(result=>{
    res.json(result)
  }).catch(error=>{
    console.log(error);
    res.sendStatus(401)
  })
})
router.get('/spotify', (req, res, next) => {
  const code = req.query.code
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: 'http://localhost:3000/spotify',
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer('0cc7b7a909054c3c973ee387b227ed2f' + ':' + '443130e60ed04d1bb1527683a5cc0abe').toString('base64'))
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error) {
      bdd.access_token = body.access_token
      bdd.refresh_token = body.refresh_token
      fs.writeFile(path.resolve(__dirname, '../', 'bdd.json'), JSON.stringify(bdd), 'utf8', (err, value) => {
        console.log(err, value);
      });
      res.redirect('/')
    }
  })
  // new HomeController(req, res, next).index()
})
router.get('/login', (req, res, next) => {
  res.redirect('https://accounts.spotify.com/en/authorize?show_dialog=true&response_type=code&redirect_uri=http://localhost:3000/spotify&scope=user-read-email%20user-read-private&client_id=0cc7b7a909054c3c973ee387b227ed2f')
})
router.get('/method/:method/:param', (req, res, next) => {
  cp.exec(dbusCommand + dbusdest + dbuspath + dbusmethod + req.params.method)
  res.sendStatus(200)
  // new HomeController(req, res, next).index()
})
router.get('/open/:id', async (req, res, next) => {
  const id = req.params.id.split(':')[2]
  const type = req.params.id.split(':')[1]
  console.log(id,type);
  switch (type) {
    case 'track':
      await getTrack(id)
      res.sendStatus(200)
      break;
    case 'album':
      await getAlbum(id)
      res.sendStatus(200)
      break;
    case 'artist':
      await getArtist(id)
      res.sendStatus(200)
      break;
    default:
  }
})

function getArt(url){
  return new Promise(function(resolve, reject) {
    request.get(url, {encoding: 'binary'},(err, responseArt, art) => {
      if (err) return reject(err)
      resolve(art)
    })
  })
}
function sendBearerRequest(url) {
  return new Promise(function(resolve, reject) {
    var authOptions = {
      url,
      json: true,
      headers: {
        'Authorization': 'Bearer ' + bdd.access_token
      },
    };
    request.get(authOptions, function(error, response, body) {
      if (error || body.hasOwnProperty('error')) return reject(error)
      resolve(body)
    })
  });
}

async function getTrack(id, art, several){
  if (several) {
    (await sendBearerRequest('https://api.spotify.com/v1/tracks/?ids=' + id.join(','))).tracks.map(async track=>{
      await fs.writeFileAsync('public/tmp/' + track.uri + '.jpg', art,'binary')
      queue.add(track)
    })
  } else{
    const track = await sendBearerRequest('https://api.spotify.com/v1/tracks/'+ id)
    art = art ? art : await getArt(track.album.images[0].url)
    await fs.writeFileAsync('public/tmp/' + track.uri + '.jpg', art,'binary')
    queue.add(track)
    return track
  }
}

async function getAlbum(id, several){
  if (several) {
    (await sendBearerRequest('https://api.spotify.com/v1/albums/?ids=' + id.join(','))).albums.map(async album=>{
      if (album.tracks.total > 4) {
        const arrayOfTRacksId = album.tracks.items.map(track=>{
          return track.id
        })
        const art = (await getArt(album.images[0].url))
        return await getTrack(arrayOfTRacksId, art, true)
      }
    })
  } else {
    var album = await sendBearerRequest('https://api.spotify.com/v1/albums/' + id)
    const arrayOfTRacksId = album.tracks.items.map(track=>track.id)
    const art = await getArt(album.images[0].url)
    return await getTrack(arrayOfTRacksId, art, true)
  }
}

async function getArtist(id){
  const albumRequest = await sendBearerRequest('https://api.spotify.com/v1/artists/' + id + '/albums')
  const albums = noDoublon(albumRequest.items)
  const arrayOfAlbumsId = albums.map(album=>album.id)
  return await getAlbum(arrayOfAlbumsId, true)
}

function noDoublon (array_p){
  const albumsObject = {}
  const albums = []
  array_p.map(album=>{
    albumsObject[album.name] = album
  })
  for (var albumKey in albumsObject) {
    albums.push(albumsObject[albumKey])
  }
  return albums
}
module.exports = router
