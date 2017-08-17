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

Record.prototype.record = function(spotifyId) {
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
    const commandlaunchTrack = "dbus-send  --print-reply --session --type=method_call --dest=" + this.dbus + " /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.OpenUri string:" + spotifyId
    const launch = await bash(commandlaunchTrack);
    await helpers.blockExecution(1000)
    await stop(this.dbus)
    await helpers.blockExecution(500)
    await previous(this.dbus)
    await helpers.blockExecution(1000)
    const metadata = await getMetadata(this.dbus)
    this.rec = spawn('parec', ['-d', this.options.sink_name + '.monitor']);
    this.rec.stdout.pipe(this.encoder);
    const filename = metadata.artist + '-' + metadata.album + '-' + metadata.title + '.mp3'
    this.output = await fs.createWriteStream(filename)
    this.encoder.pipe(this.output)
    await play(this.dbus)
    console.log('recording: ' + this.output.path);
    await helpers.blockExecution(metadata.ms)
    this.output.end()

    this.rec.kill('SIGTERM')
    console.log('finish: ' + this.output.path);
    const songBuffer = fs.readFileSync(filename);
    const writer = new ID3Writer(songBuffer);
    request.get(metadata.art, (err, res, body) => {
      writer.setFrame('TIT2', metadata.title) // title
        .setFrame('TPE1', [metadata.artist]) //artist
        .setFrame('TALB', metadata.album) // album
        // .setFrame('TYER', 2004) // date
        .setFrame('TRCK', metadata.track) // track
        .setFrame('APIC', {
          type: 3,
          data: body,
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


async function getMetadata(dbus) {
  const metadataString = "dbus-send --print-reply --dest=" + dbus + " /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata'"
  const commandstatus = `dbus-send --print-reply --dest=${dbus} /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'PlaybackStatus'|egrep -A 1 "string"|cut -b 26-|cut -d '"' -f 1|egrep -v ^$`
  const commandartist = metadataString + `|egrep -A 2 "artist"|egrep -v "artist"|egrep -v "array"|cut -b 27-|cut -d '"' -f 1|egrep -v ^$`
  const commandalbum = metadataString + `|egrep -A 1 "album"|egrep -v "album"|cut -b 44-|cut -d '"' -f 1|egrep -v ^$`
  const commandlength = metadataString + `|egrep -A 1 "length"|egrep -v "length"|cut -b 43-|cut -d '"' -f 1|egrep -v ^$`
  const commandarturl = metadataString + `|egrep -A 1 "artUrl"|egrep -v "artUrl"|cut -b 44-|cut -d '"' -f 1|egrep -v ^$`
  const commandtrack = metadataString + `|egrep -A 1 "trackNumber"|egrep -v "trackNumber"|cut -b 41-|cut -d '"' -f 1|egrep -v ^$`
  const commandtitle = metadataString + `|egrep -A 1 "title"|egrep -v "title"|cut -b 44-|cut -d '"' -f 1|egrep -v ^$`
  return {
    artist: await bash(commandartist),
    album: await bash(commandalbum),
    title: await bash(commandtitle),
    track: await bash(commandtrack),
    status: await bash(commandstatus),
    art: await bash(commandarturl),
    ms: +(await bash(commandlength)) / 1000
  }
}

module.exports = Record