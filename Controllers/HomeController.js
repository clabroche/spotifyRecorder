let Controller = require('./controller')

let homeController = class HomeController {

  constructor (req, res, next) {
    this.req = req
    this.res = res
    this.next = next
    this.controller = new Controller(req, res, next)
  }

  index () {
    this.res.render('app/home', {socket: 'home'})
  }
}

module.exports = homeController
