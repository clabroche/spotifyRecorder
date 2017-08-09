/**
 * This script manages the entries for socket.io events for Master then it send it to the client
 */
const JukeBox = require('../modules/jukebox.js')
const jukebox = JukeBox.init()
let socket = (io) => {
  io.on('connection', (socket) => {
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
