const express = require('express')
const ejs = require('ejs')

const app = express()
const port = 3000

app.get('/', (req, res) => {
    let userName = 'Matthew'
    let data = {
        userName: userName,
    }
    ejs.renderFile('views/index.ejs', data, (err, str) => {
        res.send(str)
    })
})

app.listen(port, () => console.log('App is listening'))
