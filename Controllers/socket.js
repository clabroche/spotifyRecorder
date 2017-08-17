/**
 * This script manages the entries for socket.io events for Master then it send it to the client
 */
const JukeBox = require('../modules/jukebox.js')
const jukebox = JukeBox.init()

var queue = require('../modules/queue')
const Manager = require('../modules/app')

let init = false
let socket = (io) => {
  queue.init(io)
  // new Manager().then(self=>{
  //   self.launch()
  //   init = true
  // })
  init=true
  io.on('connection', (socket) => {
    socket.on('connection', async (path) => {
      console.log('iiiiiiiiiiniiiiiiiiiiiiiiit' + init);
      const interval = setInterval(function () {
        if (init) {
          clearInterval(interval)
          io.emit('init',true)
        }
      }, 100);
      socket.emit('queueAdd',queue.all())
    })
    socket.on('load', async (path) => {
      const result = await jukebox.load(path)
      socket.emit('playPause',result)
    })
    socket.on('playPause', () => {
      const result = jukebox.playPause()
      socket.emit('playPause',result)
    })
  })
}
module.exports = socket
