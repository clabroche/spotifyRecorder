const SwitcherSink = require('./recorder/index.js')
const queue = require('./queue')




function Manager(options) {
  return new Promise(async(resolve, reject) => {
    this.options = options || {}
    const arrayOfURI = [
      'spotify:track:5IZrYAADNOeNCOxNVZO9g6',
      'spotify:track:4gMNkh3C44MRyLFJgp5zMd',
      'spotify:track:3sHH7lklbfpcraDDvYnjo7',
      'spotify:track:78TgV6o1Sh4i26GNi57W95'
    ]
    this.switcher = await new SwitcherSink()
    resolve(this)
  });
}

Manager.prototype.launch = function() {
  this.switcher.on('askTask', (data) => {
    const spotifyId = queue.get()
    if (spotifyId) {
      console.log(spotifyId);
      this.switcher.record(spotifyId)
    }
  })
}

module.exports = Manager
