/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('posts', {
        id: 'id',
        title: {type: 'text'},
        post_content: {type: 'text'}
    })
};

exports.down = pgm => {};
