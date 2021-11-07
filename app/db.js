const pg = require('pg')


function initPostgres() {
    const pgClient = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    })

    pgClient.connect()
        .then(() => console.log('Подключение к базе данных установлено'))
        .catch((err) => {
            console.error(err)
            console.error('Не удалось подключиться к базе данных');
            process.exit(1)
        })

    return pgClient
}

module.exports = initPostgres();