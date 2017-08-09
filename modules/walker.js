// const Promise = require("bluebird")
// const cp = require("child_process")
// const path = require("path")
// const fs = Promise.promisifyAll(require("fs"))
//
// const listFork = []
// const inactiveFork = []
// const directoriesList = []
// const FilesList = []
// const walker = {}
// walker.init = function(firstDirectory) {
//   directoriesList.push(firstDirectory)
//   for (var i = 0; i < 16; i++) {
//     const fork = cp.fork(path.join(__dirname, './walkerFork.js'))
//     console.log('fork')
//     listFork.push(fork)
//     inactiveFork.push(fork)
//     fork.on('message', function(message) {
//       if (message.hasOwnProperty('end')) {
//         inactiveFork.push(this)
//         message.data.map(element => {
//           console.log(element);
//           if (fs.statSync(element).isDirectory()) directoriesList.push(element)
//           if (fs.statSync(element).isFile()) FilesList.push(element)
//         })
//       }
//     })
//   }
//   return this
// }
// walker.launch = function() {
//   console.log('kjnfkzjefnefezjfjk')
//   var timeout
//   console.time('hey')
//   var interval = setInterval(function() {
//     console.log('in')
//     if (inactiveFork.length !== 0 && directoriesList.length !== 0) {
//       if (timeout) {
//         clearTimeout(timeout)
//       }
//       const fork = inactiveFork.shift()
//       const directory = directoriesList.shift()
//       fork.send({
//         directory
//       })
//       timeout = setTimeout(_ => {
//         clearInterval(interval)
//         console.log('end');
//         console.timeEnd('hey')
//       }, 1500)
//     }
//   },0);
// }
//
// walker.init('/home/coco/').launch()
// module.exports = walker
