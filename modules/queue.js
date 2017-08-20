const Queue = {}
Queue.init = function() {
  this.queue = []
  this.currentQueue = []
  this.doneQueue = []
}
Queue.add = function(spotifyId) {
  this.queue.push(spotifyId)
}
Queue.get = function(){
  const task = this.queue.shift()
  if (task!==undefined) {
    this.currentQueue.push(task)
  }
  return task
}

Queue.all = function() {
  console.log(this.currentQueue);

  return {
    currentQueue: this.currentQueue,
    queue: this.queue
  }
}

Queue.remove = function(id) {
  delete this.queue[id]
}

module.exports = Queue
