let path = require('path')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')

function middlewares (express, app, io) {
  app.use((req, res, next) => {
    res.io = io
    next()
  })

  app.use(require('node-sass-middleware')({
    src: path.join(path.dirname(require.main.filename), 'public'),
    dest: path.join(path.dirname(require.main.filename), 'public'),
    indentedSyntax: false,
    sourceMap: true,
    outputStyle: 'compressed',
    debug: true
  }))
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.use(cookieParser())
  app.use(express.static(path.join(path.dirname(require.main.filename), '/public')))
}

module.exports = middlewares
