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
Queue.updateTime = function(uri, time){
  for (var i = 0; i < this.currentQueue.length; i++) {
    if(this.currentQueue[i].uri===uri) this.currentQueue[i].currentTime = time;
  }
}
Queue.getPercent = function(){
  const arrayOfTime = []
  for (var i = 0; i < this.currentQueue.length; i++) {
    arrayOfTime.push(this.currentQueue[i].currentTime)
  }
  return arrayOfTime
}
Queue.done = function(uri){
  for (var i = 0; i < this.currentQueue.length; i++) {
    if(this.currentQueue[i].uri===uri) this.doneQueue.push(this.currentQueue.splice(i,1))
  }
}
Queue.all = function() {
  return {
    doneQueue: this.doneQueue,
    currentQueue: this.currentQueue,
    queue: this.queue
  }
}

Queue.remove = function(id) {
  delete this.queue[id]
}

module.exports = Queue
