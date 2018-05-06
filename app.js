const express = require('express')
const app = express()
const mysql = require('mysql')
const port = process.env.PORT || 80
const bodyParser = require('body-parser')

let dbConfig = {
  host: 'r42ii9gualwp7i1y.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
  user: 'p2hciinv2srjqdxx',
  password: 'q3337byt1i72bh5i',
  database: 'mipitvogc1id56n4',
  port: '3306'
}

let db

function handleDisconnect () {
  db = mysql.createConnection(dbConfig) // Recreate the db, since
  // the old one cannot be reused.
  db.connect(function (err) { // The server is either down
    if (err) { // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err)
      setTimeout(handleDisconnect, 2000) // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }) // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  db.on('error', function (err) {
    console.log('db error', err)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect() // lost due to either server restart, or a
    } else { // connnection idle timeout (the wait_timeout
      throw err // server variable configures this)
    }
  })
}
handleDisconnect()
app.listen(port)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

let res

app.get('/createguestbook', (req, res) => {
  let sql = 'CREATE TABLE guestbook(id int AUTO_INCREMENT, name VARCHAR(255), PRIMARY KEY (id))'
  db.query(sql, (err, result) => {
    if (err) throw err
    console.log('result')
    res.send('Table created')
  })
})

app.get('/guestbook', function (req, res) {
  let sql = 'SELECT * FROM guestbook'
  let content = []
  let query = db.query(sql, (err, results) => {
    if (err) throw err
    results.forEach((row) => {
      content.push(row.name)
    })
    res.json(content)
  })
})

app.post('/addguest', function (req, res) {
  var query = "INSERT INTO ??(??) VALUES (?)"
  var inserts = ['guestbook', 'name', req.body.name]
  sql = mysql.format(query, inserts);
  query = mysql.format(query,inserts)
  db.query(query,function(err,rows){
    if(err) {
        res.json("Error executing MySQL query")
    }
  })
})

app.get('/deleteallguests/', (req, res) => {
  let sql = `TRUNCATE TABLE guestbook`
  let query = db.query(sql, (err, result) => {
    if (err) throw err
    console.log('Deleted all guests')
    res.send('Deleted all guests')
  })
})

app.post('/test', (req, res) => {
  res.send(req.body.name)
  console.log(req.body.name)
})

app.get('/', function (req, res) {
  res.json('This is the RestAPI for Svahnen')
})

console.log(`App listening on port ${ port }`)
