const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
const pgClient = require('./db');
const PORT = 41800

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'))

const getPosts = async () => {
    return (await pgClient.query('SELECT id, title, post_content as text FROM posts ORDER BY id DESC')).rows;
}

const createPost = async (title, text) => {
    await pgClient.query(
        'INSERT INTO posts(title, post_content) VALUES ($1, $2)',
        [title, text]
    );
}

app.get('/hello', (req, res) => {
    res.send('Hello World')
})

// Первая версия блога (Server Side Rendering)
app.get('/', async (req, res) => {
    const articles = await getPosts()
    res.render('index', {articles})
})

app.post('/', async (req, res) => {
    await createPost(req.body.title, req.body.text)
    res.redirect('/')
})

// Вторая версия блога (Запросы к API с фронтенда)
app.get('/v2', (req, res) => {
    res.render('v2')
})

app.get('/api/posts', async (req, res) => {
    const rows = await getPosts()
    res.send(rows)
})

app.post('/api/posts', async (req, res) => {
    await createPost(req.body.title, req.body.text)
    const rows = await getPosts()
    res.send(rows)
})

app.delete('/api/posts/:id', async (req, res) => {
    await pgClient.query('DELETE FROM posts WHERE id=$1', [req.params.id])
    const rows = await getPosts()
    res.send(rows)
})

app.listen(PORT, () => {
    console.log('Сервер запущен. http://127.0.0.1:' + PORT)
})