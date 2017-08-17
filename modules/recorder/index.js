const cp = require('child_process')
const path = require('path')
const Recorder = require('./recorder')
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const helpers = require('./helpers')

function SwitcherSink() {
  this.recorders = {}
  return new Promise(async(resolve, reject) => {
    await bash('pactl unload-module module-null-sink').catch(err => console.log('heeyyyyyyyyyyyyyy !!!'))
    console.log('Launch spotify...');
    for (var i = 0; i < 2; i++) {
      const sink_name = 'recorder-' + i
      await bash('pacmd load-module module-null-sink sink_name=' + sink_name)
      await bash('pacmd update-sink-proplist ' + sink_name + ' device.description=' + sink_name)
      this.recorders[sink_name] = {}
      console.log('create sink: ' + sink_name);
      this.forks = []
      this.forks.push(cp.fork(path.resolve(__dirname, 'spotify')))
    }
    await helpers.blockExecution(2000)
    console.log('Init sinks...');
    this.sinks = await getSinks()
    await helpers.blockExecution(2000)
    console.log('Init dbus...');
    this.dbus = await getDBus()
    this.inactiveRecorders = Object.keys(this.sinks)
    for (var i = 0; i < this.inactiveRecorders.length; i++) {
      console.log('Init spotify n°' + i + ' destination:' + this.dbus[i]);
      this.sinks[this.inactiveRecorders[i]].dbus = this.dbus[i]
      stop(this.dbus[i])
      await helpers.blockExecution(200)
      play(this.dbus[i])
      await helpers.blockExecution(200)
      stop(this.dbus[i])
      this.sinks[this.inactiveRecorders[i]].recorder = new Recorder({
        sink_name: this.sinks[this.inactiveRecorders[i]].name,
        dbus: this.dbus[i]
      })
    }
    await helpers.blockExecution(1000)
    this.inputs = await getInputs()
    this.sinks = await moveSinks(this.sinks, this.inputs)
    this.watcher = setInterval(() => {
      if (this.inactiveRecorders.length !== 0) this.emit('askTask')
    }, 100);
    resolve(this)
    // console.log(this.sinks);
  });
}

SwitcherSink.prototype.record = function(uri) {
  if (uri) {
    const recorder = this.sinks[this.inactiveRecorders.shift()].recorder
    recorder.record(uri).then(sink_name=>{
      this.inactiveRecorders.push(sink_name)
      this.emit('askTask')
    })
  }
}

async function moveSinks(sinks, inputs) {
  for (var i = 0; i < Object.keys(sinks).length; i++) {
    const sink = sinks[Object.keys(sinks)[i]]
    sink.input = inputs[i]
    await bash('pactl move-sink-input ' + sink.input + ' ' + sink.id)
  }
  return sinks
}


function play(destination) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + destination + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Play'
  return bash(commandplay)
}

function stop(destination) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + destination + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Stop'
  return bash(commandplay)
}

function playPause(destination) {
  const commandplay = 'dbus-send  --print-reply --session --type=method_call --dest=' + destination + ' /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause'
  return bash(commandplay)
}

SwitcherSink.prototype.switch = async function() {
  const sinks = await getSinks()
}

async function getSinks() {
  const line = await bash('pactl list short sinks')
  const sinks = {}
  line.split('\n').map(line => {
    const prop = line.split('\t')
    if (prop[1].includes('recorder')) {
      sinks[prop[1]] = {}
      sinks[prop[1]].id = prop[0]
      sinks[prop[1]].name = prop[1]
      sinks[prop[1]].module = prop[2]
      sinks[prop[1]].infos = prop[3]
      sinks[prop[1]].state = prop[4]
    }
  })
  return sinks
}


async function getInputs() {
  const line = await bash('pactl list sink-inputs')
  const inputs = []
  let currentsink
  let idCurrentSink
  line.split('\n').map(line => {
    if (line.includes('Sink Input')) currentsink = line.split('#')[1]
    if (line.includes('application.name = "Spotify"')) inputs.push(currentsink)
  })
  return inputs
}




async function getDBus() {
  return new Promise(async function(resolve, reject) {
    const line = await bash('dbus-send --print-reply --dest=org.freedesktop.DBus /org/freedesktop/DBus org.freedesktop.DBus.ListQueuedOwners string:org.mpris.MediaPlayer2.spotify')
    const dbus = []
    line.split('\n').map(line => {
      if (line.includes('string')) {
        console.log('dbus: ' + line.split('"')[1]);
        dbus.push(line.split('"')[1])
      }
    })
    resolve(dbus)
  })
}

function bash(command) {
  return new Promise(function(resolve, reject) {
    cp.exec(command, (err, stdout, stderr) => {
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
util.inherits(SwitcherSink, EventEmitter);
module.exports = SwitcherSink
