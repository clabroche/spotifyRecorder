/* classe generique pour les controlleurs */
let controller = class Controller {
  constructor (req, res, next) {
    this.req = req
    this.res = res
    this.next = next
  }
}
module.exports = controller
