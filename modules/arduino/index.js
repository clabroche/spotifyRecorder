const cp = require('child_process')
var SerialPort = require('serialport');



function Arduino() {
  this.maxColumn = 16
  this.maxLine = 2
  this.watch = ''
}

Arduino.prototype.initBoard = async function (){
  const board = await this.searchForaBoard()
  console.log(board);
  this.createASerialPort(board)
}
Arduino.prototype.createASerialPort = function (board){
  this.port = new SerialPort(board);
  this.port.on('error', async (err)=> {
    console.log('Error: ', err.message);
    this.initBoard().catch(err=>console.log(err))
  })
}
Arduino.prototype.searchForaBoard = function (){
  return new Promise((resolve, reject) => {
    cp.exec('ls /dev/ttyA*',async (err,stdout,stderr)=>{
      if (err || stderr) return await this.searchForaBoard()
      resolve(stdout.trim())
    })
  })
}

Arduino.prototype.write = function (){
  return new Promise((resolve, reject) => {
    this.port.write(this.watch, (err) => {
      if (err) return reject(err)
      resolve(this)
    })
  })
}

Arduino.prototype.initWatcher = function (){
  this.watchInterval = setInterval(async _ => {
    await this.write(this.watch).catch(async err=>{
      await this.initBoard()
    })
  },700)
  return this
}
Arduino.prototype.updateWatcher = function (data){
  this.watch = data
  return this
}

Arduino.prototype.percentToString = function(percent){
  const unit= ~~((this.maxColumn*percent)/100)
  const rest = ~~(((((((this.maxColumn*percent)/100) - unit).toFixed(1)*10)*5)/100)*10)
  let result = ''
  for (var i = 0; i < unit; i++) {result += 5}
  if (rest) result += rest
  for (var i = 0; i < this.maxColumn - (unit + 1); i++) { result+=0}

  if (result.length < this.maxColumn) {
    for (var i = 0; i < this.maxColumn - result.length; i++) {result+=0}
  }
  if (result.length > this.maxColumn) {
    for (var i = 0; i < result.length - this.maxColumn; i++) {result = result.slice(0, -1)}
  }

  return result
}

async function launcher(arduino){
  await arduino.initBoard()
  await arduino.initWatcher()
  return arduino
}


const arduino  = new Arduino()
launcher(arduino).then(data=>{

}).catch(err=>console.error(err))
//
//
// arduino.updateWatcher('Bonjour Julien!')
// setTimeout(function () {
//   arduino.updateWatcher("67 67 67")
// }, 8000);

//
//
// let percent1 = 0
// let percent2 = 0
// const interval = setInterval(function () {
//   if (percent1>100) {
//     clearInterval(interval)
//     percent1=100
//     return
//   }
//   percent1 += ~~(Math.random()*10)
//   arduino.updateWatcher(arduino.percentToString(percent1,arduino.maxColumn)+arduino.percentToString(percent2,arduino.maxColumn))
// }, 500);
// const interval2 = setInterval(function () {
//   if (percent2>100) {
//     clearInterval(interval)
//     percent2=100
//     return
//   }
//   percent2 += ~~(Math.random()*10)
//   arduino.updateWatcher(arduino.percentToString(percent1,arduino.maxColumn)+arduino.percentToString(percent2,arduino.maxColumn))
// }, 500);

module.exports = Arduino
