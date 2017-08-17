let express = require('express')
let cp = require('child_process')
let HomeController = require('../Controllers/HomeController')
let router = express.Router()
var request = require('request')
var http = require('https');
var fs = require('fs');
var path = require('path');
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
router.get('/search/:search', (req, res, next) => {
  sendBearerRequest('https://api.spotify.com/v1/search?type=track&q=' + req.params.search).then(result=>{
    res.json(result.tracks.items)
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
router.get('/open/:id', (req, res, next) => {
  queue.add(req.params.id)
  res.sendStatus(200)
  // new HomeController(req, res, next).index()
})

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
      if (error) {reject(error);return;}
      resolve(body)
    })
  });
}
module.exports = router
