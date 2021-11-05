const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
const PORT = 41800

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'))

let articles = [
    {title: 'Пример', text: 'Lorem ipsum'}
]

app.get('/hello', (req, res) => {
    res.send('Hello World')
})

// Первая версия блога (Server Side Rendering)
app.get('/', (req, res) => {
    res.render('index', {articles})
})

// Вторая версия блога (Запросы к API с фронтенда)
app.get('/v2', (req, res) => {
    res.render('v2')
})

app.post('/', (req, res) => {
    articles.unshift({title: req.body.title, text: req.body.text})
    res.redirect('/')
})

app.get('/api/posts', (req, res) => {
    res.send(articles)
})

app.post('/api/posts', (req, res) => {
    articles.unshift({title: req.body.title, text: req.body.text})
    res.send(articles)
})

app.delete('/api/posts/:index', (req, res) => {
    articles.splice(req.params.index, 1)
    res.send(articles)
})

app.listen(PORT, () => {
    console.log('Сервер запущен. http://127.0.0.1:' + PORT)
})