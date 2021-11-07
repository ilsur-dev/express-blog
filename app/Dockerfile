FROM node:14.7.0-alpine

COPY . /app
WORKDIR /app

RUN yarn
CMD yarn migrate up && yarn start