const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
const pgClient = require('./db');
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const PORT = 41800

function createSession(id, login, name) {
    return jwt.sign({id, login, name}, 'test', {expiresIn: '5m'})
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

const createHash = (value) => {
    return crypto
        .createHash('sha256')
        .update(value)
        .digest('hex')
}

const isCorrectJWT = (value) => {
    try {
        return jwt.verify(value, 'test')
    } catch (e) {
        return false
    }
}

const getPosts = async () => {
    const SQL = `
        SELECT p.id, p.title, p.post_content as text, p.user_id, u.login user_login, u.name user_name
        FROM posts p
        JOIN users u on u.id = p.user_id
        ORDER BY p.id DESC
    `
    return (await pgClient.query(SQL)).rows;
}

const createPost = async (title, text, userId) => {
    await pgClient.query(
        'INSERT INTO posts(title, post_content, user_id) VALUES ($1, $2, $3)',
        [title, text, userId]
    );
}

app.get('/login', (req, res) => {
    res.render('login', {loginError: null, registerError: null})
})

app.get('/logout', (req, res) => {
    res.clearCookie('session').redirect('/login')
})

app.post('/login', async (req, res) => {
    const user = (await pgClient.query(
        'SELECT id, login, name FROM users WHERE login=$1 AND password=$2',
        [req.body.login, createHash(req.body.password)]
    )).rows[0]

    if (!user) {
        res.render('login', {loginError: 'Неправильный логин или пароль', registerError: null})
        return
    }

    const session = createSession(user.id, user.login, user.name)

    res.cookie('session', session).redirect('/v2')
})

app.post('/register', async (req, res) => {
    if (req.body.password !== req.body.password2) {
        res.render('login', {loginError: null, registerError: 'Пароли не совпадают'})
        return
    }

    const user = (await pgClient.query('SELECT * FROM users WHERE login=$1', [req.body.login])).rows[0]
    if (user) {
        res.render('login', {loginError: null, registerError: 'Пользователь с таким логином уже существует'})
        return
    }

    await pgClient.query(
        'INSERT INTO users (login, name, password) VALUES ($1, $2, $3)',
        [req.body.login, req.body.name, createHash(req.body.password)]
    )

    res.render('login', {loginError: null, registerError: null})
})

app.get('/hello', (req, res) => {
    res.send('Hello World')
})

app.use((req, res, next) => {
    const jwt = isCorrectJWT(req.cookies.session)
    if (!jwt) {
        res.redirect('/login');
        return
    }

    console.log('JWT', jwt)
    req.jwt = jwt

    next()
})

// Первая версия блога (Server Side Rendering)
app.get('/', async (req, res) => {
    const articles = await getPosts()
    res.render('index', {articles})
})

app.post('/', async (req, res) => {
    await createPost(req.body.title, req.body.text, req.jwt.id)
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
    await createPost(req.body.title, req.body.text, req.jwt.id)
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