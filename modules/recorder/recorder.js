const lame = require('lame');
const ID3Writer = require('browser-id3-writer');
const path = require('path');
const fs = require('fs')
var request = require('request').defaults({
  encoding: null
});
const helpers = require('./helpers')
const URL = require('url');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

function Record(options) {
  this.options = options || {}

}


// create the Encoder instance

Record.prototype.record = function(track) {
  return new Promise(async(resolve, reject) => {
    this.encoder = new lame.Encoder({
      // input
      channels: 2, // 2 channels (left and right)
      bitDepth: 16, // 16-bit samples
      sampleRate: 44100, // 44,100 Hz sample rate

      // output
      bitRate: 320,
      outSampleRate: 44100,
      mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
    });
    if (this.options.hasOwnProperty('dbus')) {
      this.dbus = this.options.dbus
    }
    const commandlaunchTrack = "dbus-send  --print-reply --session --type=method_call --dest=" + this.dbus + " /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.OpenUri string:" + track.uri
    await bash(commandlaunchTrack);
    await helpers.blockExecution(1000)
    await stop(this.dbus)
    await helpers.blockExecution(500)
    await previous(this.dbus)
    await helpers.blockExecution(1000)
    this.rec = spawn('parec', ['-d', this.options.sink_name + '.monitor']);
    this.rec.stdout.pipe(this.encoder);
    const filename = track.artists[0].name + '-' + track.album.name + '-' + track.name + '.mp3'
    this.output = await fs.createWriteStream(filename)
    this.encoder.pipe(this.output)
    await play(this.dbus)
    console.log('recording: ' + this.output.path);
    await helpers.blockExecution(track.duration_ms)
    this.output.end()

    this.rec.kill('SIGTERM')
    console.log('finish: ' + this.output.path);
    const songBuffer = fs.readFileSync(filename);
    const writer = new ID3Writer(songBuffer);
    request.get(track.album.images[0].url, (err, res, art) => {
      if (err) {
        reject(err)
      }
      writer.setFrame('TIT2', track.name) // title
        .setFrame('TPE1', [track.artists[0].name]) //artist
        .setFrame('TALB', track.album.name) // album
        // .setFrame('TYER', 2004) // date
        .setFrame('TRCK', track.track_number) // track
        .setFrame('APIC', {
          type: 3,
          data: art,
          description: 'Super picture'
        });
      writer.addTag();
      const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
      fs.writeFileSync(filename, taggedSongBuffer);
      resolve(this.options.sink_name)
    });
  });
}

function bash(command) {
  return new Promise(function(resolve, reject) {
    exec(command, (err, stdout, stderr) => {
      if (err || stderr) {
        console.log(err, stderr);
        return reject({
          err,
          stderr
        })
      }
      resolve(stdout.trim())
    })
  });
}

function play(dbus) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + dbus + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause'
  return bash(commandplay)
}


function stop(dbus) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + dbus + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Stop'
  return bash(commandplay)
}


function previous(dbus) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + dbus + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous'
  return bash(commandplay)
}
module.exports = Record
