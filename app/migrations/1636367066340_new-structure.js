/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropTable('posts')

    pgm.createTable('users', {
        id: 'id',
        login: {type: 'text', notNull: true},
        name: {type: 'text', notNull: false},
        password: {type: 'text', notNull: true},
    })

    pgm.createIndex('users', 'id')
    pgm.createIndex('users', 'login')

    pgm.createTable('posts', {
        id: 'id',
        user_id: {
            type: 'integer',
            references: '"users"',
            onDelete: 'cascade',
            notNull: true
        },
        title: {type: 'text'},
        post_content: {type: 'text'}
    })
};

exports.down = pgm => {};
