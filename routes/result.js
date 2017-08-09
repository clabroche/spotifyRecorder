let express = require('express')
let router = express.Router()

router.get('/chart-example', (req, res, next) => {
  res.render('app/result', {
    title: 'Chart Example'
  })
})

module.exports = router
