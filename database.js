require('dotenv').config()
const moment = require('moment')
const { Pool } = require('pg')
const pool = Pool()

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  console.log(typeof moment().format())
  pool.end()
})
