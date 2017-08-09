const Promise = require("bluebird")
const path = require("path")


const fs = Promise.promisifyAll(require("fs"))


process.on('message', async function (message){
  const files = await fs.readdirAsync(message.directory)
  for (var i = 0; i < files.length; i++) {
    files[i] = path.join(message.directory, files[i])
  }
  process.send({end:true, data:files})
})
