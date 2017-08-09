const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))

module.exports.readdir = function (path) {
  return fs.readdirAsync(path)
}
