const Queue = {}
Queue.init = function(socket) {
  this.queue = []
  // console.log(socket)
  this.io = socket
}
Queue.add = function(spotifyId) {
  this.queue.push(spotifyId)
}
Queue.get = function(){
  return this.queue.shift()
}

Queue.all = function() {
  const array = []
  for (var i = 0; i < Object.keys(this.queue).length; i++) {
    array.push(this.queue[Object.keys(this.queue)[i]])
  }
  return array;
}

Queue.remove = function(id) {
  delete this.queue[id]
}

module.exports = Queue
