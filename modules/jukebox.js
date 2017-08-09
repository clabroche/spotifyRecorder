const path = "/data/MUSIQUE/MUSIQUE/Klee/Honeysuckle/02 A Thousand Ways (english version).mp3"

var mpg = require('mpg123');
var $ = require('jquery');
var id3 = require('id3-parser');
var fs = require('fs');



let player
const JukeBox = {}
JukeBox.init = function () {
  player = new mpg.MpgPlayer();
  this.infos={}
  return this
}

JukeBox.load = function (path) {
  this.path = path
  var file = fs.readFileSync(path);
  return id3.parse(file).then(tag => {
    this.infos = tag
    return this.play()
  });
}

JukeBox.play = function () {
  player.play(this.path);
  this.status = 'play'
  return {status: this.status, tag:this.infos}
}

JukeBox.playPause = function () {
  player.pause();
  this.status = (this.status==='pause') ? 'play' : 'pause'
  return {status: this.status, tag:this.infos}
}

module.exports = JukeBox
